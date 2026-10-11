import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { add, analyzeNumbers, delay, getValue, inspectPayload, setValue } from '../src/poc.js';

test('add computes locally', () => {
  assert.equal(add(17, 25), 42);
});

test('analyzeNumbers returns deterministic statistics', () => {
  assert.deepEqual(analyzeNumbers([3, 7, 1, 9, 4]), {
    count: 5,
    min: 1,
    max: 9,
    sum: 24,
    average: 4.8
  });
});

test('inspectPayload measures UTF-8 and hashes content', () => {
  const result = inspectPayload('abc');
  assert.equal(result.utf8Bytes, 3);
  assert.equal(result.characters, 3);
  assert.equal(result.sha256, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('state survives a write/read round trip', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'local-mcp-poc-'));
  const statePath = path.join(tempDir, 'state.json');
  process.env.LOCAL_MCP_POC_STATE_PATH = statePath;

  try {
    await setValue('champion', 'query-17');
    assert.deepEqual(await getValue('champion'), { found: true, value: 'query-17' });

    const raw = await readFile(statePath, 'utf8');
    assert.match(raw, /query-17/);
  } finally {
    delete process.env.LOCAL_MCP_POC_STATE_PATH;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('delay returns after requested bounded delay', async () => {
  assert.deepEqual(await delay(5), { waitedMs: 5 });
});
