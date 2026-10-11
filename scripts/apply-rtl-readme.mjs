import fs from 'node:fs';

const file = 'README.md';
const RLM = '\u200F';
const hebrew = /[\u0590-\u05FF]/;

const input = fs.readFileSync(file, 'utf8');
const lines = input.split('\n');
let inFence = false;

function insertRlm(line) {
  if (!line || !hebrew.test(line)) return line;

  const patterns = [
    /^(\s{0,3}#{1,6}\s+)/,
    /^(\s*[-*+]\s+)/,
    /^(\s*\d+[.)]\s+)/,
    /^(\s*>\s*)/,
  ];

  let prefixLength = 0;
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      prefixLength = match[1].length;
      break;
    }
  }

  if (line[prefixLength] === RLM) return line;
  return line.slice(0, prefixLength) + RLM + line.slice(prefixLength);
}

const output = lines.map((line) => {
  if (/^\s*```/.test(line)) {
    inFence = !inFence;
    return line;
  }

  if (inFence || /^\s*---\s*$/.test(line)) return line;
  return insertRlm(line);
}).join('\n');

fs.writeFileSync(file, output, 'utf8');
