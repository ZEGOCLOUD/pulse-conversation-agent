import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const verifierSource = process.env.PULSE_PUBLIC_ARTIFACT_VERIFIER_SOURCE
  ? path.resolve(process.env.PULSE_PUBLIC_ARTIFACT_VERIFIER_SOURCE)
  : path.join(__dirname, 'verify-public-artifact.mjs');
const sourceRoot = process.env.PULSE_PUBLIC_ARTIFACT_FIXTURE_SOURCE
  ? path.resolve(process.env.PULSE_PUBLIC_ARTIFACT_FIXTURE_SOURCE)
  : path.resolve(__dirname, '..');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-public-artifact-scope-'));

try {
  fs.cpSync(sourceRoot, fixtureRoot, {
    recursive: true,
    filter(source) {
      const rel = path.relative(sourceRoot, source).replace(/\\/g, '/');
      return rel !== '.git' && !rel.startsWith('.git/') && rel !== '.superpowers' && !rel.startsWith('.superpowers/');
    }
  });
  fs.copyFileSync(verifierSource, path.join(fixtureRoot, 'scripts/verify-public-artifact.mjs'));

  assertSuccess(runVerifier(), 'baseline public preview fixture must pass');

  const fixtures = [
    ['.verify-deprecated-display.js', ['ZEGO Conversational Agent Service', 'Gateway'].join(' ')],
    ['.verify-deprecated-display.json', ['ZEGO Conversational Agent Service', 'Developer Preview'].join(' ')]
  ];
  for (const [rel, deprecatedDisplayName] of fixtures) {
    const file = path.join(fixtureRoot, rel);
    const source = rel.endsWith('.json')
      ? `${JSON.stringify({ displayName: deprecatedDisplayName })}\n`
      : `export const displayName = ${JSON.stringify(deprecatedDisplayName)};\n`;
    fs.writeFileSync(file, source, 'utf8');
    const result = runVerifier();
    assert(result.status !== 0, `public verifier must reject deprecated display branding in ${rel}`);
    assert(result.stderr.includes(rel), `public verifier must report ${rel}:\n${result.stderr || result.stdout}`);
    fs.rmSync(file, { force: true });
  }

  console.log('Verified standalone public branding scans customer-visible JavaScript and JSON files.');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

function runVerifier() {
  return spawnSync(process.execPath, ['scripts/verify-public-artifact.mjs'], {
    cwd: fixtureRoot,
    encoding: 'utf8'
  });
}

function assertSuccess(result, message) {
  assert(result.status === 0, `${message}:\n${result.stderr || result.stdout}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
