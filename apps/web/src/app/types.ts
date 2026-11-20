import type { AnalysisResult, PolicyId, PolicyResult } from "@psa/core";

export type PageId =
  | "overview"
  | "topology"
  | "analysis"
  | "policy"
  | "reuse"
  | "generator"
  | "hashing"
  | "attack"
  | "benchmarks"
  | "reports"
  | "learning";

export type LabAlgorithm = "sha256" | "pbkdf2_sha256" | "bcrypt" | "argon2id";
export type AttackExperiment =
  | "dictionary"
  | "bruteforce"
  | "pattern"
  | "suffix"
  | "substitution"
  | "word_combination";

export interface ApiHealth {
  readonly status: string;
  readonly scope: string;
  readonly processId: number;
  readonly uptimeSeconds: number;
  readonly cpuPercent: number;
  readonly processMemoryBytes: number;
  readonly hostMemoryBytes: number;
  readonly activeExperiments: number;
  readonly storedVerifiers: number;
}

export type CandidateVariant = "correct" | "wrong" | "modified";

export interface LabFixture {
  readonly fixtureId: string;
  readonly label: string;
  readonly description: string;
  readonly candidatePreview: string;
  readonly availableVariants: readonly string[];
}

export interface HashRecord {
  readonly hashId: string;
  readonly fixtureId: string;
  readonly algorithm: LabAlgorithm;
  readonly storedHash: string;
  readonly parameters: Record<string, number>;
  readonly salt: string | null;
  readonly generationMs: number;
}

export interface AttackJob {
  readonly jobId: string;
  readonly state: string;
  readonly attempts: number;
  readonly elapsedMs: number;
  readonly candidateElapsedMs: number;
  readonly candidateThroughputPerSecond: number;
  readonly algorithm: string;
  readonly parameters: Record<string, number>;
  readonly searchSpace: number | null;
  readonly stopReason: string | null;
  readonly targetRecovered: boolean;
}

export interface BenchmarkResult {
  readonly algorithm: string;
  readonly parameters: Record<string, number>;
  readonly repetitions: number;
  readonly hashGenerationMs: { readonly individual: number[]; readonly median: number; readonly iqr: number };
  readonly verificationMs: { readonly individual: number[]; readonly median: number; readonly iqr: number };
}

export interface BenchmarkReport {
  readonly kind: string;
  readonly method: string;
  readonly environment: Record<string, unknown>;
  readonly limitations: string[];
  readonly results: BenchmarkResult[];
}

export interface LabEvent {
  readonly id: number;
  readonly time: string;
  readonly level: "info" | "success" | "warning" | "error";
  readonly message: string;
}

export interface SafeResult {
  readonly id: number;
  readonly time: string;
  readonly category: "hash" | "verification" | "attack" | "benchmark" | "policy" | "reuse" | "generation";
  readonly title: string;
  readonly outcome: string;
  readonly durationMs?: number;
  readonly throughputPerSecond?: number;
  readonly algorithm?: string;
  readonly parameters?: Record<string, number>;
}

export interface AnalysisPageProps {
  readonly password: string;
  readonly onPasswordChange: (value: string) => void;
  readonly result: AnalysisResult | null;
  readonly error: string;
  readonly visible: boolean;
  readonly onToggleVisible: () => void;
  readonly onClear: () => void;
}

export interface PolicyPageProps {
  readonly password: string;
  readonly result: PolicyResult | null;
  readonly policyId: PolicyId;
  readonly onPolicyChange: (value: PolicyId) => void;
}

export type SafeResultInput = Omit<SafeResult, "id" | "time">;
