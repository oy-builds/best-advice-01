import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(here, "entry.txt"), "utf-8");
const text = raw.endsWith("\n") ? raw.slice(0, -1) : raw;

if (text.length === 0 || text.trim().length === 0) {
  throw new Error("entry.txt is empty");
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry.txt must be a single line");
}
if ([...text].length > 200) {
  throw new Error("entry exceeds 200 characters");
}

if (!raw.endsWith("\n") || raw.endsWith("\n\n")) {
  throw new Error("entry.txt must end with exactly one trailing newline");
}
if ([...text].length < 1) {
  throw new Error("entry must be at least 1 character");
}
// Single sentence: exactly one terminal punctuation mark, at the very end.
const terminals = [...text].filter((c) => c === "." || c === "!" || c === "?").length;
if (terminals !== 1 || !/[.!?]$/.test(text)) {
  throw new Error("entry must be a single sentence ending in ., ! or ?");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, raw, "utf-8");

// Byte-exact round-trip verification.
const sourceBytes = readFileSync(join(here, "entry.txt"));
const writtenBytes = readFileSync(outPath);
if (!sourceBytes.equals(writtenBytes)) {
  throw new Error("round-trip mismatch: output is not byte-exact");
}
const roundTripped = writtenBytes.toString("utf-8");
if (roundTripped !== raw) {
  throw new Error("round-trip mismatch: decoded output differs");
}
console.log(`wrote ${outPath} (${[...text].length} chars, ${writtenBytes.length} bytes, round-trip OK)`);
