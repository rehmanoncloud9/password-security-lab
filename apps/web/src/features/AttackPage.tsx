import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Ban, Crosshair, Info, Play, ShieldCheck, Square } from "lucide-react";
import { PageHeading } from "../components/PageHeading.js";
import type { AttackExperiment, AttackJob, LabAlgorithm } from "../app/types.js";

const STRATEGY_DETAILS: Record<AttackExperiment, { label: string; candidates: number; explanation: string }> = {
  dictionary: { label: "Educational dictionary", candidates: 0, explanation: "Checks a small authored educational wordlist in deterministic order." },
  bruteforce: { label: "Brute-force enumeration", candidates: 0, explanation: "Enumerates a bounded alphabet by increasing candidate length." },
  pattern: { label: "Pattern and date guessing", candidates: 5, explanation: "Tries a fixed set of word-plus-number/date patterns against an internal synthetic verifier." },
  suffix: { label: "Common suffix guessing", candidates: 5, explanation: "Tries a fixed set of common numeric suffix variations." },
  substitution: { label: "Character substitution", candidates: 4, explanation: "Tries a small deterministic set of common letter substitutions." },
  word_combination: { label: "Two-word combinations", candidates: 49, explanation: "Checks ordered pairs from the seven-entry authored demo wordlist." },
};

const TARGETS: Record<AttackExperiment, readonly { id: string; label: string; size?: number }[]> = {
  dictionary: [{ id: "dictionary-first", label: "Early dictionary entry", size: 4 }, { id: "dictionary-last", label: "Last dictionary entry", size: 7 }],
  bruteforce: [{ id: "bruteforce-two", label: "Two-symbol synthetic target" }],
  pattern: [{ id: "pattern-date", label: "Word plus date pattern" }],
  suffix: [{ id: "suffix-year", label: "Common year suffix" }],
  substitution: [{ id: "substitution-basic", label: "Basic letter substitutions" }],
  word_combination: [{ id: "word-combination-two", label: "Two-word example" }],
};

function stateMessage(state: string): string {
  const labels: Record<string, string> = {
    queued: "Queued",
    running: "Running",
    recovered: "Recovered by an actual candidate check",
    not_found_within_budget: "Not found within this experiment budget",
    cancelled: "Cancelled",
    time_limit: "Stopped at the time limit",
    attempt_limit: "Stopped at the attempt limit",
    error: "Experiment error",
  };
  return labels[state] ?? "Unknown experiment state";
}

