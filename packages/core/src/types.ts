/** Public, secret-free result contracts for browser and SDK consumers. */

export type StrengthBand = "very_weak" | "weak" | "moderate" | "strong" | "very_strong";
export type FindingSeverity = "warning" | "information";
export type CheckState = "pass" | "fail" | "not_checked" | "unavailable";
export type PolicyId = "modern_single_factor" | "modern_mfa" | "educational_traditional";

export interface PatternFinding {
  readonly id: string;
  readonly pattern: string;
  readonly severity: FindingSeverity;
  readonly explanation: string;
}

export interface CharacterProfile {
  readonly codePoints: number;
  readonly hasUppercase: boolean;
  readonly hasLowercase: boolean;
  readonly hasNumber: boolean;
  readonly hasSymbol: boolean;
  readonly hasWhitespace: boolean;
}

export interface AnalysisResult {
  readonly estimator: { readonly name: "zxcvbn-ts"; readonly version: "4.2.0"; readonly method: string };
  readonly score: 0 | 1 | 2 | 3 | 4;
  readonly band: StrengthBand;
  readonly estimatedGuesses: number;
  readonly findings: readonly PatternFinding[];
  readonly suggestions: readonly string[];
  readonly characterProfile: CharacterProfile;
  readonly limitations: readonly string[];
}

export interface PolicyCheck {
  readonly id: string;
  readonly label: string;
  readonly state: CheckState;
  readonly rationale: string;
}

export interface PolicyResult {
  readonly policyId: PolicyId;
  readonly label: string;
  readonly checks: readonly PolicyCheck[];
  readonly overall: "compliant" | "non_compliant" | "incomplete";
  readonly disclaimer: string;
}

export interface PolicyOptions {
  readonly minimumLength?: number;
  readonly checkBlocklist?: boolean;
}

export interface ReusePair {
  readonly firstIndex: number;
  readonly secondIndex: number;
  readonly similarity: number;
  readonly explanation: string;
}

export interface ReuseResult {
  readonly exactDuplicateGroups: readonly (readonly number[])[];
  readonly similarPairs: readonly ReusePair[];
  readonly limits: { readonly maxSamples: number; readonly maxLength: number; readonly threshold: number };
  readonly limitations: readonly string[];
}

export class InputLimitError extends RangeError {
  constructor(message: string) {
    super(message);
    this.name = "InputLimitError";
  }
}
