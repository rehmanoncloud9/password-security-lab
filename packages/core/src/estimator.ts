import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as common from "@zxcvbn-ts/language-common";
import * as english from "@zxcvbn-ts/language-en";

const estimator = new ZxcvbnFactory({
  translations: english.translations,
  graphs: common.adjacencyGraphs,
  dictionary: { ...common.dictionary, ...english.dictionary },
  maxLength: 256,
});

type MatcherFinding = { readonly pattern: string; readonly l33t?: boolean };

/*
 * zxcvbn-ts exposes only its optimal match sequence from check(). That sequence
 * intentionally omits alternate matches (for example, a keyboard walk that is
 * also a dictionary word). Its matcher is a private property in the published
 * API, so keep this narrow, version-pinned adapter here and return only the
 * non-sensitive classification fields used by the UI.
 */
type MatcherAccess = {
  readonly matching: {
    match(password: string, options?: unknown): unknown;
  };
};

const matcherAccess = estimator as unknown as MatcherAccess;
const matching = matcherAccess.matching;
const originalMatch = matching.match.bind(matching);
let currentFindings: readonly MatcherFinding[] = [];

/* Capture classifications from the same matcher pass used for the score. */
matching.match = (password, options) => {
  const rawMatches: unknown = originalMatch(password, options);
  if (!Array.isArray(rawMatches)) {
    throw new Error("The configured zxcvbn-ts matchers must run synchronously.");
  }

  const candidates: readonly unknown[] = rawMatches;
  currentFindings = candidates.flatMap((candidate): MatcherFinding[] => {
    if (typeof candidate !== "object" || candidate === null || !("pattern" in candidate)) {
      return [];
    }

    const pattern: unknown = candidate.pattern;
    if (typeof pattern !== "string") return [];

    const l33t: unknown = "l33t" in candidate ? candidate.l33t : undefined;
    return [{ pattern, ...(typeof l33t === "boolean" ? { l33t } : {}) }];
  });
  return rawMatches;
};

export function checkPassword(password: string): {
  readonly result: ReturnType<typeof estimator.check>;
  readonly findings: readonly MatcherFinding[];
} {
  currentFindings = [];
  const result = estimator.check(password);
  return { result, findings: currentFindings };
}

export const ESTIMATOR_VERSION = "4.2.0" as const;
export const MAX_PASSWORD_CODE_POINTS = 256;
export { estimator };
