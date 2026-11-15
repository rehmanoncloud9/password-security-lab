import { InputLimitError, type ReusePair, type ReuseResult } from "./types.js";

const MAX_SAMPLES = 20;
const MAX_LENGTH = 128;
const SIMILARITY_THRESHOLD = 0.8;
const MIN_SIMILARITY_LENGTH = 6;

function distance(left: string, right: string): number {
  const leftPoints = Array.from(left);
  const rightPoints = Array.from(right);
  let previous = Array.from({ length: rightPoints.length + 1 }, (_, i) => i);
  for (let i = 1; i <= leftPoints.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= rightPoints.length; j += 1) {
      current[j] = Math.min(
        (current[j - 1] ?? 0) + 1,
        (previous[j] ?? 0) + 1,
        (previous[j - 1] ?? 0) + (leftPoints[i - 1] === rightPoints[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[rightPoints.length] ?? Math.max(leftPoints.length, rightPoints.length);
}

/** Compare only values in this call; result groups contain indexes, never inputs. */
export function analyzeReuse(samplePasswords: readonly string[]): ReuseResult {
  if (!Array.isArray(samplePasswords)) throw new TypeError("Sample passwords must be an array.");
  if (samplePasswords.length > MAX_SAMPLES) throw new InputLimitError(`At most ${MAX_SAMPLES} samples are allowed.`);
  samplePasswords.forEach((sample) => {
    if (typeof sample !== "string") throw new TypeError("Every sample must be text.");
    if (sample.length > MAX_LENGTH * 2) {
      throw new InputLimitError(`A sample exceeds ${MAX_LENGTH} code points.`);
    }
    if (Array.from(sample).length > MAX_LENGTH) throw new InputLimitError(`A sample exceeds ${MAX_LENGTH} code points.`);
  });
  const grouped = new Map<string, number[]>();
  samplePasswords.forEach((sample, index) => grouped.set(sample, [...(grouped.get(sample) ?? []), index]));
  const exactDuplicateGroups = [...grouped.values()].filter((indexes) => indexes.length > 1);
  const similarPairs: ReusePair[] = [];
  for (let i = 0; i < samplePasswords.length; i += 1) {
    for (let j = i + 1; j < samplePasswords.length; j += 1) {
      const first = samplePasswords[i] ?? "";
      const second = samplePasswords[j] ?? "";
      if (first === second) continue;
      const a = first.normalize("NFKC").toLowerCase();
      const b = second.normalize("NFKC").toLowerCase();
      const longest = Math.max(Array.from(a).length, Array.from(b).length);
      if (longest < MIN_SIMILARITY_LENGTH) continue;
      const similarity = 1 - distance(a, b) / longest;
      if (similarity >= SIMILARITY_THRESHOLD) {
        similarPairs.push({
          firstIndex: i,
          secondIndex: j,
          similarity: Math.round(similarity * 1000) / 1000,
          explanation: "NFKC-normalized, lowercase strings are at least 80% similar by Levenshtein distance; this is a heuristic.",
        });
      }
    }
  }
  return {
    exactDuplicateGroups,
    similarPairs,
    limits: { maxSamples: MAX_SAMPLES, maxLength: MAX_LENGTH, threshold: SIMILARITY_THRESHOLD },
    limitations: [
      "This compares only the supplied in-memory sample set; it cannot detect reuse at unrelated services.",
      "Similarity can have false positives for shared templates and false negatives for larger changes.",
      "Near-duplicate checks ignore case and Unicode compatibility distinctions after NFKC normalization.",
    ],
  };
}