export function AttackPage({
  apiAvailable,
  job,
  operationError,
  onStart,
  onCancel,
}: {
  readonly apiAvailable: boolean;
  readonly job: AttackJob | null;
  readonly operationError: string;
  readonly onStart: (input: {
    experiment: AttackExperiment;
    targetId: string;
    algorithm: LabAlgorithm;
    maxAttempts: number;
    timeoutSeconds: number;
    alphabetId: "binary" | "digits-small";
    maxLength: number;
  }) => Promise<void>;
  readonly onCancel: () => Promise<void>;
}) {
  const [experiment, setExperiment] = useState<AttackExperiment>("dictionary");
  const [targetId, setTargetId] = useState(TARGETS.dictionary[0]!.id);
  const [algorithm, setAlgorithm] = useState<LabAlgorithm>("sha256");
  const [maxAttempts, setMaxAttempts] = useState(10_000);
  const [timeoutSeconds, setTimeoutSeconds] = useState(10);
  const [alphabetId, setAlphabetId] = useState<"binary" | "digits-small">("binary");
  const [maxLength, setMaxLength] = useState(2);
  const [busy, setBusy] = useState(false);

  const targetOptions = TARGETS[experiment];
  const searchSpace = useMemo(() => {
    if (experiment === "bruteforce") {
      const alphabetLength = alphabetId === "binary" ? 2 : 4;
      return Array.from({ length: maxLength }, (_, index) => alphabetLength ** (index + 1)).reduce((sum, size) => sum + size, 0);
    }
    return targetOptions.find((item) => item.id === targetId)?.size ?? STRATEGY_DETAILS[experiment].candidates;
  }, [alphabetId, experiment, maxLength, targetId, targetOptions]);
  const active = Boolean(job && ["queued", "running"].includes(job.state));

  function changeExperiment(value: AttackExperiment) {
    setExperiment(value);
    setTargetId(TARGETS[value][0]!.id);
  }

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiAvailable || busy || active) return;
    setBusy(true);
    try {
      await onStart({ experiment, targetId, algorithm, maxAttempts, timeoutSeconds, alphabetId, maxLength });
    } finally {
      setBusy(false);
    }
  }

  return <>
    <PageHeading eyebrow="SYNTHETIC TARGETS · SERVER-ENFORCED LIMITS" title="Attack Simulator" description="Run real candidate checks against target verifiers generated inside the local laboratory. No external hashes, account data, network targets, or uploaded wordlists are accepted." />
    <div className="feature-stack">
      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">EXPERIMENT DESIGN</span><h2>Configure a bounded run</h2></div><span className="limit-chip">Maximum 10 s · 10,000 attempts · 1 active job</span></div>
        <form className="attack-config" onSubmit={(event) => void start(event)}>
          <label className="field-label" htmlFor="attack-strategy">Strategy<select id="attack-strategy" value={experiment} onChange={(event) => changeExperiment(event.currentTarget.value as AttackExperiment)}>{Object.entries(STRATEGY_DETAILS).map(([id, details]) => <option key={id} value={id}>{details.label}</option>)}</select></label>
          <label className="field-label" htmlFor="attack-target">Internal target profile<select id="attack-target" value={targetId} onChange={(event) => setTargetId(event.currentTarget.value)}>{targetOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><span className="field-hint">The server generates the target and its verifier. Target text is not returned.</span></label>
          <label className="field-label" htmlFor="attack-algorithm">Verifier algorithm<select id="attack-algorithm" value={algorithm} onChange={(event) => setAlgorithm(event.currentTarget.value as LabAlgorithm)}><option value="sha256">SHA-256 baseline</option><option value="pbkdf2_sha256">PBKDF2-HMAC-SHA256</option><option value="bcrypt">bcrypt</option><option value="argon2id">Argon2id</option></select></label>
          {experiment === "bruteforce" && <>
            <label className="field-label" htmlFor="attack-alphabet">Alphabet<select id="attack-alphabet" value={alphabetId} onChange={(event) => setAlphabetId(event.currentTarget.value as "binary" | "digits-small")}><option value="binary">a / b (2 symbols)</option><option value="digits-small">0–3 (4 symbols)</option></select></label>
            <label className="field-label" htmlFor="attack-max-length">Maximum length<select id="attack-max-length" value={maxLength} onChange={(event) => setMaxLength(Number(event.currentTarget.value))}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></label>
          </>}
          <div className="attack-space-panel"><div><span className="eyebrow">SEARCH SPACE BEFORE START</span><strong>{searchSpace.toLocaleString()} ordered candidate(s)</strong><p>{STRATEGY_DETAILS[experiment].explanation}</p></div><Crosshair size={22} /></div>
          <div className="attack-budget-row">
            <label className="field-label" htmlFor="attack-attempts">Attempt budget <strong>{maxAttempts.toLocaleString()}</strong><input id="attack-attempts" type="range" min={1} max={10_000} step={100} value={maxAttempts} onChange={(event) => setMaxAttempts(event.currentTarget.valueAsNumber)} /></label>
            <label className="field-label" htmlFor="attack-time">Time limit <strong>{timeoutSeconds} seconds</strong><input id="attack-time" type="range" min={1} max={10} value={timeoutSeconds} onChange={(event) => setTimeoutSeconds(event.currentTarget.valueAsNumber)} /></label>
          </div>
          <button type="submit" className="primary-button" disabled={!apiAvailable || busy || active}>{busy ? "Starting…" : "Start synthetic experiment"}<Play size={15} /></button>
        </form>
        <div className="inline-notice"><Info size={15} /><p>A time or attempt limit means “not found within this experiment budget.” It does not show that a password is impossible to guess. Limits are checked by the API.</p></div>
        {operationError && <div className="inline-alert error-alert" role="alert"><AlertTriangle size={15} />{operationError}</div>}
      </section>

      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">SERVER JOB STATE</span><h2>Experiment result</h2></div>{active && <button type="button" className="danger-button" onClick={() => void onCancel()}><Square size={14} />Cancel experiment</button>}</div>
        {job ? <div className="attack-result" aria-live="polite">
          <div className={`attack-result-state state-${job.state}`}><span className="large-state-dot" /><div><strong>{stateMessage(job.state)}</strong><small>{job.stopReason ? `Stop reason: ${job.stopReason.replaceAll("_", " ")}` : "The job is still running."}</small></div></div>
          <div className="attack-metrics"><div><span>Candidates actually checked</span><strong>{job.attempts.toLocaleString()}</strong></div><div><span>Experiment elapsed</span><strong>{job.elapsedMs.toFixed(2)} ms</strong></div><div><span>Verifier-check time</span><strong>{job.candidateElapsedMs.toFixed(3)} ms</strong></div><div><span>Measured throughput</span><strong>{job.candidateThroughputPerSecond.toLocaleString()} / s</strong></div><div><span>Search space</span><strong>{job.searchSpace?.toLocaleString() ?? "Unavailable"}</strong></div><div><span>Hash method</span><strong>{job.algorithm}</strong></div></div>
          <div className="progress-caption"><span>Actual attempts</span><span>{job.searchSpace ? `${Math.min(100, job.attempts / job.searchSpace * 100).toFixed(1)}% of bounded candidates checked` : "Total candidate count unavailable"}</span></div>
          <div className="actual-progress" role="meter" aria-label="Actual candidate checks completed" aria-valuemin={0} aria-valuemax={Math.max(1, job.searchSpace ?? job.attempts)} aria-valuenow={job.attempts}><span style={{ width: `${Math.min(100, job.searchSpace ? job.attempts / job.searchSpace * 100 : 0)}%` }} /></div>
          <p className="result-foot">{job.targetRecovered ? "A candidate actually matched the internally generated verifier." : "Candidate text is never returned by the API. An inconclusive outcome is not an uncrackable result."}</p>
        </div> : <div className="empty-state compact-empty"><Ban size={21} /><strong>No experiment has run in this session.</strong><p>Set the experiment parameters above to start real, bounded candidate checks.</p></div>}
      </section>
      <section className="work-card concept-strip"><div><ShieldCheck size={17} /><span>Targets are fixed synthetic lab fixtures generated within the API process.</span></div><div><CircleHelpIcon /><span>Attack attempts use the selected real verifier implementation and measured wall-clock timing.</span></div></section>
    </div>
  </>;
}

function CircleHelpIcon() { return <Info size={17} aria-hidden="true" />; }
