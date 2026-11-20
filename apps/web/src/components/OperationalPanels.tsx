import {
  Activity,
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleDot,
  CircleX,
  ClipboardCopy,
  Cpu,
  Database,
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
  Zap,
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
  if (pending) return <CircleDot className="state-mark is-pending" size={14} aria-label="Checking" />;
  return ok
    ? <CircleCheck className="state-mark is-online" size={14} aria-label="Available" />
    : <CircleX className="state-mark is-offline" size={14} aria-label="Unavailable" />;
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

  return (
    <>
      <section className="rail-card environment-card">
        <div className="rail-card-heading">
          <div>
            <span className="eyebrow">LOCAL PROCESS</span>
            <h2>Laboratory Environment</h2>
          </div>
          <Activity size={16} aria-hidden="true" />
        </div>
        <div className="environment-state">
          <span className={`service-dot ${api ? "is-online" : "is-offline"}`} />
          <strong>{api ? "Python API responding" : "Python API unavailable"}</strong>
        </div>
        <p className="environment-note">Loopback service · no containers are used.</p>
        <div className="environment-metrics">
          <div>
            <span><Cpu size={14} />Host CPU</span>
            <strong>{api ? `${api.cpuPercent.toFixed(1)}%` : "Unavailable"}</strong>
          </div>
          <div>
            <span><Gauge size={14} />API memory</span>
            <strong>{api ? formatBytes(api.processMemoryBytes) : "Unavailable"}</strong>
          </div>
          <div>
            <span><Workflow size={14} />Worker</span>
            <strong>{api ? (api.activeExperiments ? "Active" : "Idle") : "Unavailable"}</strong>
          </div>
          <div>
            <span><KeyRound size={14} />Short-lived verifiers</span>
            <strong>{api ? api.storedVerifiers : "Unavailable"}</strong>
          </div>
        </div>
        {api && <p className="environment-foot">PID {api.processId} · uptime {formatDuration(api.uptimeSeconds)}</p>}
        {!api && (
          <>
            <p className="rail-error" role={apiError ? "status" : undefined}>
              {apiError || "Waiting for the local API health check."}
            </p>
            <button className="text-action command-copy" type="button" onClick={copyStartCommand}>
              <ClipboardCopy size={14} />{copied ? "Command copied" : "Copy API start command"}
            </button>
            {copyError && <span className="copy-error" role="status">{copyError}</span>}
            <code className="command-hint">Run from apps/lab-api: python -m app.main</code>
          </>
        )}
      </section>

      <section className="rail-card current-experiment-card">
        <div className="rail-card-heading">
          <div>
            <span className="eyebrow">JOB LIFECYCLE</span>
            <h2>Current Experiment</h2>
          </div>
          <FlaskConical size={16} aria-hidden="true" />
        </div>
        {job ? (
          <>
            <div className="job-state-line">
              <span className={`job-state-dot state-${job.state}`} />
              <strong>{job.state.replaceAll("_", " ")}</strong>
            </div>
            <p className="job-type">{job.algorithm} · bounded synthetic target</p>
            <div className="rail-job-stats">
              <span>Checks<strong>{job.attempts.toLocaleString()}</strong></span>
              <span>Elapsed<strong>{job.elapsedMs.toFixed(2)} ms</strong></span>
              <span>Rate<strong>{job.candidateThroughputPerSecond.toLocaleString()} / s</strong></span>
            </div>
            <div
              className="rail-job-progress"
              role="meter"
              aria-label="Actual candidates checked"
              aria-valuemin={0}
              aria-valuemax={Math.max(1, job.searchSpace ?? job.attempts)}
              aria-valuenow={job.attempts}
            >
              <span style={{ width: `${Math.min(100, job.searchSpace ? (job.attempts / job.searchSpace) * 100 : 0)}%` }} />
            </div>
            <p className="environment-foot">
              {job.searchSpace === null ? "Search space unavailable" : `${job.searchSpace.toLocaleString()} total candidates`} · {job.stopReason ?? "job active"}
            </p>
          </>
        ) : (
          <div className="empty-operation">
            <span className="empty-operation-icon"><Play size={16} /></span>
            <strong>No active experiment</strong>
            <p>Start a bounded synthetic run to see live counters.</p>
            <button type="button" className="small-primary" onClick={() => onNavigate("attack")}>
              Open Attack Simulator <ArrowRight size={13} />
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export function BottomPanels({ api, job, events, onClearEvents, onNavigate, onRunBenchmark }: BottomPanelsProps) {
  return (
    <>
      {/* 1. Laboratory Topology Card */}
      <section className="bottom-card topology-card">
        <div className="bottom-heading">
          <div className="card-title-icon-row">
            <Network size={15} className="panel-title-icon" />
            <h2>Laboratory Topology</h2>
          </div>
          <button type="button" className="subtle-link" onClick={() => onNavigate("topology")}>
            Inspect <ArrowRight size={13} />
          </button>
        </div>

        <div className="dock-topology-flow" aria-label="Local application component status">
          <div className="dock-node">
            <span className="node-indicator is-online" />
            <span className="node-title">Browser</span>
            <small>(You)</small>
          </div>
          <span className="dock-connector solid" aria-hidden="true" />
          <div className="dock-node">
            <span className="node-indicator is-online" />
            <span className="node-title">TypeScript Core</span>
            <small>(Analysis)</small>
          </div>
          <span className={`dock-connector ${api ? "solid" : "dashed"}`} aria-hidden="true" />
          <div className="dock-node">
            <span className={`node-indicator ${api ? "is-online" : "is-offline"}`} />
            <span className="node-title">Python API</span>
            <small>({api ? "Online" : "Research"})</small>
          </div>
        </div>

        <div className="topology-badge-caption">
          <span className="local-privacy-pill">Local Only</span>
          <span>Analysis runs fully in your browser. Python API is optional and used only for research experiments.</span>
        </div>
      </section>

      {/* 2. Experiment Console Card */}
      <section className="bottom-card console-card">
        <div className="bottom-heading">
          <div className="card-title-icon-row">
            <Terminal size={15} className="panel-title-icon" />
            <h2>Experiment Console</h2>
          </div>
          <button type="button" className="subtle-link" onClick={onClearEvents}>
            Clear
          </button>
        </div>

        <div
          className="console-output terminal-box"
          role="log"
          aria-label="Secret-safe laboratory event console"
          aria-live="polite"
          aria-relevant="additions"
        >
          {events.length ? (
            events.slice(0, 5).map((event) => (
              <div className={`console-line level-${event.level}`} key={event.id}>
                <time dateTime={event.time}>
                  {new Date(event.time).toLocaleTimeString()}
                </time>
                <span className={`console-level-tag tag-${event.level}`}>{event.level.toUpperCase()}</span>
                <span className="console-msg">{event.message}</span>
              </div>
            ))
          ) : (
            <div className="console-line level-warning">
              <time>{new Date().toLocaleTimeString()}</time>
              <span className="console-level-tag tag-warning">INFO</span>
              <span className="console-msg">
                {api ? "Loopback Python laboratory API online." : "Loopback Python Laboratory API is unavailable."}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 3. Quick Actions Card matching Reference 2 */}
      <section className="bottom-card quick-actions-card">
        <div className="bottom-heading">
          <div className="card-title-icon-row">
            <Zap size={15} className="panel-title-icon" />
            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="quick-action-2x2-grid">
          <button type="button" className="qa-btn" onClick={() => onNavigate("analysis")}>
            <ScanSearch size={15} />
            <span>Open Analyzer</span>
          </button>
          <button type="button" className="qa-btn" onClick={() => onNavigate("attack")}>
            <Play size={15} />
            <span>New Attack Experiment</span>
          </button>
          <button type="button" className="qa-btn" onClick={() => onNavigate("hashing")}>
            <Database size={15} />
            <span>New Hash Experiment</span>
          </button>
          <button type="button" className="qa-btn" onClick={() => onNavigate("reports")}>
            <FileText size={15} />
            <span>View Results</span>
          </button>
        </div>
      </section>
    </>
  );
}
