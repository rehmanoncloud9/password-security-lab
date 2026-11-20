import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as common from "@zxcvbn-ts/language-common";
import * as english from "@zxcvbn-ts/language-en";

export const ESTIMATOR_VERSION = "4.2.0" as const;
export const MAX_PASSWORD_CODE_POINTS = 256;

const estimatorInstance = new ZxcvbnFactory({
  translations: english.translations,
  graphs: common.adjacencyGraphs,
  dictionary: { ...common.dictionary, ...english.dictionary },
  maxLength: MAX_PASSWORD_CODE_POINTS,
});

export type MatcherFinding = { readonly pattern: string; readonly l33t?: boolean };

type MatcherAccess = {
  readonly matching: {
    match(password: string, options?: unknown): unknown;
  };
};

const matcherAccess = estimatorInstance as unknown as MatcherAccess;
if (!matcherAccess || typeof matcherAccess.matching?.match !== "function") {
  throw new Error("zxcvbn-ts matcher adapter initialization failed: matching.match is not a function.");
}

/**
 * Pure, re-entrant analysis pass against zxcvbn-ts.
 * Has no shared mutable state across calls and produces no side-effects.
 */
export function checkPassword(password: string): {
  readonly result: ReturnType<typeof estimatorInstance.check>;
  readonly findings: readonly MatcherFinding[];
} {
  const result = estimatorInstance.check(password);
  
  // Directly invoke the matcher on the input string to collect alternate pattern findings
  // without modifying matcher methods or storing shared state on the module.
  const rawMatches = matcherAccess.matching.match(password);
  if (!Array.isArray(rawMatches)) {
    throw new Error("zxcvbn-ts matching.match did not return an array.");
  }

  const findings: MatcherFinding[] = rawMatches.flatMap((candidate): MatcherFinding[] => {
    if (typeof candidate !== "object" || candidate === null || !("pattern" in candidate)) {
      return [];
    }
    const pattern = candidate.pattern;
    if (typeof pattern !== "string") return [];
    const l33t = "l33t" in candidate && typeof candidate.l33t === "boolean" ? candidate.l33t : undefined;
    return [{ pattern, ...(l33t !== undefined ? { l33t } : {}) }];
  });

  return { result, findings };
}

export { estimatorInstance as estimator };
