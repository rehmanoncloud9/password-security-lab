/**
 * Cryptographically secure password and passphrase generation using platform Web Crypto.
 * Uses rejection sampling to prevent modulo bias.
 */

import { EFF_LARGE_WORDLIST, WORDLIST_METADATA } from "./wordlist.js";

export type GeneratorOptions =
  | {
      readonly mode: "random";
      readonly length?: number;
      readonly lowercase?: boolean;
      readonly uppercase?: boolean;
      readonly numbers?: boolean;
      readonly symbols?: boolean;
      readonly excludeAmbiguous?: boolean;
    }
  | {
      readonly mode: "passphrase";
      readonly wordCount?: number;
      readonly separator?: string;
    };

export interface GeneratedPassword {
  /** Generated secret material; ephemeral only, callers must never persist or transmit this. */
  readonly password: string;
  readonly mode: "random" | "passphrase";
  readonly theoreticalSelectionBits: number;
  readonly alphabetSize?: number;
  readonly wordCount?: number;
  readonly wordlistSize?: number;
  readonly source: string;
  readonly assumptions: string;
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!#$%&()*+,-./:;<=>?@[]^_{|}~";
const AMBIGUOUS = new Set(["i", "l", "o", "I", "L", "O", "0", "1"]);

export const DEFAULT_RANDOM_LENGTH = 20;
export const MIN_RANDOM_LENGTH = 8;
export const MAX_RANDOM_LENGTH = 128;

export const DEFAULT_PASSPHRASE_WORD_COUNT = 6;
export const MIN_PASSPHRASE_WORD_COUNT = 4;
export const MAX_PASSPHRASE_WORD_COUNT = 20;

/** Type for custom random byte generator used solely in testing rejection sampling. */
export type RandomByteSource = (buffer: Uint8Array | Uint16Array) => void;

/**
 * Unbiased random integer selection in range [0, size - 1] using rejection sampling.
 * Fails closed if Web Crypto is unavailable.
 */
export function secureRandomIndex(size: number, customSource?: RandomByteSource): number {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("Random selection size must be an integer greater than or equal to 1.");
  }
  if (size === 1) return 0;

  if (size <= 256) {
    const acceptanceLimit = Math.floor(256 / size) * size;
    const buf = new Uint8Array(1);
    while (true) {
      if (customSource) {
        customSource(buf);
      } else {
        const cryptoApi = globalThis.crypto;
        if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
          throw new Error("A cryptographically secure random source (Web Crypto) is unavailable in this runtime.");
        }
        cryptoApi.getRandomValues(buf);
      }
      const val = buf[0]!;
      if (val < acceptanceLimit) {
        return val % size;
      }
    }
  }

  if (size <= 65536) {
    const acceptanceLimit = Math.floor(65536 / size) * size;
    const buf = new Uint16Array(1);
    while (true) {
      if (customSource) {
        customSource(buf);
      } else {
        const cryptoApi = globalThis.crypto;
        if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
          throw new Error("A cryptographically secure random source (Web Crypto) is unavailable in this runtime.");
        }
        cryptoApi.getRandomValues(buf);
      }
      const val = buf[0]!;
      if (val < acceptanceLimit) {
        return val % size;
      }
    }
  }

  throw new RangeError("Selection size exceeds maximum supported range of 65536.");
}

export function buildAlphabet(options: {
  readonly lowercase?: boolean;
  readonly uppercase?: boolean;
  readonly numbers?: boolean;
  readonly symbols?: boolean;
  readonly excludeAmbiguous?: boolean;
}): string {
  const pools = [
    options.lowercase !== false ? LOWER : "",
    options.uppercase !== false ? UPPER : "",
    options.numbers !== false ? NUMBERS : "",
    options.symbols !== false ? SYMBOLS : "",
  ].filter((pool) => pool.length > 0);

  const combined = pools.join("");
  const filtered = options.excludeAmbiguous
    ? Array.from(combined).filter((ch) => !AMBIGUOUS.has(ch)).join("")
    : combined;

  const alphabet = Array.from(new Set(filtered)).join("");
  if (!alphabet) {
    throw new RangeError("Select at least one non-empty character set.");
  }
  return alphabet;
}

/**
 * Generate a cryptographically secure random password or passphrase.
 * Never uses Math.random. All selections are independent and uniformly distributed.
 */
export function generatePassword(
  options: GeneratorOptions,
  _testSource?: RandomByteSource,
): GeneratedPassword {
  if (options.mode === "random") {
    const length = options.length ?? DEFAULT_RANDOM_LENGTH;
    if (!Number.isInteger(length) || length < MIN_RANDOM_LENGTH || length > MAX_RANDOM_LENGTH) {
      throw new RangeError(`Random password length must be an integer from ${MIN_RANDOM_LENGTH} through ${MAX_RANDOM_LENGTH}.`);
    }

    const alphabet = buildAlphabet(options);
    if (alphabet.length < 2) {
      throw new RangeError("The selected character set must contain at least 2 distinct characters.");
    }

    const chars = Array.from({ length }, () => alphabet[secureRandomIndex(alphabet.length, _testSource)]!);
    const bits = length * Math.log2(alphabet.length);

    return {
      password: chars.join(""),
      mode: "random",
      theoreticalSelectionBits: bits,
      alphabetSize: alphabet.length,
      source: `Uniform selection from an alphabet of ${alphabet.length} printable characters using Web Crypto CSPRNG with rejection sampling.`,
      assumptions: `Theoretical selection entropy calculated as length * log2(alphabetSize) assuming independent, identically distributed uniform random choices. Does not account for target site restrictions.`,
    };
  }

  if (options.mode === "passphrase") {
    const count = options.wordCount ?? DEFAULT_PASSPHRASE_WORD_COUNT;
    if (!Number.isInteger(count) || count < MIN_PASSPHRASE_WORD_COUNT || count > MAX_PASSPHRASE_WORD_COUNT) {
      throw new RangeError(`Passphrase word count must be an integer from ${MIN_PASSPHRASE_WORD_COUNT} through ${MAX_PASSPHRASE_WORD_COUNT}.`);
    }

    const separator = options.separator ?? "-";
    const wordlist = EFF_LARGE_WORDLIST;
    const words = Array.from({ length: count }, () => wordlist[secureRandomIndex(wordlist.length, _testSource)]!);
    const bits = count * Math.log2(wordlist.length);

    return {
      password: words.join(separator),
      mode: "passphrase",
      theoreticalSelectionBits: bits,
      wordCount: count,
      wordlistSize: wordlist.length,
      source: `Independent uniform choices with replacement from the ${WORDLIST_METADATA.name} (${wordlist.length} words, version ${WORDLIST_METADATA.version}, ${WORDLIST_METADATA.license}) using Web Crypto rejection sampling.`,
      assumptions: `Theoretical selection entropy calculated as wordCount * log2(${wordlist.length}) (approx. ${WORDLIST_METADATA.bitsPerWord.toFixed(2)} bits/word). Separators are constant presentation choices and contribute 0 entropy bits.`,
    };
  }

  throw new RangeError("Invalid generator mode.");
}

/** Number of entries in the standard passphrase wordlist. */
export const PASSPHRASE_WORD_COUNT = EFF_LARGE_WORDLIST.length;
