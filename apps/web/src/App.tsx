import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analyzePassword, evaluatePolicy, type PolicyId } from "@psa/core";
import { AppShell } from "./components/AppShell.js";
import { BottomPanels, OperationsRail } from "./components/OperationalPanels.js";
import { AnalysisPage, GeneratorPage, PolicyPage, ReusePage } from "./features/AnalysisLaboratory.js";
import { AttackPage } from "./features/AttackPage.js";
import { BenchmarksPage, ReportsPage } from "./features/BenchmarkReports.js";
import { HashingPage } from "./features/HashingPage.js";
import { LearningPage, OverviewPage, TopologyPage } from "./features/OverviewTopologyLearning.js";
import { readThemePreference, saveThemePreference } from "./theme/preferences.js";
import type { Theme } from "./theme/preferences.js";
import type {
  ApiHealth,
  AttackExperiment,
  AttackJob,
  BenchmarkReport,
  HashRecord,
  LabAlgorithm,
  LabEvent,
  PageId,
  SafeResult,
  SafeResultInput,
} from "./app/types.js";

const API = "http://127.0.0.1:8000";
const TERMINAL_STATES = new Set(["recovered", "not_found_within_budget", "cancelled", "time_limit", "attempt_limit", "error"]);

class LabApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "LabApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API}${path}`, { ...init, headers });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }
  if (!response.ok) {
    const detail = isRecord(payload) && typeof payload.detail === "string" ? payload.detail : "Laboratory request failed.";
    throw new LabApiError(response.status >= 500 ? "The local laboratory could not complete the request." : detail, response.status);
  }
  return payload as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiHealth(value: unknown): value is ApiHealth {
  if (!isRecord(value)) return false;
  return value.status === "ok"
    && typeof value.scope === "string"
    && Number.isSafeInteger(value.processId)
    && typeof value.uptimeSeconds === "number" && Number.isFinite(value.uptimeSeconds)
    && typeof value.cpuPercent === "number" && Number.isFinite(value.cpuPercent)
    && typeof value.processMemoryBytes === "number" && Number.isFinite(value.processMemoryBytes)
    && typeof value.hostMemoryBytes === "number" && Number.isFinite(value.hostMemoryBytes)
    && typeof value.activeExperiments === "number" && Number.isSafeInteger(value.activeExperiments)
    && typeof value.storedVerifiers === "number" && Number.isSafeInteger(value.storedVerifiers);
}

type HashOptions = {
  readonly iterations?: number;
  readonly work_factor?: number;
  readonly memory_kib?: number;
  readonly time_cost?: number;
  readonly parallelism?: number;
};

