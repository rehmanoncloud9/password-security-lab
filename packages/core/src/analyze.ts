import { checkPassword, ESTIMATOR_VERSION, MAX_PASSWORD_CODE_POINTS } from "./estimator.js";
import { InputLimitError, type AnalysisResult, type PatternFinding, type StrengthBand } from "./types.js";

const PATTERN_EXPLANATIONS: Readonly<Record<string, string>> = {
  dictionary: "A word or familiar name appears in the pattern used for this estimate.",
  wordSequence: "A sequence of familiar words appears predictable as a phrase.",
  repeat: "A repeated character or sequence can be guessed with fewer attempts than random text.",
  sequence: "A forward or reverse sequence is a common guessing pattern.",
  spatial: "A keyboard walk or nearby-key pattern is easier to guess than random characters.",
  date: "A date-like pattern is commonly tried by password guessing tools.",
  regex: "A simple number or year pattern contributes less uncertainty than random characters.",
  l33t: "A familiar word remains recognizable after common letter substitutions.",
  separator: "A familiar separator pattern does not add as much uncertainty as it may appear to.",
  bruteforce: "This portion had no known pattern and was estimated as random-looking text.",
  bruteForce: "This portion had no known pattern and was estimated as random-looking text.",
};

const BANDS: readonly StrengthBand[] = ["very_weak", "weak", "moderate", "strong", "very_strong"];

/** Maximum finite upper bound for guess representation (10^18 guesses) */
export const MAX_FINITE_GUESS_ESTIMATE = 1e18;

function profile(password: string, codePoints: number): AnalysisResult["characterProfile"] {
  return {
    codePoints,
    hasUppercase: /\p{Lu}/u.test(password),
    hasLowercase: /\p{Ll}/u.test(password),
    hasNumber: /\p{N}/u.test(password),
    hasSymbol: /[^\p{L}\p{N}\s]/u.test(password),
    hasWhitespace: /\s/u.test(password),
  };
}

function makeFindings(matches: readonly { readonly pattern: string; readonly l33t?: boolean }[]): PatternFinding[] {
  const used = new Set<string>();
  return matches.flatMap((match) => {
    const patterns = match.pattern === "dictionary" && match.l33t
      ? ["dictionary", "l33t"]
      : [match.pattern];
    return patterns.flatMap((pattern) => {
      const explanation = PATTERN_EXPLANATIONS[pattern];
      if (!explanation || used.has(pattern)) return [];
      used.add(pattern);
      return [{
        id: `pattern-${pattern}`,
        pattern,
        severity: pattern === "bruteforce" ? ("information" as const) : ("warning" as const),
        explanation,
      }];
    });
  });
}

/**
 * Estimate guessability locally entirely in browser memory.
 * Preserves the exact entered string for analysis without silent trimming or mutation.
 * The serialized result contains no password, substring, or matched token.
 */
export function analyzePassword(password: string): AnalysisResult {
  if (typeof password !== "string") throw new TypeError("Password input must be text.");
  if (password.length > MAX_PASSWORD_CODE_POINTS * 2) {
    throw new InputLimitError(`Input exceeds the ${MAX_PASSWORD_CODE_POINTS} Unicode code point limit.`);
  }

  // Count Unicode code points, not UTF-16 code units (NIST SP 800-63B-4 requirement)
  const codePoints = Array.from(password).length;
  if (codePoints > MAX_PASSWORD_CODE_POINTS) {
    throw new InputLimitError(`Input exceeds the ${MAX_PASSWORD_CODE_POINTS} Unicode code point limit.`);
  }

  const inputProfile = profile(password, codePoints);
  const { result, findings } = checkPassword(password);
  const score = Math.max(0, Math.min(4, result.score)) as 0 | 1 | 2 | 3 | 4;

  const rawGuesses = result.guesses;
  const isGuessesBounded = !Number.isFinite(rawGuesses) || rawGuesses >= MAX_FINITE_GUESS_ESTIMATE;
  const estimatedGuesses = isGuessesBounded
    ? MAX_FINITE_GUESS_ESTIMATE
    : Math.max(1, Math.round(rawGuesses));

  return {
    estimator: {
      name: "zxcvbn-ts",
      version: ESTIMATOR_VERSION,
      method: "Pattern-aware zxcvbn estimate; relative guesses are not a crack-time guarantee.",
    },
    score,
    band: BANDS[score] ?? "very_weak",
    estimatedGuesses,
    isGuessesBounded,
    findings: makeFindings([...result.sequence, ...findings]),
    suggestions: [...new Set(result.feedback?.suggestions ?? [])].slice(0, 4),
    characterProfile: inputProfile,
    limitations: [
      "The estimate cannot account for private information, future leaks, or every attacker dictionary.",
      "The score and guess count are model outputs, not measured attack results or a safety guarantee.",
      "Only the English and common zxcvbn-ts dictionaries are loaded.",
    ],
  };
}
