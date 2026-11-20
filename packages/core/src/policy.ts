import { estimator, MAX_PASSWORD_CODE_POINTS } from "./estimator.js";
import type { CheckState, PolicyCheck, PolicyId, PolicyOptions, PolicyResult, PolicyStandardMetadata } from "./types.js";
import { InputLimitError } from "./types.js";

const DISCLAIMER = "Reference policy for education; this is not compliance certification or a strength estimate.";

const NIST_METADATA: PolicyStandardMetadata = {
  name: "NIST SP 800-63B-4",
  version: "Draft 2024 / Published Revision 4",
  reference: "https://pages.nist.gov/800-63-4/sp800-63b.html#section-3.1.1",
};

function blocklistState(password: string, check: boolean): PolicyCheck {
  if (!check) {
    return {
      id: "whole-value-blocklist",
      label: "Exact whole-value dictionary screen",
      state: "not_checked",
      rationale: "The blocklist check was turned off for this evaluation.",
    };
  }
  const estimate = estimator.check(password);
  const exactDictionaryMatch = estimate.sequence.some(
    (match) => match.pattern === "dictionary" && match.i === 0 && match.j === password.length - 1,
  );
  return {
    id: "whole-value-blocklist",
    label: "Exact whole-value dictionary screen",
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

  const max = options.maximumLength;
  if (max !== undefined && (!Number.isInteger(max) || max < 1 || max > MAX_PASSWORD_CODE_POINTS)) {
    throw new RangeError(`maximumLength must be an integer between 1 and ${MAX_PASSWORD_CODE_POINTS}.`);
  }

  const checkBlocklist = options.checkBlocklist ?? true;
  let label: string;
  let standard: PolicyStandardMetadata | undefined;
  let checks: PolicyCheck[];

  if (policyId === "modern_single_factor") {
    const minimum = min ?? 15;
    label = "NIST SP 800-63B-4: Single-Factor Password (Modern Reference)";
    standard = NIST_METADATA;
    checks = [
      check(
        "minimum-length",
        `At least ${minimum} Unicode code points`,
        length >= minimum,
        `NIST SP 800-63B-4 requires a minimum of 15 code points for single-factor passwords. Current input has ${length} code points; input is not trimmed and spaces count.`,
      ),
      check(
        "no-composition-rules",
        "No character-class composition requirement",
        true,
        "Modern standards (NIST SP 800-63B-4 §3.1.1) recommend against forcing mixtures of uppercase, lowercase, numbers, and symbols.",
      ),
      check(
        "length-capacity",
        "Supports long passwords (at least 64 code points)",
        true,
        `The analyzer accepts up to ${MAX_PASSWORD_CODE_POINTS} code points without truncation, exceeding NIST's 64-character minimum requirement.`,
      ),
      blocklistState(password, checkBlocklist),
    ];
  } else if (policyId === "modern_mfa") {
    const minimum = min ?? 8;
    label = "NIST SP 800-63B-4: Multi-Factor Authentication Only (Permitted Minimum)";
    standard = NIST_METADATA;
    checks = [
      check(
        "minimum-length",
        `At least ${minimum} Unicode code points (MFA-only context)`,
        length >= minimum,
        `NIST SP 800-63B-4 permits a verifier to allow a minimum of 8 code points ONLY when the password is used as part of MFA. It is not recommended for single-factor accounts.`,
      ),
      check(
        "mfa-context-label",
        "Context qualification: MFA enforcement required",
        true,
        "This reduced length threshold applies only when a second authentication factor is actively enforced.",
      ),
      blocklistState(password, checkBlocklist),
    ];
  } else if (policyId === "educational_traditional") {
    const minimum = min ?? 8;
    label = "Educational Traditional Complexity (Legacy Example)";
    const classes = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9\s]/.test(password),
    ].filter(Boolean).length;
    checks = [
      check(
        "minimum-length",
        `At least ${minimum} characters`,
        length >= minimum,
        "This is an educational legacy rule and not the modern recommended policy.",
      ),
      check(
        "composition",
        "At least three of four character classes",
        classes >= 3,
        "Legacy classes are lowercase, uppercase, digits, and symbols. Modern standards discourage these rules.",
      ),
      blocklistState(password, checkBlocklist),
    ];
  } else if (policyId === "custom_service") {
    label = "Custom Service Compatibility Profile";
    checks = [];
    if (min !== undefined) {
      checks.push(
        check(
          "minimum-length",
          `At least ${min} characters`,
          length >= min,
          `Service minimum required length is ${min} characters.`,
        ),
      );
    }
    if (max !== undefined) {
      checks.push(
        check(
          "maximum-length",
          `No more than ${max} characters`,
          length <= max,
          `Service maximum length ceiling is ${max} characters.`,
        ),
      );
    }
    if (options.allowedPattern) {
      const regex = typeof options.allowedPattern === "string"
        ? new RegExp(options.allowedPattern)
        : options.allowedPattern;
      const matched = regex.test(password);
      checks.push(
        check(
          "allowed-characters",
          "Permitted character set constraint",
          matched,
          `Candidate ${matched ? "satisfies" : "violates"} the service's custom character filter: ${regex}`,
        ),
      );
    }
    checks.push(blocklistState(password, checkBlocklist));
  } else {
    throw new RangeError("Unknown policy identifier.");
  }

  return {
    policyId,
    label,
    ...(standard ? { standard } : {}),
    checks,
    overall: aggregate(checks),
    disclaimer: DISCLAIMER,
  };
}

export function policyCheckState(result: PolicyResult, id: string): CheckState | undefined {
  return result.checks.find((item) => item.id === id)?.state;
}
