import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import {
  analyzePassword,
  analyzeReuse,
  evaluatePolicy,
  generatePassword,
  secureRandomIndex,
  buildAlphabet,
  checkLocalBlocklist,
  checkExposureHibp,
  BLOCKLIST_METADATA,
  InputLimitError,
  MAX_FINITE_GUESS_ESTIMATE,
  PASSPHRASE_WORD_COUNT,
  EFF_LARGE_WORDLIST,
  WORDLIST_METADATA,
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

  it("reports actual repeated, sequence, keyboard, and substitution matches", () => {
    const patterns = (sample: string) => analyzePassword(sample).findings.map((item) => item.pattern);
    expect(patterns("aaaaaaaaaaaa")).toContain("repeat");
    expect(patterns("abcdef")).toContain("sequence");
    expect(patterns("qwerty")).toContain("spatial");
    expect(patterns("asdfgh")).toContain("spatial");
    expect(patterns("123456")).toEqual(expect.arrayContaining(["sequence", "spatial"]));
    expect(patterns("p@ssw0rd")).toContain("l33t");
    expect(patterns("qwerty-password")).toEqual(expect.arrayContaining(["spatial", "dictionary"]));
    const unicode = "caf\u00e9 \u{1f408} river! green";
    expect(analyzePassword(unicode).characterProfile.codePoints).toBe(Array.from(unicode).length);
    expect(analyzePassword("").findings).toEqual([]);
    expect(patterns("orchard canvas river lantern meadow amber")).toContain("dictionary");
    expect(JSON.stringify(analyzePassword("qwerty-password"))).not.toContain("qwerty-password");
  });

  it("accepts the maximum supported length without truncating and rejects the next code point", () => {
    const maximum = "x".repeat(256);
    expect(analyzePassword(maximum).characterProfile.codePoints).toBe(256);
    expect(() => analyzePassword(`${maximum}x`)).toThrow(InputLimitError);
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

  it("does not cross-contaminate findings between re-entrant or interleaved calls", () => {
    const resA1 = analyzePassword("qwerty");
    const resB = analyzePassword("123456");
    const resA2 = analyzePassword("qwerty");
    expect(resA1.findings).toEqual(resA2.findings);
    expect(resA1.findings.map((f) => f.pattern)).not.toEqual(resB.findings.map((f) => f.pattern));
  });

  it("bounds massive or infinite guess estimates cleanly", () => {
    const huge = analyzePassword("K9#vQ2!mZ7$xL4@wP0^yR1*bN3&vC5~jT6%uF8".repeat(5));
    expect(huge.estimatedGuesses).toBeLessThanOrEqual(MAX_FINITE_GUESS_ESTIMATE);
    expect(huge.isGuessesBounded).toBe(true);
  }, 15000);
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
    expect(result.label).toMatch(/legacy example/i);
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

  it("evaluates custom service compatibility profile constraints", () => {
    const valid = evaluatePolicy("CustomValid99", "custom_service", {
      minimumLength: 8,
      maximumLength: 16,
      allowedPattern: "^[A-Za-z0-9]+$",
    });
    expect(valid.overall).toBe("compliant");

    const tooLong = evaluatePolicy("CustomValid12345678901", "custom_service", {
      minimumLength: 8,
      maximumLength: 16,
    });
    expect(tooLong.checks.find((c) => c.id === "maximum-length")?.state).toBe("fail");
    expect(tooLong.overall).toBe("non_compliant");
  });
});

describe("bundled local common-password blocklist", () => {
  it("detects exact and case-insensitive whole matches without leaking secrets", () => {
    const hit = checkLocalBlocklist("123456");
    expect(hit.state).toBe("found_in_local_list");
    expect(JSON.stringify(hit)).not.toContain("123456");

    const hitCase = checkLocalBlocklist("PASSWORD");
    expect(hitCase.state).toBe("found_in_local_list");

    const miss = checkLocalBlocklist("unusual-completely-unlisted-passphrase-2026");
    expect(miss.state).toBe("not_found_in_local_list");
    expect(miss.message).toContain("Not found in this local common blocklist");
  });

  it("verifies blocklist metadata and checksum", () => {
    expect(BLOCKLIST_METADATA.count).toBe(1000);
    expect(BLOCKLIST_METADATA.sha256).toBe(
      "0b681d2d126f56bc877e41e22963bb75b659cb66db15111f23549ee6825d7a23",
    );
  });
});

describe("optional consented HIBP range check", () => {
  it("refuses to query when userConsented is false", async () => {
    const res = await checkExposureHibp("password", { userConsented: false });
    expect(res.state).toBe("not_checked");
    expect(res.message).toContain("requires explicit user consent");
  });

  it("queries k-anonymity range API with only 5-character prefix and matches locally", async () => {
    // "password" SHA-1 is 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    // prefix is 5BAA6, suffix is 1E4C9B93F3F0682250B6CF8331B7EE68FD8
    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};
    const mockFetch: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      const body = "003D68EB55068C33ACE09247EE4C639306B:3\r\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:3861493\r\n";
      return new Response(body, { status: 200 });
    };

    const res = await checkExposureHibp("password", {
      userConsented: true,
      fetchFn: mockFetch,
    });

    expect(capturedUrl).toBe("https://api.pwnedpasswords.com/range/5BAA6");
    expect(capturedHeaders["Add-Padding"]).toBe("true");
    expect(res.state).toBe("found_in_provider_corpus");
    expect(res.breachCount).toBe(3861493);
    expect(JSON.stringify(res)).not.toContain("password");
  });

  it("returns unavailable when range API returns error or fails", async () => {
    const mockFetch: typeof fetch = async () => new Response("Server error", { status: 500 });
    const res = await checkExposureHibp("password", {
      userConsented: true,
      fetchFn: mockFetch,
    });
    expect(res.state).toBe("unavailable");
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
    expect(generated.wordlistSize).toBe(7776);
  });

  it("verifies wordlist size, distinctness, and documented provenance metadata", () => {
    expect(EFF_LARGE_WORDLIST).toHaveLength(7776);
    const unique = new Set(EFF_LARGE_WORDLIST);
    expect(unique.size).toBe(7776);
    expect(WORDLIST_METADATA.name).toBe("EFF Large Wordlist");
    expect(WORDLIST_METADATA.license).toBe("CC-BY-3.0-US");
    expect(WORDLIST_METADATA.sha256).toBe(
      "addd35536511597a02fa0a9ff1e5284677b8883b83e986e43f15a3db996b903e",
    );
  });

  it("performs unbiased rejection sampling for non-power-of-two ranges", () => {
    // Test custom byte source feeding values near the acceptance limit
    let callCount = 0;
    // For size 70: 256 / 70 = 3 remainder 46 -> acceptance limit is 210.
    // If we supply 215 (>= 210), it must reject and re-sample.
    const customSource = (buf: Uint8Array | Uint16Array) => {
      callCount++;
      if (callCount === 1) {
        buf[0] = 215; // rejected
      } else {
        buf[0] = 35; // accepted: 35 % 70 = 35
      }
    };
    const index = secureRandomIndex(70, customSource);
    expect(index).toBe(35);
    expect(callCount).toBe(2);
  });

  it("supports deterministic testing injection without affecting production CSPRNG requirement", () => {
    let mockVal = 0;
    const testSource = (buf: Uint8Array | Uint16Array) => {
      buf[0] = mockVal;
      mockVal = (mockVal + 1) % 100;
    };
    const gen = generatePassword({ mode: "random", length: 10 }, testSource);
    expect(gen.password).toHaveLength(10);
  });

  it("fails closed when Web Crypto is unavailable", () => {
    const desc = Object.getOwnPropertyDescriptor(globalThis, "crypto") || {
      value: globalThis.crypto,
      configurable: true,
      writable: true,
    };
    try {
      Object.defineProperty(globalThis, "crypto", {
        value: undefined,
        configurable: true,
        writable: true,
      });
      expect(() => secureRandomIndex(10)).toThrow(/cryptographically secure random source/);
    } finally {
      Object.defineProperty(globalThis, "crypto", desc);
    }
  });

  it("rejects unsafe lengths and empty character selections", () => {
    expect(() => generatePassword({ mode: "random", length: 7 })).toThrow(RangeError);
    expect(() => generatePassword({ mode: "random", length: 129 })).toThrow(RangeError);
    expect(() => generatePassword({
      mode: "random", length: 16, lowercase: false, uppercase: false, numbers: false, symbols: false,
    })).toThrow(RangeError);
    expect(() => generatePassword({ mode: "passphrase", wordCount: 3 })).toThrow(RangeError);
    expect(() => generatePassword({ mode: "passphrase", wordCount: 21 })).toThrow(RangeError);
  });
});
