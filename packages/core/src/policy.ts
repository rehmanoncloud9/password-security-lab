import { estimator, MAX_PASSWORD_CODE_POINTS } from "./estimator.js";
import type { CheckState, PolicyCheck, PolicyId, PolicyOptions, PolicyResult } from "./types.js";
import { InputLimitError } from "./types.js";

const DISCLAIMER = "Reference policy for education; this is not compliance certification or a strength estimate.";

function blocklistState(password: string, check: boolean): PolicyCheck {
  if (!check) return {
    id: "whole-value-blocklist", label: "Exact whole-value dictionary screen", state: "not_checked",
    rationale: "The blocklist check was turned off for this evaluation.",
  };
  const estimate = estimator.check(password);
  const exactDictionaryMatch = estimate.sequence.some(
    (match) => match.pattern === "dictionary" && match.i === 0 && match.j === password.length - 1,
  );
  return {
    id: "whole-value-blocklist", label: "Exact whole-value dictionary screen",
    state: exactDictionaryMatch ? "fail" : "pass",
    rationale: exactDictionaryMatch
      ? "The complete candidate matches an entry in the bundled English/common zxcvbn dictionaries."
      : "No exact whole-value dictionary match was found in the bundled English/common dictionaries; this is not a breach corpus.",
  };
}

function check(id: string, label: string, passed: boolean, rationale: string): PolicyCheck {
  return { id, label, state: passed ? "pass" : "fail", rationale };
}

function aggregate(checks: readonly PolicyCheck[]): PolicyResult["overall"] {
  if (checks.some((item) => item.state === "fail")) return "non_compliant";
  if (checks.some((item) => item.state === "not_checked" || item.state === "unavailable")) return "incomplete";
  return "compliant";
}

/** Evaluate policy independently from strength and exposure. */
export function evaluatePolicy(
  password: string,
  policyId: PolicyId,
  options: PolicyOptions = {},
): PolicyResult {
  if (typeof password !== "string") throw new TypeError("Password input must be text.");
  if (password.length > MAX_PASSWORD_CODE_POINTS * 2) {
    throw new InputLimitError(`Input exceeds the ${MAX_PASSWORD_CODE_POINTS} Unicode code point limit.`);
  }
  const length = Array.from(password).length;
  if (length > MAX_PASSWORD_CODE_POINTS) {
    throw new InputLimitError(`Input exceeds the ${MAX_PASSWORD_CODE_POINTS} Unicode code point limit.`);
  }
  const min = options.minimumLength;
  if (min !== undefined && (!Number.isInteger(min) || min < 1 || min > 128)) {
    throw new RangeError("minimumLength must be an integer between 1 and 128.");
  }
  const checkBlocklist = options.checkBlocklist ?? true;
  let label: string;
  let checks: PolicyCheck[];
  if (policyId === "modern_single_factor" || policyId === "modern_mfa") {
    const baseline = policyId === "modern_single_factor" ? 15 : 8;
    const minimum = min ?? baseline;
    label = policyId === "modern_single_factor" ? "Modern reference (single factor)" : "Modern reference (MFA factor)";
    checks = [
      check("minimum-length", `At least ${minimum} Unicode code points`, length >= minimum,
        `This profile uses a ${minimum}-code-point minimum; spaces count and input is not trimmed.`),
      blocklistState(password, checkBlocklist),
    ];
  } else if (policyId === "educational_traditional") {
    const minimum = min ?? 8;
    label = "Educational traditional complexity (legacy example)";
    const classes = [/[a-z]/.test(password), /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9\s]/.test(password)].filter(Boolean).length;
    checks = [
      check("minimum-length", `At least ${minimum} characters`, length >= minimum,
        "This is an educational legacy rule and not the modern recommended policy."),
      check("composition", "At least three of four character classes", classes >= 3,
        "Legacy classes are lowercase, uppercase, digits, and symbols."),
      blocklistState(password, checkBlocklist),
    ];
  } else {
    throw new RangeError("Unknown policy identifier.");
  }
  return { policyId, label, checks, overall: aggregate(checks), disclaimer: DISCLAIMER };
}

export function policyCheckState(result: PolicyResult, id: string): CheckState | undefined {
  return result.checks.find((item) => item.id === id)?.state;
}
