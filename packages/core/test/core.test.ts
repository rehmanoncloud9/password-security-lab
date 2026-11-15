import { describe, expect, it } from "vitest";
import {
  analyzePassword,
  analyzeReuse,
  evaluatePolicy,
  generatePassword,
  InputLimitError,
  PASSPHRASE_WORD_COUNT,
} from "../src/index.js";

describe("pattern-aware local analysis", () => {
  it("detects a common password without returning its value", () => {
    const sample = "password";
    const result = analyzePassword(sample);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.findings.some((finding) => finding.pattern === "dictionary")).toBe(true);
    expect(JSON.stringify(result)).not.toContain(sample);
  });

  it("preserves whitespace and counts Unicode code points", () => {
    const sample = "caf\u00e9 \u{1f408} river! green";
    const result = analyzePassword(sample);
    expect(result.characterProfile.hasWhitespace).toBe(true);
    expect(result.characterProfile.codePoints).toBe(Array.from(sample).length);
  });

  it("handles empty input and long passphrases", () => {
    expect(analyzePassword("").characterProfile.codePoints).toBe(0);
    const phrase = analyzePassword("orchard canvas river lantern meadow amber");
    expect(phrase.characterProfile.codePoints).toBeGreaterThan(30);
    expect(phrase.estimatedGuesses).toBeGreaterThan(1);
  });

  it("reports repeated, sequence, keyboard, and substitution patterns", () => {
    const patterns = (sample: string) => analyzePassword(sample).findings.map((item) => item.pattern);
    expect(patterns("aaaaaaaaaaaa")).toContain("repeat");
    expect(patterns("abcdef")).toContain("sequence");
    expect(patterns("qwerty")).toContain("spatial");
    expect(patterns("p@ssw0rd")).toContain("l33t");
  });

  it("does not silently truncate over-limit values", () => {
    expect(() => analyzePassword("x".repeat(257))).toThrow(InputLimitError);
    expect(() => analyzePassword("x".repeat(1_000_000))).toThrow(InputLimitError);
    expect(() => evaluatePolicy("x".repeat(1_000_000), "modern_single_factor")).toThrow(
      InputLimitError,
    );
  });

  it("returns deterministic results for the same sample", () => {
    expect(analyzePassword("blue-harbor-velvet-73")).toEqual(
      analyzePassword("blue-harbor-velvet-73"),
    );
  });
});

describe("separate password policies", () => {
  it("uses a 15 code point single-factor minimum and no composition rule", () => {
    const result = evaluatePolicy("plain long passphrase", "modern_single_factor");
    expect(result.checks.find((item) => item.id === "minimum-length")?.state).toBe("pass");
    expect(result.checks.some((item) => item.id === "composition")).toBe(false);
    expect(result.overall).toBe("compliant");
  });

  it("allows 8 characters in the MFA reference preset", () => {
    const result = evaluatePolicy("plain text", "modern_mfa");
    expect(result.checks.find((item) => item.id === "minimum-length")?.state).toBe("pass");
  });

  it("marks the educational composition preset separately", () => {
    const result = evaluatePolicy("aB3!plain", "educational_traditional");
    expect(result.label).toMatch(/legacy example/);
    expect(result.checks.find((item) => item.id === "composition")?.state).toBe("pass");
  });

  it("checks the complete candidate against the local dictionary, not substrings", () => {
    expect(
      evaluatePolicy("password", "modern_single_factor").checks.find(
        (item) => item.id === "whole-value-blocklist",
      )?.state,
    ).toBe("fail");
    expect(
      evaluatePolicy("password-river-planet", "modern_single_factor").checks.find(
        (item) => item.id === "whole-value-blocklist",
      )?.state,
    ).toBe("pass");
  });
});

describe("short-lived sample-set reuse", () => {
  it("finds exact duplicates and a one-character variation by indexes only", () => {
    const result = analyzeReuse([
      "Cobalt-Tree-1",
      "Cobalt-Tree-1",
      "cobalt-tree-2",
      "unrelated-phrase",
    ]);
    expect(result.exactDuplicateGroups).toEqual([[0, 1]]);
    expect(result.similarPairs.some((pair) => pair.firstIndex === 0 && pair.secondIndex === 2)).toBe(
      true,
    );
    expect(JSON.stringify(result)).not.toContain("Cobalt-Tree-1");
  });

  it("avoids short-word matches and unrelated values", () => {
    expect(analyzeReuse(["cat", "bat", "winter-ocean", "violet-cabin"]).similarPairs).toEqual(
      [],
    );
  });

  it("compares supplementary Unicode characters by code point", () => {
    const result = analyzeReuse(["planet\u{1f408}", "planet\u{1f415}"]);
    expect(result.similarPairs).toHaveLength(1);
    expect(result.similarPairs[0]?.similarity).toBeGreaterThan(0.8);
  });

  it("enforces sample count and input length", () => {
    expect(() => analyzeReuse(Array.from({ length: 21 }, () => "synthetic"))).toThrow(
      InputLimitError,
    );
    expect(() => analyzeReuse(["x".repeat(129)])).toThrow(InputLimitError);
  });
});

describe("cryptographically secure password generation", () => {
  it("generates a configured random password without using Math.random", () => {
    const original = Math.random;
    Math.random = () => { throw new Error("Math.random must not be used"); };
    try {
      const generated = generatePassword({
        mode: "random",
        length: 32,
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true,
      });
      expect(generated.password).toHaveLength(32);
      expect(generated.password).toMatch(/[a-z]/);
      expect(generated.password).toMatch(/[A-Z]/);
      expect(generated.password).toMatch(/[0-9]/);
      expect(generated.password).toMatch(/[!#$%&()*+,-./:;<=>?@\[\]^_{|}~]/);
      expect(generated.theoreticalSelectionBits).toBeGreaterThan(150);
      expect(analyzePassword(generated.password).score).toBeGreaterThanOrEqual(0);
    } finally {
      Math.random = original;
    }
  });

  it("excludes ambiguous characters when requested", () => {
    const generated = generatePassword({
      mode: "random",
      length: 64,
      excludeAmbiguous: true,
    });
    expect(generated.password).not.toMatch(/[ilLoO01]/);
  });

  it("generates passphrases from the documented local list with honest entropy metadata", () => {
    const generated = generatePassword({ mode: "passphrase", wordCount: 12, separator: " " });
    expect(generated.password.trim().split(/\s+/)).toHaveLength(12);
    expect(generated.theoreticalSelectionBits).toBeCloseTo(12 * Math.log2(PASSPHRASE_WORD_COUNT));
    expect(generated.source).toContain(String(PASSPHRASE_WORD_COUNT));
  });

  it("rejects unsafe lengths and empty character selections", () => {
    expect(() => generatePassword({ mode: "random", length: 7 })).toThrow(RangeError);
    expect(() => generatePassword({ mode: "random", length: 129 })).toThrow(RangeError);
    expect(() => generatePassword({
      mode: "random", length: 16, lowercase: false, uppercase: false, numbers: false, symbols: false,
    })).toThrow(RangeError);
    expect(() => generatePassword({ mode: "passphrase", wordCount: 3 })).toThrow(RangeError);
  });
});
