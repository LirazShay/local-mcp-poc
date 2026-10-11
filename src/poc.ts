import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type JsonScalar = string | number | boolean | null;
export type State = Record<string, JsonScalar>;

const DEFAULT_STATE_PATH = path.join(process.cwd(), '.local', 'state.json');

export function getStatePath(): string {
  return process.env.LOCAL_MCP_POC_STATE_PATH || DEFAULT_STATE_PATH;
}

async function ensureStateFile(): Promise<string> {
  const statePath = getStatePath();
  await mkdir(path.dirname(statePath), { recursive: true });

  try {
    await readFile(statePath, 'utf8');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== 'ENOENT') throw error;
    await writeFile(statePath, '{}\n', 'utf8');
  }

  return statePath;
}

export async function readState(): Promise<State> {
  const statePath = await ensureStateFile();
  const raw = await readFile(statePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('STATE_FILE_INVALID');
  }

  return parsed as State;
}

export async function setValue(key: string, value: JsonScalar): Promise<State> {
  if (!key.trim()) throw new Error('KEY_REQUIRED');

  const state = await readState();
  state[key] = value;
  const statePath = getStatePath();
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  return state;
}

export async function getValue(key: string): Promise<{ found: boolean; value: JsonScalar | undefined }> {
  const state = await readState();
  return {
    found: Object.prototype.hasOwnProperty.call(state, key),
    value: state[key]
  };
}

export function add(a: number, b: number): number {
  return a + b;
}

export function analyzeNumbers(numbers: number[]): {
  count: number;
  min: number;
  max: number;
  sum: number;
  average: number;
} {
  if (numbers.length === 0) throw new Error('NUMBERS_REQUIRED');
  if (!numbers.every(Number.isFinite)) throw new Error('NUMBERS_MUST_BE_FINITE');

  const sum = numbers.reduce((acc, value) => acc + value, 0);
  return {
    count: numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    sum,
    average: sum / numbers.length
  };
}

export function inspectPayload(text: string): {
  utf8Bytes: number;
  characters: number;
  sha256: string;
} {
  return {
    utf8Bytes: Buffer.byteLength(text, 'utf8'),
    characters: [...text].length,
    sha256: createHash('sha256').update(text, 'utf8').digest('hex')
  };
}

export async function delay(ms: number): Promise<{ waitedMs: number }> {
  if (!Number.isInteger(ms) || ms < 0 || ms > 5000) {
    throw new Error('DELAY_MUST_BE_INTEGER_0_TO_5000_MS');
  }

  await new Promise((resolve) => setTimeout(resolve, ms));
  return { waitedMs: ms };
}
