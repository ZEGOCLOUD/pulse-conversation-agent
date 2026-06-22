#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const repo = option('--repo') || 'ZEGOCLOUD/pulse-conversation-agent';
const channel = option('--channel') || 'preview';
const installRoot = path.resolve(option('--install-dir') || './pulse');
const version = option('--version');
const dryRun = hasFlag('--dry-run');

const release = version
  ? await githubJson(`/repos/${repo}/releases/tags/${encodeURIComponent(version)}`)
  : await latestRelease(repo, channel);

if (!release) {
  throw new Error(`No GitHub release found for ${repo} channel=${channel}`);
}

const assets = Array.isArray(release.assets) ? release.assets : [];
const manifestAsset = assets.find(asset => asset.name === 'artifact-manifest.json');
const tgzAsset = assets.find(asset => /\.tgz$/.test(asset.name) && asset.name.includes('pulse-conversation-agent-gateway'));
const checksumAsset = assets.find(asset => asset.name === `${tgzAsset?.name || ''}.sha256`) || assets.find(asset => /\.tgz\.sha256$/.test(asset.name));
if (!manifestAsset || !tgzAsset || !checksumAsset) {
  throw new Error(`Release ${release.tag_name} must contain artifact-manifest.json, .tgz, and .tgz.sha256 assets.`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pulse-install-'));
const manifestPath = path.join(tmp, 'artifact-manifest.json');
const artifactPath = path.join(tmp, tgzAsset.name);
const checksumPath = path.join(tmp, checksumAsset.name);

await downloadAsset(manifestAsset, manifestPath);
await downloadAsset(tgzAsset, artifactPath);
await downloadAsset(checksumAsset, checksumPath);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const expectedSha = parseChecksum(fs.readFileSync(checksumPath, 'utf8'), tgzAsset.name);
const actualSha = crypto.createHash('sha256').update(fs.readFileSync(artifactPath)).digest('hex');
if (expectedSha !== actualSha || (manifest.sha256 && manifest.sha256 !== actualSha)) {
  throw new Error(`Checksum mismatch for ${tgzAsset.name}: expected ${expectedSha}, got ${actualSha}`);
}

const extractDir = manifest.artifact?.extractDir || manifest.packageName || tgzAsset.name.replace(/\.tgz$/, '');
const releasesDir = path.join(installRoot, 'releases');
const targetDir = path.join(releasesDir, extractDir);
const currentLink = path.join(installRoot, 'current');

console.log(`Pulse Conversation Agent ${manifest.version || release.tag_name}`);
console.log(`Install root: ${installRoot}`);
console.log(`Artifact: ${tgzAsset.name}`);
console.log(`sha256: ${actualSha}`);
if (dryRun) {
  console.log(`Dry run: would extract to ${targetDir} and switch ${currentLink}.`);
  process.exit(0);
}

fs.mkdirSync(releasesDir, { recursive: true });
fs.rmSync(targetDir, { recursive: true, force: true });
await run('tar', ['-xzf', artifactPath, '-C', releasesDir]);
if (!fs.existsSync(targetDir)) {
  throw new Error(`Extracted artifact did not create expected directory: ${targetDir}`);
}
fs.copyFileSync(manifestPath, path.join(targetDir, 'artifact-manifest.json'));
fs.copyFileSync(checksumPath, path.join(targetDir, path.basename(checksumPath)));
fs.rmSync(currentLink, { recursive: true, force: true });
fs.symlinkSync(targetDir, currentLink, 'dir');

console.log('');
console.log('Installed.');
console.log(`Current: ${currentLink} -> ${targetDir}`);
console.log('');
console.log('Next commands:');
console.log(`  ${currentLink}/bin/conversation-agent setup --project ./pulse-project`);
console.log(`  ${currentLink}/bin/conversation-agent check --project ./pulse-project`);
console.log(`  ${currentLink}/bin/conversation-agent start all --project ./pulse-project --daemon`);

async function latestRelease(ownerRepo, releaseChannel) {
  const releases = await githubJson(`/repos/${ownerRepo}/releases?per_page=30`);
  const candidates = releases
    .filter(releaseItem => !releaseItem.draft)
    .filter(releaseItem => releaseChannel === 'stable' ? !releaseItem.prerelease : releaseItem.prerelease)
    .sort((a, b) => Date.parse(b.published_at || b.created_at || 0) - Date.parse(a.published_at || a.created_at || 0));
  return candidates[0];
}

async function githubJson(apiPath) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    headers: githubHeaders('application/vnd.github+json'),
    signal: AbortSignal.timeout(15000)
  });
  const text = await response.text();
  if (!response.ok) {
    const authHint = response.status === 401 || response.status === 403 || response.status === 404
      ? ' Check GitHub repository access and set GITHUB_TOKEN or GH_TOKEN for private repositories.'
      : '';
    throw new Error(`GitHub API failed (${response.status}) for ${apiPath}.${authHint} ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function downloadAsset(asset, targetPath) {
  const response = await fetch(asset.url, {
    headers: githubHeaders('application/octet-stream'),
    signal: AbortSignal.timeout(60000)
  });
  if (!response.ok) {
    throw new Error(`Failed to download GitHub asset ${asset.name} (${response.status}). Check GitHub access token for private repositories.`);
  }
  fs.writeFileSync(targetPath, Buffer.from(await response.arrayBuffer()));
}

function githubHeaders(accept) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  return {
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'pulse-conversation-agent-installer',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function parseChecksum(text, artifactName) {
  const exactLine = text.split(/\r?\n/).find(line => line.includes(artifactName));
  const line = exactLine || text.split(/\r?\n/).find(Boolean) || '';
  const match = /^[a-f0-9]{64}/i.exec(line.trim());
  if (!match) throw new Error(`Could not parse sha256 checksum for ${artifactName}`);
  return match[0].toLowerCase();
}

function option(name) {
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : '';
}

function hasFlag(name) {
  return args.includes(name);
}

async function run(command, argv) {
  const child = spawn(command, argv, { stdio: 'inherit' });
  const code = await new Promise(resolve => child.once('exit', value => resolve(value ?? 0)));
  if (code !== 0) throw new Error(`${command} ${argv.join(' ')} failed with exit code ${code}`);
}
