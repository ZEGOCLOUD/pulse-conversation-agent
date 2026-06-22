#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(repoRoot, 'artifact-manifest.json');
const manifest = readJson(manifestPath);
const artifactPath = path.join(repoRoot, 'artifacts', manifest.artifactName || '');
const checksumPath = `${artifactPath}.sha256`;

assert(fs.existsSync(artifactPath), `missing artifact: ${artifactPath}`);
assert(fs.existsSync(checksumPath), `missing checksum: ${checksumPath}`);
assert(manifest.repoName === 'pulse-conversation-agent', 'manifest repoName must be pulse-conversation-agent');
assert(manifest.deliveryType === 'public-preview-binary', 'manifest deliveryType must be public-preview-binary');
assert(manifest.sourceDisclosure === 'compiled-runtime-only', 'manifest sourceDisclosure must be compiled-runtime-only');
assert(manifest.releaseChannel === 'preview', 'manifest releaseChannel must be preview');
assert(manifest.upgradePolicy && typeof manifest.upgradePolicy === 'object', 'manifest upgradePolicy is required');
assert(manifest.upgradePolicy.requiresDevAssistantUpgrade === false, 'manifest requiresDevAssistantUpgrade must default to false');
assert(manifest.upgradePolicy.requiresConfigMigration === false, 'manifest requiresConfigMigration must default to false');
assert(manifest.artifact?.extractDir === manifest.packageName, 'manifest artifact.extractDir must match packageName');

const actualSha = crypto.createHash('sha256').update(fs.readFileSync(artifactPath)).digest('hex');
const checksumSha = parseChecksum(fs.readFileSync(checksumPath, 'utf8'), manifest.artifactName);
assert(actualSha === checksumSha, 'checksum file does not match artifact');
assert(actualSha === manifest.sha256, 'manifest sha256 does not match artifact');
assert(actualSha === manifest.artifact?.sha256, 'manifest artifact.sha256 does not match artifact');

scanTree(repoRoot, { allowArtifacts: true });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pulse-public-artifact-'));
try {
  const result = spawnSync('tar', ['-xzf', artifactPath, '-C', tmp], { encoding: 'utf8' });
  assert(result.status === 0, `failed to extract artifact:\n${result.stdout}\n${result.stderr}`);
  const packageRoot = path.join(tmp, manifest.packageName);
  for (const required of [
    'bin/conversation-agent',
    'setup/setup.mjs',
    'setup/check.mjs',
    'examples/local-cloudflare-live-e2e/run.mjs',
    'workspaces/default-service-assistant/workspace.json',
    'workspaces/action-validation/workspace.json',
    'workspaces/isolation-validation/workspace.json'
  ]) {
    assert(fs.existsSync(path.join(packageRoot, required)), `artifact missing ${required}`);
  }
  scanTree(packageRoot, { allowArtifacts: false });
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(`Verified ${manifest.artifactName} (${actualSha}).`);

function scanTree(root, options) {
  for (const file of walk(root)) {
    const rel = path.relative(root, file).replace(/\\/g, '/');
    if (rel.startsWith('.git/')) continue;
    if (options.allowArtifacts && /^artifacts\/.+\.tgz(\.sha256)?$/.test(rel)) continue;
    assert(!/(^|\/)src\//.test(rel), `source directory must not be exposed: ${rel}`);
    assert(!/\.(ts|tsx|map)$/.test(rel), `source or source map must not be exposed: ${rel}`);
    assert(!/(^|\/)(logs|memory|reports|states)\//.test(rel), `runtime output must not be exposed: ${rel}`);
    if (!isTextFile(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of forbiddenTextPatterns()) {
      assert(!pattern.test(text), `forbidden text ${pattern} in ${rel}`);
    }
  }
}

function forbiddenTextPatterns() {
  return [
    new RegExp('Top' + 'Top', 'i'),
    new RegExp('Open' + 'Claw', 'i'),
    new RegExp('confiden' + 'tial', 'i'),
    new RegExp('zego-conversation-' + 'agent', 'i'),
    new RegExp('ZEGO official ' + 'SDK', 'i'),
    new RegExp('ZEGO standard SLA ' + 'product', 'i'),
    new RegExp('conversation-agent-3\\.0\\.beta-' + 'sdk', 'i'),
    new RegExp('conversation-agent-3-' + 'sdk', 'i'),
    new RegExp('default-' + 'sdk-assistant', 'i'),
    new RegExp('47\\.103\\.123\\.211'),
    new RegExp('access\\.oa\\.zego\\.im'),
    new RegExp('rhett' + 'qi'),
    new RegExp('id_ed25519_zego_' + 'bastion')
  ];
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(fullPath));
    else out.push(fullPath);
  }
  return out;
}

function isTextFile(file) {
  const ext = path.extname(file).toLowerCase();
  return [
    '.md', '.json', '.yaml', '.yml', '.txt', '.js', '.mjs', '.cjs', '.html', '.css',
    '.svg', '.env', '.example', '.gitignore'
  ].includes(ext) || !ext;
}

function parseChecksum(text, artifactName) {
  const exactLine = text.split(/\r?\n/).find(line => line.includes(artifactName));
  const line = exactLine || text.split(/\r?\n/).find(Boolean) || '';
  const match = /^[a-f0-9]{64}/i.exec(line.trim());
  assert(match, `could not parse checksum for ${artifactName}`);
  return match[0].toLowerCase();
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[verify-public-artifact] ${message}`);
    process.exit(1);
  }
}
