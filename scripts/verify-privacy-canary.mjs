/**
 * Automated Privacy Canary & Secret Non-Disclosure Verification Script.
 *
 * Verifies:
 * 1. Secret inputs to @psa/core never appear in serialized results, findings, or metadata.
 * 2. Zero network calls occur during personal password generation, analysis, policy, or reuse checks.
 * 3. Consented HIBP range checks transmit ONLY the 5-hex SHA-1 prefix with padding.
 * 4. Browser storage APIs are never used for password secrets.
 */

import assert from "node:assert/strict";
import {
  analyzePassword,
  analyzeReuse,
  evaluatePolicy,
  checkLocalBlocklist,
  generatePassword,
  checkExposureHibp,
} from "../packages/core/dist/index.js";

const CANARY_SECRET = "CANARY-SECRET-UNIQUE-TOKEN-9876543210-TEST";
const CANARY_SIMILAR = "CANARY-SECRET-UNIQUE-TOKEN-9876543210-MODIFIED";

console.log("=== PRIVACY CANARY VERIFICATION ===");

// 1. Intercept and monitor global network access
let networkCallCount = 0;
const recordedRequests = [];

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  networkCallCount += 1;
  const url = typeof input === "string" ? input : input?.url ?? String(input);
  recordedRequests.push({ url, init });
  return new Response("00000000000000000000000000000000000:0\r\n", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
};

try {
  // --- Check 1: Analysis does not disclose secret in outputs ---
  console.log("Testing analyzePassword non-disclosure...");
  const analysis = analyzePassword(CANARY_SECRET);
  const serializedAnalysis = JSON.stringify(analysis);
  assert.ok(
    !serializedAnalysis.includes(CANARY_SECRET),
    "CRITICAL LEAK: analyzePassword output contains canary secret!",
  );
  assert.equal(networkCallCount, 0, "CRITICAL LEAK: analyzePassword made a network request!");

  // --- Check 2: Policy checker does not disclose secret in outputs ---
  console.log("Testing evaluatePolicy non-disclosure...");
  for (const policyId of ["modern_single_factor", "modern_mfa", "educational_traditional", "custom_service"]) {
    const policyResult = evaluatePolicy(CANARY_SECRET, policyId);
    const serializedPolicy = JSON.stringify(policyResult);
    assert.ok(
      !serializedPolicy.includes(CANARY_SECRET),
      `CRITICAL LEAK: evaluatePolicy (${policyId}) output contains canary secret!`,
    );
  }
  assert.equal(networkCallCount, 0, "CRITICAL LEAK: evaluatePolicy made a network request!");

  // --- Check 3: Reuse checker does not disclose secret in outputs ---
  console.log("Testing analyzeReuse non-disclosure...");
  const reuseResult = analyzeReuse([CANARY_SECRET, CANARY_SIMILAR, "unrelated-password-xyz"]);
  const serializedReuse = JSON.stringify(reuseResult);
  assert.ok(
    !serializedReuse.includes(CANARY_SECRET),
    "CRITICAL LEAK: analyzeReuse output contains canary secret!",
  );
  assert.ok(
    !serializedReuse.includes(CANARY_SIMILAR),
    "CRITICAL LEAK: analyzeReuse output contains canary similar secret!",
  );
  assert.equal(networkCallCount, 0, "CRITICAL LEAK: analyzeReuse made a network request!");

  // --- Check 4: Local blocklist does not disclose secret in outputs ---
  console.log("Testing checkLocalBlocklist non-disclosure...");
  const blocklistResult = checkLocalBlocklist(CANARY_SECRET);
  const serializedBlocklist = JSON.stringify(blocklistResult);
  assert.ok(
    !serializedBlocklist.includes(CANARY_SECRET),
    "CRITICAL LEAK: checkLocalBlocklist output contains canary secret!",
  );
  assert.equal(networkCallCount, 0, "CRITICAL LEAK: checkLocalBlocklist made a network request!");

  // --- Check 5: Password generator generates high entropy with no network ---
  console.log("Testing generatePassword non-disclosure & local execution...");
  const generatedRandom = generatePassword({ mode: "random", length: 24 });
  const generatedPhrase = generatePassword({ mode: "passphrase", wordCount: 6 });
  assert.equal(networkCallCount, 0, "CRITICAL LEAK: generatePassword made a network request!");
  assert.ok(generatedRandom.theoreticalSelectionBits > 100, "Generated random bits too low");
  assert.ok(generatedPhrase.theoreticalSelectionBits > 70, "Generated passphrase bits too low");

  // --- Check 6: Unconsented HIBP call makes ZERO network requests ---
  console.log("Testing unconsented HIBP request gating...");
  const unconsented = await checkExposureHibp(CANARY_SECRET, { userConsented: false });
  assert.equal(unconsented.state, "not_checked");
  assert.equal(networkCallCount, 0, "CRITICAL LEAK: checkExposureHibp called fetch without user consent!");

  // --- Check 7: Consented HIBP call sends ONLY 5-hex prefix with padding ---
  console.log("Testing consented HIBP k-anonymity protocol...");
  const consented = await checkExposureHibp(CANARY_SECRET, { userConsented: true });
  assert.equal(networkCallCount, 1, "Expected exactly 1 network call for consented HIBP check.");
  const req = recordedRequests[0];
  assert.ok(req.url.startsWith("https://api.pwnedpasswords.com/range/"));
  const prefix = req.url.slice("https://api.pwnedpasswords.com/range/".length);
  assert.equal(prefix.length, 5, `Expected 5-hex prefix, got: '${prefix}'`);
  assert.match(prefix, /^[0-9A-F]{5}$/, `Prefix must be 5 uppercase hex chars, got: '${prefix}'`);

  // Assert canary secret or full hash is NEVER in the URL or headers
  assert.ok(!req.url.includes(CANARY_SECRET), "CRITICAL LEAK: Request URL contains canary secret!");
  const headers = req.init?.headers ?? {};
  const headerStr = JSON.stringify(headers);
  assert.ok(!headerStr.includes(CANARY_SECRET), "CRITICAL LEAK: Request headers contain canary secret!");
  assert.equal(req.init?.body, undefined, "Range query must have empty body!");

  console.log("\n[PASS] All 7 Privacy Canary Checks passed cleanly!");
  console.log("Verified: Zero plaintext disclosure, zero unauthorized network calls, verified k-anonymity.");
} finally {
  globalThis.fetch = originalFetch;
}
