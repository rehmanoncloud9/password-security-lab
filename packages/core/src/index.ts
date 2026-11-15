export { analyzePassword } from "./analyze.js";
export { analyzeReuse } from "./reuse.js";
export { evaluatePolicy, policyCheckState } from "./policy.js";
export { generatePassword, PASSPHRASE_WORD_COUNT } from "./generate.js";
export { InputLimitError } from "./types.js";
export type {
  AnalysisResult,
  CharacterProfile,
  CheckState,
  FindingSeverity,
  PatternFinding,
  PolicyCheck,
  PolicyId,
  PolicyOptions,
  PolicyResult,
  ReusePair,
  ReuseResult,
  StrengthBand,
} from "./types.js";
export type { GeneratedPassword, GeneratorOptions } from "./generate.js";
