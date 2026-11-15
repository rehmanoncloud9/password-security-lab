import {
  Activity,
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleDot,
  CircleX,
  ClipboardCopy,
  Cpu,
  FileText,
  FlaskConical,
  Gauge,
  KeyRound,
  Network,
  Play,
  ScanSearch,
  ShieldCheck,
  Terminal,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import type { ApiHealth, AttackJob, LabEvent, PageId } from "../app/types.js";
import { formatBytes } from "./AppShell.js";

interface OperationsRailProps {
  readonly api: ApiHealth | null;
  readonly apiError: string;
  readonly job: AttackJob | null;
  readonly onNavigate: (page: PageId) => void;
}

interface BottomPanelsProps extends OperationsRailProps {
  readonly events: readonly LabEvent[];
  readonly onClearEvents: () => void;
  readonly onRunBenchmark: () => void;
}

function StateMark({ ok, pending = false }: { readonly ok: boolean; readonly pending?: boolean }) {
  if (pending) return <CircleDot className="state-mark is-pending" size={15} aria-label="Checking" />;
  return ok
    ? <CircleCheck className="state-mark is-online" size={15} aria-label="Available" />
    : <CircleX className="state-mark is-offline" size={15} aria-label="Unavailable" />;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} m ${Math.floor(seconds % 60)} s`;
}

export function OperationsRail({ api, apiError, job, onNavigate }: OperationsRailProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const copyStartCommand = async () => {
    try {
      await navigator.clipboard.writeText("python -m app.main");
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      setCopyError("Clipboard access is unavailable. The command is shown below.");
    }
  };

  return <>
    <section className="rail-card environment-card">
      <div className="rail-card-heading"><div><span className="eyebrow">LOCAL PROCESS</span><h2>Laboratory Environment</h2></div><Activity size={17} aria-hidden="true" /></div>
      <div className="environment-state"><span className={`service-dot ${api ? "is-online" : "is-offline"}`} /><strong>{api ? "Python API responding" : "Python API unavailable"}</strong></div>
      <p className="environment-note">Loopback service · no containers are used.</p>
      <div className="environment-metrics">
        <div><span><Cpu size={14} />Host CPU</span><strong>{api ? `${api.cpuPercent.toFixed(1)}%` : "Unavailable"}</strong></div>
        <div><span><Gauge size={14} />API memory</span><strong>{api ? formatBytes(api.processMemoryBytes) : "Unavailable"}</strong></div>
        <div><span><Workflow size={14} />Worker</span><strong>{api ? (api.activeExperiments ? "Active" : "Idle") : "Unavailable"}</strong></div>
        <div><span><KeyRound size={14} />Short-lived verifiers</span><strong>{api ? api.storedVerifiers : "Unavailable"}</strong></div>
      </div>
      {api && <p className="environment-foot">PID {api.processId} · uptime {formatDuration(api.uptimeSeconds)}</p>}
      {!api && <>
        <p className="rail-error" role={apiError ? "status" : undefined}>{apiError || "Waiting for the local API health check."}</p>
        <button className="text-action command-copy" type="button" onClick={copyStartCommand}>
          <ClipboardCopy size={14} />{copied ? "Command copied" : "Copy API start command"}
        </button>
        {copyError && <span className="copy-error" role="status">{copyError}</span>}
        <code className="command-hint">Run from apps/lab-api: python -m app.main</code>
      </>}
    </section>

    <section className="rail-card current-experiment-card">
      <div className="rail-card-heading"><div><span className="eyebrow">JOB LIFECYCLE</span><h2>Current Experiment</h2></div><FlaskConical size={17} aria-hidden="true" /></div>
      {job ? <>
        <div className="job-state-line"><span className={`job-state-dot state-${job.state}`} /><strong>{job.state.replaceAll("_", " ")}</strong></div>
        <p className="job-type">{job.algorithm} · bounded synthetic target</p>
        <div className="rail-job-stats"><span>Checks<strong>{job.attempts.toLocaleString()}</strong></span><span>Elapsed<strong>{job.elapsedMs.toFixed(2)} ms</strong></span><span>Measured rate<strong>{job.candidateThroughputPerSecond.toLocaleString()} / s</strong></span></div>
        <div className="rail-job-progress" role="meter" aria-label="Actual candidates checked" aria-valuemin={0} aria-valuemax={Math.max(1, job.searchSpace ?? job.attempts)} aria-valuenow={job.attempts}>
          <span style={{ width: `${Math.min(100, job.searchSpace ? job.attempts / job.searchSpace * 100 : 0)}%` }} />
        </div>
        <p className="environment-foot">{job.searchSpace === null ? "Search space unavailable" : `${job.searchSpace.toLocaleString()} total candidates`} · {job.stopReason ?? "job active"}</p>
      </> : <div className="empty-operation"><span className="empty-operation-icon"><Play size={16} /></span><strong>No active experiment</strong><p>Start a bounded synthetic run to see live counters.</p><button type="button" className="small-primary" onClick={() => onNavigate("attack")}>Open Attack Simulator <ArrowRight size={13} /></button></div>}
    </section>
  </>;
}

export function BottomPanels({ api, job, events, onClearEvents, onNavigate, onRunBenchmark }: BottomPanelsProps) {
  return <>
    <section className="bottom-card topology-card">
      <div className="bottom-heading"><div><Network size={16} /><h2>Laboratory Topology</h2></div><button type="button" className="subtle-link" onClick={() => onNavigate("topology")}>Inspect <ArrowRight size={13} /></button></div>
      <div className="mini-topology" aria-label="Local application component status">
        <div className="mini-node"><ScanSearch size={15} /><span>React UI</span><StateMark ok /></div><span className="topology-connector" aria-hidden="true" />
        <div className="mini-node"><ShieldCheck size={15} /><span>TS Core</span><StateMark ok /></div><span className="topology-connector" aria-hidden="true" />
        <div className="mini-node"><Terminal size={15} /><span>Python API</span><StateMark ok={Boolean(api)} /></div>
      </div>
      <div className="topology-caption"><span>Loopback boundary</span><span>Attack worker {api ? (job && ["queued", "running"].includes(job.state) ? "active" : "idle") : "unavailable"}</span></div>
    </section>

    <section className="bottom-card console-card">
      <div className="bottom-heading"><div><Terminal size={16} /><h2>Experiment Console</h2></div><button type="button" className="subtle-link" onClick={onClearEvents}>Clear view</button></div>
      <div className="console-output" role="log" aria-label="Secret-safe laboratory event console" aria-live="polite" aria-relevant="additions">
        {events.length ? events.slice(0, 5).map((event) => (
          <div className={`console-line level-${event.level}`} key={event.id}>
            <time dateTime={event.time}>{new Date(event.time).toLocaleTimeString()}</time>
            <span className="console-level">{event.level.toUpperCase()}</span>
            <span>{event.message}</span>
          </div>
        )) : <div className="console-empty"><CircleDot size={14} />No operations in this session yet.</div>}
      </div>
      <div className="console-foot">Input values and verifier contents are excluded from the event stream.</div>
    </section>

    <section className="bottom-card quick-actions-card">
      <div className="bottom-heading"><div><Activity size={16} /><h2>Quick Actions</h2></div></div>
      <div className="quick-action-grid">
        <button type="button" onClick={() => onNavigate("analysis")}><ScanSearch size={15} /><span>Open Analyzer</span></button>
        <button type="button" onClick={() => onNavigate("hashing")}><KeyRound size={15} /><span>New Hash Experiment</span></button>
        <button type="button" onClick={() => onNavigate("attack")}><Play size={15} /><span>New Attack Experiment</span></button>
        <button type="button" onClick={onRunBenchmark} disabled={!api}><Gauge size={15} /><span>Run Benchmark</span></button>
        <button type="button" onClick={() => onNavigate("reports")}><FileText size={15} /><span>View Results</span></button>
        <button type="button" onClick={() => onNavigate("topology")}><BookOpen size={15} /><span>View Services</span></button>
      </div>
      <p className="quick-action-note">The browser cannot start or stop operating-system processes. Use the documented local terminal commands for service lifecycle.</p>
    </section>
  </>;
}
