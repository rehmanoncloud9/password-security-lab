import { estimator, ESTIMATOR_VERSION, MAX_PASSWORD_CODE_POINTS } from "./estimator.js";
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

function makeFindings(matches: readonly { pattern: string }[]): PatternFinding[] {
  const used = new Set<string>();
  return matches.flatMap((match) => {
    const explanation = PATTERN_EXPLANATIONS[match.pattern];
    if (!explanation || used.has(match.pattern)) return [];
    used.add(match.pattern);
    return [{
      id: `pattern-${match.pattern}`,
      pattern: match.pattern,
      severity: match.pattern === "bruteForce" ? "information" as const : "warning" as const,
      explanation,
    }];
  });
}

/** Estimate guessability locally. The result contains no password or matched token. */
export function analyzePassword(password: string): AnalysisResult {
  if (typeof password !== "string") throw new TypeError("Password input must be text.");
  if (password.length > MAX_PASSWORD_CODE_POINTS * 2) {
    throw new InputLimitError(`Input exceeds the ${MAX_PASSWORD_CODE_POINTS} Unicode code point limit.`);
  }
  const codePoints = Array.from(password).length;
  if (codePoints > MAX_PASSWORD_CODE_POINTS) {
    throw new InputLimitError(`Input exceeds the ${MAX_PASSWORD_CODE_POINTS} Unicode code point limit.`);
  }
  const input = profile(password, codePoints);
  const result = estimator.check(password);
  const score = Math.max(0, Math.min(4, result.score)) as 0 | 1 | 2 | 3 | 4;
  return {
    estimator: {
      name: "zxcvbn-ts",
      version: ESTIMATOR_VERSION,
      method: "Pattern-aware zxcvbn estimate; relative guesses are not a crack-time guarantee.",
    },
    score,
    band: BANDS[score] ?? "very_weak",
    estimatedGuesses: Number.isFinite(result.guesses) ? Math.max(1, result.guesses) : Number.MAX_VALUE,
    findings: makeFindings(result.sequence),
    suggestions: [...new Set(result.feedback?.suggestions ?? [])].slice(0, 4),
    characterProfile: input,
    limitations: [
      "The estimate cannot account for private information, future leaks, or every attacker dictionary.",
      "The score and guess count are model outputs, not measured attack results or a safety guarantee.",
      "Only the English and common zxcvbn-ts dictionaries are loaded.",
    ],
  };
}