export function App() {
  const [page, setPage] = useState<PageId>("overview");
  const [theme, setTheme] = useState<Theme>(readThemePreference);
  const [api, setApi] = useState<ApiHealth | null>(null);
  const [apiError, setApiError] = useState("");
  const [password, setPassword] = useState("");
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [policyId, setPolicyId] = useState<PolicyId>("modern_single_factor");
  const [hashes, setHashes] = useState<HashRecord[]>([]);
  const [job, setJob] = useState<AttackJob | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkReport | null>(null);
  const [benchmarkBusy, setBenchmarkBusy] = useState(false);
  const [labError, setLabError] = useState("");
  const [events, setEvents] = useState<LabEvent[]>([]);
  const [results, setResults] = useState<SafeResult[]>([]);
  const eventId = useRef(0);
  const resultId = useRef(0);
  const apiWasAvailable = useRef<boolean | null>(null);
  const previousAttempts = useRef(0);
  const recordedJob = useRef<string | null>(null);

  const addEvent = useCallback((level: LabEvent["level"], message: string) => {
    setEvents((current) => [{ id: ++eventId.current, time: new Date().toISOString(), level, message }, ...current].slice(0, 100));
  }, []);

  const addSafeResult = useCallback((result: SafeResultInput) => {
    setResults((current) => [{ ...result, id: ++resultId.current, time: new Date().toISOString() }, ...current].slice(0, 200));
  }, []);

  const navigate = useCallback((next: PageId) => {
    setPage(next);
    setLabError("");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (!saveThemePreference(theme)) {
      addEvent("warning", "Theme preference could not be saved; the selected theme remains active for this page.");
    }
  }, [theme, addEvent]);

  useEffect(() => {
    let disposed = false;
    let timer = 0;
    const refresh = async () => {
      try {
        const response = await request<unknown>("/lab/health");
        if (!isApiHealth(response)) throw new Error("The local API health response did not match the documented schema.");
        if (disposed) return;
        setApi(response);
        setApiError("");
        if (apiWasAvailable.current !== true) addEvent("success", "Loopback Python laboratory API health check succeeded.");
        apiWasAvailable.current = true;
      } catch {
        if (disposed) return;
        setApi(null);
        setApiError("The loopback API health check is unavailable.");
        if (apiWasAvailable.current !== false) addEvent("warning", "Loopback Python laboratory API is unavailable.");
        apiWasAvailable.current = false;
      }
      if (!disposed) timer = window.setTimeout(() => void refresh(), 5000);
    };
    void refresh();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
  }, [addEvent]);

  const analysisState = useMemo(() => {
    if (!password) return { result: null, error: "" };
    try {
      return { result: analyzePassword(password), error: "" };
    } catch (cause) {
      return { result: null, error: cause instanceof Error ? cause.message : "Analysis could not be completed." };
    }
  }, [password]);

  const policyState = useMemo(() => {
    if (!password) return { result: null, error: "" };
    try {
      return { result: evaluatePolicy(password, policyId), error: "" };
    } catch (cause) {
      return { result: null, error: cause instanceof Error ? cause.message : "Policy evaluation could not be completed." };
    }
  }, [password, policyId]);

  const recordAttack = useCallback((current: AttackJob) => {
    if (recordedJob.current === current.jobId) return;
    recordedJob.current = current.jobId;
    const level: LabEvent["level"] = current.state === "recovered" ? "success" : current.state === "error" ? "error" : "warning";
    addEvent(level, `Synthetic attack experiment ended: ${current.state.replaceAll("_", " ")}; ${current.attempts.toLocaleString()} check(s).`);
    addSafeResult({ category: "attack", title: `${current.algorithm} ${current.state.replaceAll("_", " ")} experiment`, outcome: `${current.attempts} of ${current.searchSpace ?? "unknown"} candidates checked; ${current.stopReason ?? current.state}`, durationMs: current.elapsedMs, throughputPerSecond: current.candidateThroughputPerSecond, algorithm: current.algorithm, parameters: current.parameters });
  }, [addEvent, addSafeResult]);

  useEffect(() => {
    if (!job || !["queued", "running"].includes(job.state)) return;
    let disposed = false;
    let timer = 0;
    let failureLogged = false;
    const poll = async () => {
      try {
        const current = await request<AttackJob>(`/lab/attacks/${job.jobId}`);
        if (disposed) return;
        if (failureLogged) addEvent("success", "Experiment status polling resumed.");
        failureLogged = false;
        setJob(current);
        if (current.attempts > previousAttempts.current) {
          previousAttempts.current = current.attempts;
          addEvent("info", `Synthetic experiment checked ${current.attempts.toLocaleString()} actual candidate(s).`);
        }
        if (TERMINAL_STATES.has(current.state)) {
          recordAttack(current);
        } else if (!TERMINAL_STATES.has(current.state)) {
          timer = window.setTimeout(() => void poll(), 400);
        }
      } catch (cause) {
        if (disposed) return;
        if (cause instanceof LabApiError && cause.status === 404) {
          const unavailable: AttackJob = { ...job, state: "error", stopReason: "record_unavailable" };
          setJob(unavailable);
          addEvent("error", "Experiment record expired or became unavailable; final outcome is unknown.");
          return;
        }
        const message = cause instanceof Error ? cause.message : "Experiment status could not be read.";
        setLabError(message);
        if (!failureLogged) addEvent("error", "Experiment status request failed; retrying without logging candidate or password data.");
        failureLogged = true;
        timer = window.setTimeout(() => void poll(), 2000);
      }
    };
    timer = window.setTimeout(() => void poll(), 400);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
  }, [job?.jobId, job?.state, addEvent, recordAttack]);

  async function createHash(value: string, algorithm: LabAlgorithm, options: HashOptions): Promise<boolean> {
    setLabError("");
    try {
      const record = await request<HashRecord>("/lab/hash", {
        method: "POST",
        body: JSON.stringify({ password: value, algorithm, ...options }),
      });
      setHashes((current) => [record, ...current]);
      addEvent("success", `Created a ${algorithm.replaceAll("_", "-")} verifier using the local cryptographic library.`);
      addSafeResult({ category: "hash", title: `${algorithm.replaceAll("_", "-")} verifier created`, outcome: "Actual local hash operation completed", durationMs: record.generationMs, algorithm: record.algorithm, parameters: record.parameters });
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Hash operation failed.";
      setLabError(message);
      addEvent("error", `Hash request failed${cause instanceof LabApiError ? ` with HTTP ${cause.status}` : " because the local service did not respond"}.`);
      return false;
    }
  }

  async function verifyHash(hashId: string, value: string): Promise<{ matched: boolean; algorithm: string; verificationMs: number }> {
    setLabError("");
    try {
      const verified = await request<{ matched: boolean; algorithm: string; verificationMs: number }>("/lab/verify", {
        method: "POST",
        body: JSON.stringify({ hash_id: hashId, password: value }),
      });
      const outcome = verified.matched ? "Candidate matched" : "Candidate did not match";
      addEvent(verified.matched ? "success" : "info", `${verified.algorithm.replaceAll("_", "-")} verification completed: ${outcome.toLocaleLowerCase()}.`);
      addSafeResult({ category: "verification", title: `${verified.algorithm.replaceAll("_", "-")} verification`, outcome, durationMs: verified.verificationMs, algorithm: verified.algorithm });
      return verified;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Verification failed.";
      setLabError(message);
      addEvent("error", `Verification request failed${cause instanceof LabApiError ? ` with HTTP ${cause.status}` : " because the local service did not respond"}.`);
      throw cause;
    }
  }

  async function clearLab(): Promise<boolean> {
    if (!window.confirm("Clear local verifier records and request cancellation of the current synthetic experiment?")) return false;
    if (!api && hashes.length) {
      setLabError("The API is unavailable, so the server-side verifier records cannot be explicitly deleted yet.");
      return false;
    }
    setLabError("");
    try {
      if (job && ["queued", "running"].includes(job.state)) {
        try {
          await request(`/lab/attacks/${job.jobId}`, { method: "DELETE" });
        } catch (cause) {
          if (!(cause instanceof LabApiError) || cause.status !== 404) throw cause;
        }
        let state = job.state;
        for (let attempt = 0; attempt < 30 && ["queued", "running"].includes(state); attempt += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 100));
          try {
            state = (await request<AttackJob>(`/lab/attacks/${job.jobId}`)).state;
          } catch (cause) {
            if (!(cause instanceof LabApiError) || cause.status !== 404) throw cause;
            state = "cancelled";
          }
        }
        if (["queued", "running"].includes(state)) throw new Error("The experiment is still stopping; retry after it finishes.");
      }
      for (const record of hashes) {
        try {
          await request(`/lab/hash/${record.hashId}`, { method: "DELETE" });
        } catch (cause) {
          if (!(cause instanceof LabApiError) || cause.status !== 404) throw cause;
        }
      }
      setHashes([]);
      if (job && ["queued", "running"].includes(job.state)) {
        addSafeResult({ category: "attack", title: "Synthetic experiment cancelled", outcome: `${job.attempts} attempt(s) recorded before cancellation`, durationMs: job.elapsedMs, algorithm: job.algorithm, parameters: job.parameters });
      }
      setJob(null);
      addEvent("success", "Short-lived verifier records were deleted and active experiment cancellation was confirmed.");
      return true;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Local laboratory state could not be cleared.";
      setLabError(message);
      addEvent("error", "The lab could not confirm cleanup; server-side state remains subject to its short TTL.");
      return false;
    }
  }

  async function startAttack(input: {
    experiment: AttackExperiment;
    targetId: string;
    algorithm: LabAlgorithm;
    maxAttempts: number;
    timeoutSeconds: number;
    alphabetId: "binary" | "digits-small";
    maxLength: number;
  }): Promise<void> {
    setLabError("");
    setJob(null);
    previousAttempts.current = 0;
    recordedJob.current = null;
    try {
      const started = await request<AttackJob>("/lab/attacks", {
        method: "POST",
        body: JSON.stringify({
          experiment: input.experiment,
          target_id: input.targetId,
          algorithm: input.algorithm,
          max_attempts: input.maxAttempts,
          timeout_seconds: input.timeoutSeconds,
          alphabet_id: input.alphabetId,
          max_length: input.maxLength,
        }),
      });
      setJob(started);
      addEvent("info", `Validated and started a bounded ${input.experiment.replaceAll("_", " ")} experiment against a fixed internal target.`);
      if (TERMINAL_STATES.has(started.state)) recordAttack(started);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Experiment could not start.";
      setLabError(message);
      addEvent("error", `Experiment start was rejected${cause instanceof LabApiError ? ` with HTTP ${cause.status}` : " by the unavailable local service"}.`);
    }
  }

  async function cancelAttack(): Promise<void> {
    if (!job) return;
    try {
      const updated = await request<AttackJob>(`/lab/attacks/${job.jobId}`, { method: "DELETE" });
      setJob(updated);
      addEvent("warning", "Cancellation requested for the active synthetic experiment.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Cancellation request failed.";
      setLabError(message);
      addEvent("error", "Experiment cancellation request failed.");
    }
  }

  async function runBenchmark(): Promise<BenchmarkReport | null> {
    if (!api) {
      setLabError("The local API is unavailable; no benchmark was run.");
      return null;
    }
    setBenchmarkBusy(true);
    setLabError("");
    addEvent("info", "Started five measured hash and verification repetitions per algorithm.");
    try {
      const measured = await request<BenchmarkReport>("/lab/benchmarks", { method: "POST", body: JSON.stringify({}) });
      setBenchmark(measured);
      addEvent("success", `Benchmark finished with ${measured.results.length} algorithms and actual local measurements.`);
      return measured;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Benchmark could not run.";
      setLabError(message);
      addEvent("error", "Benchmark request failed; no example measurements were substituted.");
      return null;
    } finally {
      setBenchmarkBusy(false);
    }
  }

  async function runQuickBenchmark() {
    navigate("benchmarks");
    await runBenchmark();
  }

  function clearEvents() {
    setEvents([]);
  }

  function clearResults() {
    setResults([]);
    addEvent("info", "Current-session result summaries were cleared from page memory.");
  }

  const pageContent = (() => {
    switch (page) {
      case "overview":
        return <OverviewPage api={api} job={job} results={results} onNavigate={navigate} />;
      case "topology":
        return <TopologyPage api={api} job={job} results={results} onNavigate={navigate} />;
      case "analysis":
        return <AnalysisPage password={password} onPasswordChange={setPassword} result={analysisState.result} error={analysisState.error} visible={analysisVisible} onToggleVisible={() => setAnalysisVisible((value) => !value)} onClear={() => { setPassword(""); setAnalysisVisible(false); }} />;
      case "policy":
        return <PolicyPage password={password} onPasswordChange={setPassword} result={policyState.result} policyId={policyId} onPolicyChange={setPolicyId} onEvent={addEvent} onSafeResult={addSafeResult} />;
      case "reuse":
        return <ReusePage onEvent={addEvent} onSafeResult={addSafeResult} />;
      case "generator":
        return <GeneratorPage onEvent={addEvent} onSafeResult={addSafeResult} />;
      case "hashing":
        return <HashingPage apiAvailable={Boolean(api)} hasActiveJob={Boolean(job && ["queued", "running"].includes(job.state))} hashes={hashes} operationError={labError} onCreateHash={createHash} onVerify={verifyHash} onClear={clearLab} />;
      case "attack":
        return <AttackPage apiAvailable={Boolean(api)} job={job} operationError={labError} onStart={startAttack} onCancel={cancelAttack} />;
      case "benchmarks":
        return <BenchmarksPage apiAvailable={Boolean(api)} report={benchmark} busy={benchmarkBusy} error={labError} onRun={runBenchmark} onSafeResult={addSafeResult} />;
      case "reports":
        return <ReportsPage results={results} onClear={clearResults} />;
      case "learning":
        return <LearningPage onNavigate={navigate} />;
    }
  })();

  return <AppShell
    page={page}
    onNavigate={navigate}
    theme={theme}
    onToggleTheme={() => setTheme((current) => current === "light" ? "dark" : "light")}
    api={api}
    apiError={apiError}
    rightPanel={<OperationsRail api={api} apiError={apiError} job={job} onNavigate={navigate} />}
    bottomPanels={<BottomPanels api={api} apiError={apiError} job={job} events={events} onClearEvents={clearEvents} onNavigate={navigate} onRunBenchmark={() => void runQuickBenchmark()} />}
  >{pageContent}</AppShell>;
}
