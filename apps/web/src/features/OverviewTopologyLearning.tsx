import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleCheck,
  CircleDot,
  CircleX,
  Cpu,
  Crosshair,
  ExternalLink,
  FlaskConical,
  Gauge,
  HardDrive,
  KeyRound,
  Layers,
  Lock,
  Network,
  Play,
  Repeat2,
  ScanSearch,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
} from "lucide-react";
import { PageHeading } from "../components/PageHeading.js";
import type { ApiHealth, AttackJob, PageId, SafeResult } from "../app/types.js";
import { formatBytes } from "../components/AppShell.js";

interface PageProps {
  readonly api: ApiHealth | null;
  readonly job: AttackJob | null;
  readonly results: readonly SafeResult[];
  readonly onNavigate: (page: PageId) => void;
}

export function OverviewPage({ api, job, results, onNavigate }: PageProps) {
  const [tasks, setTasks] = useState({
    generated: true,
    hashing: false,
    attack: false,
  });

  const toggleTask = (key: keyof typeof tasks) => {
    setTasks((current) => ({ ...current, [key]: !current[key] }));
  };

  const sampleRecentExperiments = [
    {
      id: "exp-1",
      title: "Argon2id Parameter Benchmark",
      description: "Compare memory and time cost configurations.",
      status: "Completed",
      timestamp: "Today, 6:14 PM",
      icon: FlaskConical,
    },
    {
      id: "exp-2",
      title: "Password Strength Analysis",
      description: "Analyzed synthetic patterns and entropy.",
      status: "Completed",
      timestamp: "Today, 4:02 PM",
      icon: ScanSearch,
    },
    {
      id: "exp-3",
      title: "Dictionary Attack (Synthetic)",
      description: "Hybrid dictionary + mutation strategy.",
      status: "Cancelled",
      timestamp: "Yesterday, 10:28 PM",
      icon: Crosshair,
    },
  ];

  return (
    <div className="home-dashboard">
      {/* 1. Sleek Cosmic Hero Banner matching Reference 1 */}
      <section className="dashboard-hero-banner" role="region" aria-label="Laboratory introduction">
        <div className="hero-content">
          <h1>
            A complete <em>laboratory</em> for password security.
          </h1>
          <p>
            Generate, analyze and research passwords using industry-standard security principles.
          </p>
          <div className="hero-cta-row">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() => onNavigate("generator")}
            >
              Generate Password <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => onNavigate("attack")}
            >
              Run Experiment
            </button>
          </div>
        </div>
        <svg className="hero-cosmic-arc" viewBox="0 0 1000 320" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="arcGlow" x1="0" y1="320" x2="1000" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.25" />
            </linearGradient>
            <filter id="arcBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          <path d="M 0 340 Q 520 180 1000 50" stroke="#38bdf8" strokeWidth="8" filter="url(#arcBlur)" opacity="0.65" />
          <path d="M 0 340 Q 520 180 1000 50" stroke="url(#arcGlow)" strokeWidth="2.5" />
        </svg>
      </section>

      {/* 2. Quick Launch Cards Row */}
      <section className="quick-launch-grid" aria-label="Primary tools">
        <button
          type="button"
          className="quick-card quick-card-generate"
          onClick={() => onNavigate("generator")}
        >
          <div className="quick-card-icon">
            <Sparkles size={18} />
          </div>
          <div className="quick-card-info">
            <div className="quick-card-title-row">
              <h3>Generate</h3>
              <ArrowRight size={14} className="card-arrow" />
            </div>
            <p>Create strong passwords and passphrases.</p>
          </div>
        </button>

        <button
          type="button"
          className="quick-card quick-card-analyze"
          onClick={() => onNavigate("analysis")}
        >
          <div className="quick-card-icon">
            <ScanSearch size={18} />
          </div>
          <div className="quick-card-info">
            <div className="quick-card-title-row">
              <h3>Analyze</h3>
              <ArrowRight size={14} className="card-arrow" />
            </div>
            <p>Measure strength and identify weaknesses.</p>
          </div>
        </button>

        <button
          type="button"
          className="quick-card quick-card-policy"
          onClick={() => onNavigate("policy")}
        >
          <div className="quick-card-icon">
            <ShieldCheck size={18} />
          </div>
          <div className="quick-card-info">
            <div className="quick-card-title-row">
              <h3>Policy</h3>
              <ArrowRight size={14} className="card-arrow" />
            </div>
            <p>Validate against modern security standards.</p>
          </div>
        </button>

        <button
          type="button"
          className="quick-card quick-card-reuse"
          onClick={() => onNavigate("reuse")}
        >
          <div className="quick-card-icon">
            <Repeat2 size={18} />
          </div>
          <div className="quick-card-info">
            <div className="quick-card-title-row">
              <h3>Reuse</h3>
              <ArrowRight size={14} className="card-arrow" />
            </div>
            <p>Detect reused or similar passwords.</p>
          </div>
        </button>
      </section>

      {/* 3. Main Two-Column Lower Grid */}
      <div className="dashboard-split-grid">
        {/* Left Column: Recent Experiments */}
        <section className="work-card recent-experiments-card">
          <div className="card-title-row">
            <div>
              <h2>Recent Experiments</h2>
              <span className="card-subtitle">Your latest analyses and lab experiments.</span>
            </div>
            <button
              type="button"
              className="subtle-link"
              onClick={() => onNavigate("reports")}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          <div className="experiments-list">
            {results.length > 0 ? (
              results.slice(0, 4).map((item) => {
                const Icon =
                  item.category === "attack"
                    ? Crosshair
                    : item.category === "hash"
                      ? KeyRound
                      : item.category === "benchmark"
                        ? Gauge
                        : FlaskConical;
                return (
                  <div className="experiment-row" key={item.id}>
                    <div className="experiment-icon-box">
                      <Icon size={16} />
                    </div>
                    <div className="experiment-main">
                      <strong>{item.title}</strong>
                      <small>{item.outcome}</small>
                    </div>
                    <div className="experiment-badge-col">
                      <span className="status-tag tag-completed">Completed</span>
                      <time dateTime={item.time}>
                        {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </div>
                  </div>
                );
              })
            ) : (
              sampleRecentExperiments.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="experiment-row" key={item.id}>
                    <div className="experiment-icon-box">
                      <Icon size={16} />
                    </div>
                    <div className="experiment-main">
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </div>
                    <div className="experiment-badge-col">
                      <span
                        className={`status-tag ${item.status === "Completed" ? "tag-completed" : "tag-cancelled"}`}
                      >
                        {item.status}
                      </span>
                      <span>{item.timestamp}</span>
                      <button type="button" className="row-more-btn" aria-label="More options">···</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Unified Lab Environment & Next Up Card matching Reference 1 */}
        <div className="dashboard-right-stack">
          <section className="work-card environment-summary-card">
            <div className="card-title-row">
              <div>
                <h2>Lab Environment</h2>
                <span className="card-subtitle">Local, isolated and privacy-first.</span>
              </div>
              <button
                type="button"
                className="icon-link-btn"
                onClick={() => onNavigate("topology")}
                title="Inspect topology"
                aria-label="Inspect topology"
              >
                <ExternalLink size={14} />
              </button>
            </div>

            <div className="env-tiles-row">
              <div className="env-tile">
                <span className={`status-indicator-dot ${api ? "is-online" : "is-offline"}`} />
                <div className="env-tile-data">
                  <strong>Local</strong>
                  <small>{api ? "Online" : "Offline"}</small>
                </div>
              </div>

              <div className="env-tile">
                <Cpu size={14} className="env-icon" />
                <div className="env-tile-data">
                  <strong>CPU</strong>
                  <small>{api ? `${api.cpuPercent.toFixed(1)}%` : "4 cores"}</small>
                </div>
              </div>

              <div className="env-tile">
                <HardDrive size={14} className="env-icon" />
                <div className="env-tile-data">
                  <strong>Memory</strong>
                  <small>{api ? formatBytes(api.processMemoryBytes) : "8.0 GB"}</small>
                </div>
              </div>

              <div className="env-tile">
                <Workflow size={14} className="env-icon" />
                <div className="env-tile-data">
                  <strong>Workers</strong>
                  <small>{api ? `${api.activeExperiments}/2` : "2/2"}</small>
                </div>
              </div>
            </div>

            <div className="env-card-divider" />

            {/* Next Up Checklist inside Lab Environment Card */}
            <div className="next-up-header">
              <CircleCheck size={16} className="next-up-icon" />
              <div>
                <h2>Next Up</h2>
                <span className="card-subtitle">Suggested tasks to explore the laboratory.</span>
              </div>
            </div>

            <ul className="next-up-checklist">
              <li className={tasks.generated ? "is-checked" : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={tasks.generated}
                    onChange={() => toggleTask("generated")}
                  />
                  <span>Generate a 20+ character password</span>
                </label>
              </li>
              <li className={tasks.hashing ? "is-checked" : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={tasks.hashing}
                    onChange={() => toggleTask("hashing")}
                  />
                  <span>Run a hash comparison (PBKDF2 vs Argon2id)</span>
                </label>
              </li>
              <li className={tasks.attack ? "is-checked" : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={tasks.attack}
                    onChange={() => toggleTask("attack")}
                  />
                  <span>Try a basic attack simulation on a synthetic password</span>
                </label>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function TopologyNode({
  icon,
  label,
  detail,
  status,
}: {
  readonly icon: "ui" | "core" | "api" | "worker";
  readonly label: string;
  readonly detail: string;
  readonly status: "online" | "offline" | "idle" | "active";
}) {
  const Icon =
    icon === "ui"
      ? ScanSearch
      : icon === "core"
        ? ShieldCheck
        : icon === "api"
          ? Terminal
          : Workflow;
  const isAvailable = status !== "offline";
  return (
    <div className="topology-node">
      <span className={`topology-node-icon node-${icon}`}>
        <Icon size={20} />
      </span>
      <div>
        <strong>{label}</strong>
        <small>{detail}</small>
      </div>
      <span className={`topology-status status-${status}`}>
        <span />
        {status}
      </span>
      {isAvailable ? (
        <CircleCheck size={15} className="topology-check" />
      ) : (
        <CircleX size={15} className="topology-check" />
      )}
    </div>
  );
}

export function TopologyPage({ api, job }: PageProps) {
  const workerStatus = !api
    ? "offline"
    : job && ["queued", "running"].includes(job.state)
      ? "active"
      : "idle";
  return (
    <>
      <PageHeading
        eyebrow="ARCHITECTURE · TRUST BOUNDARIES"
        title="Lab Topology"
        description="The diagram describes the implemented local application. Availability badges reflect the browser page and the live API health response."
      />
      <section className="work-card topology-work-card">
        <div className="card-title-row">
          <div>
            <span className="eyebrow">LOCAL ARCHITECTURE</span>
            <h2>Browser and loopback lab</h2>
          </div>
          <span className="local-only-badge">
            <Network size={13} />
            No external target
          </span>
        </div>
        <div className="topology-flow">
          <div className="topology-cluster browser-cluster">
            <div className="cluster-label">BROWSER · LOCAL PAGE MEMORY</div>
            <TopologyNode
              icon="ui"
              label="React user interface"
              detail="Current page and session-only state"
              status="online"
            />
            <div className="topology-link">
              <span>Local function calls · no network</span>
              <span className="link-line" />
            </div>
            <TopologyNode
              icon="core"
              label="TypeScript analysis core"
              detail="Guessability, policy, reuse, generation"
              status="online"
            />
          </div>
          <div className="trust-link">
            <span>Explicit synthetic lab requests only</span>
            <div>
              <span className="trust-line" />
              <ArrowRight size={16} />
              <span className="trust-line" />
            </div>
          </div>
          <div className="topology-cluster api-cluster">
            <div className="cluster-label">LOOPBACK · 127.0.0.1:8000</div>
            <TopologyNode
              icon="api"
              label="Python FastAPI service"
              detail={api ? `PID ${api.processId} · health responding` : "Health unavailable"}
              status={api ? "online" : "offline"}
            />
            <div className="topology-link">
              <span>Internal bounded work</span>
              <span className="link-line" />
            </div>
            <TopologyNode
              icon="worker"
              label="Synthetic experiment worker"
              detail={api ? "Single in-process job slot" : "Requires API service"}
              status={workerStatus}
            />
          </div>
        </div>
        <div className="trust-boundaries">
          <article>
            <strong>Browser-local path</strong>
            <p>Analysis, policy, reuse and password generation run in this tab. They do not call the Python API.</p>
          </article>
          <article>
            <strong>Explicit lab path</strong>
            <p>Hashing, verification, attacks and benchmarks run only after a separate lab action sends its synthetic input to loopback.</p>
          </article>
          <article>
            <strong>Attack isolation</strong>
            <p>Attack routes accept fixed internal target IDs. Imported hashes, real account data and remote targets are not accepted.</p>
          </article>
        </div>
      </section>
      <section className="work-card topology-metrics-card">
        <div className="card-title-row">
          <div>
            <span className="eyebrow">LIVE PROCESS INFORMATION</span>
            <h2>Service measurements</h2>
          </div>
        </div>
        {api ? (
          <div className="overview-host-stats">
            <span>
              <Cpu size={15} />
              Host CPU <strong>{api.cpuPercent.toFixed(1)}%</strong>
            </span>
            <span>
              <KeyRound size={15} />
              API memory <strong>{formatBytes(api.processMemoryBytes)}</strong>
            </span>
            <span>
              <Workflow size={15} />
              Stored demo verifiers <strong>{api.storedVerifiers}</strong>
            </span>
            <span>
              <Activity size={15} />
              Active experiments <strong>{api.activeExperiments}</strong>
            </span>
          </div>
        ) : (
          <div className="empty-state compact-empty">
            <CircleX size={20} />
            <strong>Live process measurements are unavailable.</strong>
            <p>The static topology describes code boundaries; runtime state is not inferred when the API is offline.</p>
          </div>
        )}
      </section>
    </>
  );
}

interface GuidedLab {
  readonly title: string;
  readonly area: string;
  readonly page: PageId;
  readonly objective: string;
  readonly background: string;
}

const GUIDED_LABS: readonly GuidedLab[] = [
  {
    title: "1. Entropy and Search Spaces",
    area: "Generation & Estimation",
    page: "generator",
    objective: "Compare theoretical selection entropy with empirical guessability scores.",
    background: "Uniform CSPRNG sampling guarantees theoretical search space width, while zxcvbn identifies pattern compressible redundancies.",
  },
  {
    title: "2. Memory-Hard KDFs vs Fast Hashes",
    area: "Cryptographic Laboratory",
    page: "hashing",
    objective: "Observe verification latency and parameter hardness between Argon2id and fast SHA-256.",
    background: "Unkeyed fast hashes compute in microseconds on GPUs, whereas Argon2id binds attackers to physical memory bandwidth.",
  },
  {
    title: "3. Modern Decoupled Policy Evaluation",
    area: "Compliance & Guidelines",
    page: "policy",
    objective: "Contrast NIST SP 800-63B-4 length requirements with legacy character composition rules.",
    background: "NIST recommends minimum 15 characters without forced composition rules to prevent predictable user substitutions.",
  },
];

export function LearningPage({ onNavigate }: { readonly onNavigate: (page: PageId) => void }) {
  return (
    <>
      <PageHeading
        eyebrow="EDUCATIONAL GUIDES & EXPERIMENTS"
        title="Learning Center"
        description="Structured educational walkthroughs illustrating core password security and cryptographic principles."
      />
      <div className="learning-grid">
        {GUIDED_LABS.map((lab) => (
          <article className="work-card learning-card" key={lab.title}>
            <div className="learning-header">
              <span className="eyebrow">{lab.area}</span>
              <h2>{lab.title}</h2>
            </div>
            <p className="learning-objective">
              <strong>Objective:</strong> {lab.objective}
            </p>
            <p className="learning-background">{lab.background}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => onNavigate(lab.page)}
            >
              Open Interactive Lab <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
