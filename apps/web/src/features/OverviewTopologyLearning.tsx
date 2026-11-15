import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleDot,
  CircleX,
  Cpu,
  KeyRound,
  Network,
  ScanSearch,
  ShieldCheck,
  Terminal,
  Workflow,
} from "lucide-react";
import { PageHeading } from "../components/PageHeading.js";
import type { ApiHealth, AttackJob, PageId, SafeResult } from "../app/types.js";

interface PageProps {
  readonly api: ApiHealth | null;
  readonly job: AttackJob | null;
  readonly results: readonly SafeResult[];
  readonly onNavigate: (page: PageId) => void;
}

export function OverviewPage({ api, job, results, onNavigate }: PageProps) {
  const [selectedServiceName, setSelectedServiceName] = useState("React user interface");
  const services = [
    { name: "React user interface", boundary: "Browser tab", state: "Running · this page", available: true, detail: "This screen is rendered in the current browser tab. Analysis inputs remain in the page unless a separate laboratory operation is submitted." },
    { name: "TypeScript analysis core", boundary: "Browser tab · local evaluation", state: "Loaded · imported modules", available: true, detail: "Pattern analysis, policy checks, reuse comparison, and password generation are imported into the browser application." },
    { name: "Python laboratory API", boundary: "127.0.0.1:8000", state: api ? "Responding to health check" : "Unavailable", available: Boolean(api), detail: api ? `The loopback service responded from process ${api.processId}. Health values below come from its current response.` : "The loopback health request did not return a usable response. No service state is inferred while it is unavailable." },
    { name: "Synthetic experiment worker", boundary: "API process thread", state: api ? (job && ["queued", "running"].includes(job.state) ? "Active" : "Idle") : "Unavailable", available: Boolean(api), detail: api ? "This service exposes one bounded in-process synthetic experiment slot." : "Worker availability cannot be checked while the API is unavailable." },
  ];
  const selectedService = services.find((service) => service.name === selectedServiceName) ?? services[0]!;
  return <>
    <PageHeading eyebrow="LOCAL SECURITY WORKSTATION" title="Laboratory Overview" description="Inspect the components that are actually running in this session, open an experiment, and review secret-free recent results." actions={<button type="button" className="secondary-button" onClick={() => onNavigate("topology")}><Network size={15} />View topology</button>} />
    <div className="overview-summary-grid">
      <div className="overview-metric"><span>Local API</span><strong className={api ? "text-success" : "text-danger"}>{api ? "Available" : "Unavailable"}</strong><small>{api ? `Process ${api.processId}` : "Start the loopback API from terminal"}</small></div>
      <div className="overview-metric"><span>Active experiments</span><strong>{api?.activeExperiments ?? "—"}</strong><small>{api ? "Current API process count" : "Unavailable without API health"}</small></div>
      <div className="overview-metric"><span>Session results</span><strong>{results.length}</strong><small>Stored in page memory only</small></div>
      <div className="overview-metric"><span>Current job</span><strong>{job?.state.replaceAll("_", " ") ?? "None"}</strong><small>{job ? `${job.attempts.toLocaleString()} actual checks` : "No attack job in this session"}</small></div>
    </div>
    <div className="overview-grid">
      <section className="work-card overview-services">
        <div className="card-title-row"><div><span className="eyebrow">RUNTIME INVENTORY</span><h2>Laboratory services</h2></div><Activity size={17} className="accent-icon" /></div>
        <div className="overview-service-split">
          <div className="table-scroll"><table className="data-table"><caption>Application components and live availability for this browser session</caption><thead><tr><th scope="col">Component</th><th scope="col">Boundary</th><th scope="col">State</th></tr></thead><tbody>{services.map((service) => <tr className={service.name === selectedService.name ? "is-selected" : ""} key={service.name}><th scope="row"><button type="button" className="service-select" aria-pressed={service.name === selectedService.name} onClick={() => setSelectedServiceName(service.name)}>{service.name}</button></th><td>{service.boundary}</td><td><span className={`table-state ${service.available ? "state-pass" : "state-unavailable"}`}><span />{service.state}</span></td></tr>)}</tbody></table></div>
          <aside className="service-inspector" aria-live="polite" aria-label="Selected service details"><span className="eyebrow">SELECTED COMPONENT</span><h3>{selectedService.name}</h3><p>{selectedService.detail}</p><dl><div><dt>Boundary</dt><dd>{selectedService.boundary}</dd></div><div><dt>Availability</dt><dd>{selectedService.state}</dd></div>{selectedService.name === "Python laboratory API" && api && <><div><dt>Process ID</dt><dd>{api.processId}</dd></div><div><dt>Uptime</dt><dd>{Math.floor(api.uptimeSeconds)} seconds</dd></div></>}</dl></aside>
        </div>
        {api && <div className="overview-host-stats"><span><Cpu size={14} />Host CPU <strong>{api.cpuPercent.toFixed(1)}%</strong></span><span><KeyRound size={14} />Process memory <strong>{formatMemory(api.processMemoryBytes)}</strong></span><span><Workflow size={14} />Session uptime <strong>{Math.floor(api.uptimeSeconds)} s</strong></span></div>}
        <p className="result-foot">The service uses local operating-system processes. Docker/container status is not reported because the lab does not run containers.</p>
      </section>
      <section className="work-card overview-shortcuts">
        <div className="card-title-row"><div><span className="eyebrow">OPEN MODULE</span><h2>Start a laboratory task</h2></div></div>
        <button type="button" className="shortcut-row" onClick={() => onNavigate("analysis")}><span className="shortcut-icon blue"><ScanSearch size={17} /></span><span><strong>Analyze a synthetic example</strong><small>Runs in the browser, with no request to the API.</small></span><ArrowRight size={15} /></button>
        <button type="button" className="shortcut-row" onClick={() => onNavigate("hashing")}><span className="shortcut-icon cyan"><KeyRound size={17} /></span><span><strong>Explore password hashing</strong><small>Submit made-up values to the loopback lab.</small></span><ArrowRight size={15} /></button>
        <button type="button" className="shortcut-row" onClick={() => onNavigate("attack")}><span className="shortcut-icon blue"><ShieldCheck size={17} /></span><span><strong>Run a bounded attack</strong><small>Target verifiers are generated inside the API.</small></span><ArrowRight size={15} /></button>
        <button type="button" className="shortcut-row" onClick={() => onNavigate("learning")}><span className="shortcut-icon green"><BookOpen size={17} /></span><span><strong>Open guided learning</strong><small>Follow an experiment with real operations.</small></span><ArrowRight size={15} /></button>
      </section>
    </div>
    <section className="work-card overview-recent-card">
      <div className="card-title-row"><div><span className="eyebrow">CURRENT PAGE SESSION</span><h2>Recent safe results</h2></div><button type="button" className="subtle-link" onClick={() => onNavigate("reports")}>View reports <ArrowRight size={13} /></button></div>
      {results.length ? <div className="recent-result-list">{results.slice(0, 4).map((item) => <div className="recent-result-row" key={item.id}><span className={`result-type type-${item.category}`}>{item.category}</span><div><strong>{item.title}</strong><small>{item.outcome}</small></div><time dateTime={item.time}>{new Date(item.time).toLocaleTimeString()}</time></div>)}</div> : <div className="empty-state compact-empty"><Activity size={20} /><strong>Nothing has been recorded in this session.</strong><p>Completed operations create a summary without plaintext or verifier contents.</p></div>}
    </section>
  </>;
}

function TopologyNode({ icon, label, detail, status }: { readonly icon: "ui" | "core" | "api" | "worker"; readonly label: string; readonly detail: string; readonly status: "online" | "offline" | "idle" | "active" }) {
  const Icon = icon === "ui" ? ScanSearch : icon === "core" ? ShieldCheck : icon === "api" ? Terminal : Workflow;
  const isAvailable = status !== "offline";
  return <div className="topology-node"><span className={`topology-node-icon node-${icon}`}><Icon size={20} /></span><div><strong>{label}</strong><small>{detail}</small></div><span className={`topology-status status-${status}`}><span />{status}</span>{isAvailable ? <CircleCheck size={15} className="topology-check" /> : <CircleX size={15} className="topology-check" />}</div>;
}

export function TopologyPage({ api, job }: PageProps) {
  const workerStatus = !api ? "offline" : job && ["queued", "running"].includes(job.state) ? "active" : "idle";
  return <>
    <PageHeading eyebrow="ARCHITECTURE · TRUST BOUNDARIES" title="Lab Topology" description="The diagram describes the implemented local application. Availability badges reflect the browser page and the live API health response." />
    <section className="work-card topology-work-card">
      <div className="card-title-row"><div><span className="eyebrow">LOCAL ARCHITECTURE</span><h2>Browser and loopback lab</h2></div><span className="local-only-badge"><Network size={13} />No external target</span></div>
      <div className="topology-flow">
        <div className="topology-cluster browser-cluster"><div className="cluster-label">BROWSER · LOCAL PAGE MEMORY</div><TopologyNode icon="ui" label="React user interface" detail="Current page and session-only state" status="online" /><div className="topology-link"><span>Local function calls · no network</span><span className="link-line" /></div><TopologyNode icon="core" label="TypeScript analysis core" detail="Guessability, policy, reuse, generation" status="online" /></div>
        <div className="trust-link"><span>Explicit synthetic lab requests only</span><div><span className="trust-line" /><ArrowRight size={16} /><span className="trust-line" /></div></div>
        <div className="topology-cluster api-cluster"><div className="cluster-label">LOOPBACK · 127.0.0.1:8000</div><TopologyNode icon="api" label="Python FastAPI service" detail={api ? `PID ${api.processId} · health responding` : "Health unavailable"} status={api ? "online" : "offline"} /><div className="topology-link"><span>Internal bounded work</span><span className="link-line" /></div><TopologyNode icon="worker" label="Synthetic experiment worker" detail={api ? "Single in-process job slot" : "Requires API service"} status={workerStatus} /></div>
      </div>
      <div className="trust-boundaries"><article><strong>Browser-local path</strong><p>Analysis, policy, reuse and password generation run in this tab. They do not call the Python API.</p></article><article><strong>Explicit lab path</strong><p>Hashing, verification, attacks and benchmarks run only after a separate lab action sends its synthetic input to loopback.</p></article><article><strong>Attack isolation</strong><p>Attack routes accept fixed internal target IDs. Imported hashes, real account data and remote targets are not accepted.</p></article></div>
    </section>
    <section className="work-card topology-metrics-card">
      <div className="card-title-row"><div><span className="eyebrow">LIVE PROCESS INFORMATION</span><h2>Service measurements</h2></div></div>
      {api ? <div className="overview-host-stats"><span><Cpu size={15} />Host CPU <strong>{api.cpuPercent.toFixed(1)}%</strong></span><span><KeyRound size={15} />API memory <strong>{formatMemory(api.processMemoryBytes)}</strong></span><span><Workflow size={15} />Stored demo verifiers <strong>{api.storedVerifiers}</strong></span><span><Activity size={15} />Active experiments <strong>{api.activeExperiments}</strong></span></div> : <div className="empty-state compact-empty"><CircleX size={20} /><strong>Live process measurements are unavailable.</strong><p>The static topology describes code boundaries; runtime state is not inferred when the API is offline.</p></div>}
    </section>
  </>;
}

interface GuidedLab {
  readonly title: string;
  readonly area: string;
  readonly page: PageId;
  readonly objective: string;
  readonly background: string;
  readonly procedure: readonly string[];
  readonly observe: string;
  readonly implication: string;
  readonly misconception: string;
  readonly limitation: string;
  readonly question: string;
}

const GUIDED_LABS: readonly GuidedLab[] = [
  { title: "Why fast SHA-256 is unsuitable for password storage", area: "STORAGE", page: "hashing", objective: "Compare a fast hash baseline with adaptive password hash functions.", background: "A general-purpose hash is deterministic and optimized for speed. Password verifiers need tunable work so each offline guess costs more.", procedure: ["Use a made-up sample in the hashing laboratory.", "Create a SHA-256 baseline verifier.", "Create a verifier with PBKDF2, bcrypt, or Argon2id.", "Compare the actual generation and verification measurements."], observe: "The application displays the actual values and parameters returned by the local API. Repeated runs can vary with system load.", implication: "A stolen verifier can be tested offline. Adaptive costs raise the work needed per candidate.", misconception: "A cryptographic hash is not encryption and a strong digest name alone does not make a password storage scheme safe.", limitation: "This local comparison uses one synthetic sample and does not model a real attacker fleet or hardware.", question: "Which algorithm parameters affected the measured verification time most on this machine?" },
  { title: "Why independent salts produce different verifiers", area: "SALTING", page: "hashing", objective: "Observe independent salts for the same synthetic input.", background: "A salt is a unique random value stored beside a password verifier. It prevents equal values from sharing the same stored digest.", procedure: ["Select an adaptive hashing algorithm.", "Enable the two-verifier salt comparison.", "Submit one made-up sample once; the lab performs two independent hash operations.", "Inspect both encoded verifiers, salts, and parameters."], observe: "The server returns the actual salt and encoded verifier for each operation. Verification should succeed independently for both records.", implication: "Unique salts frustrate precomputed lookup and reveal neither the password nor the salt secret.", misconception: "A salt does not need to be hidden, and different hashes alone do not prove the stored parameters are safe.", limitation: "This demonstration is kept in short-lived process memory and is deleted on clear or expiry.", question: "Why does a unique salt help when the same password appears in two records?" },
  { title: "How adaptive cost changes verification time", area: "COST", page: "hashing", objective: "Compare allowed PBKDF2, bcrypt, or Argon2id configurations on the current machine.", background: "Iteration, work, time, and memory costs trade verifier resistance against legitimate login latency and resource use.", procedure: ["Choose one adaptive algorithm.", "Run at its baseline configuration and note the actual timing.", "Increase a server-allowed parameter within the displayed range.", "Verify the same synthetic sample against each verifier."], observe: "The page shows only measured local durations and the actual stored parameters.", implication: "Cost choices should be benchmarked on the target service and re-evaluated as hardware changes.", misconception: "Higher cost is not unconditionally better if it makes the service unusable or enables resource exhaustion.", limitation: "Measurements are local and short; the lab does not emulate a production login workload.", question: "What latency and resource trade-off would you evaluate before raising a production cost?" },
  { title: "How dictionary guesses work", area: "GUESSING", page: "attack", objective: "See ordered candidates checked against an internally generated verifier.", background: "A dictionary strategy tests likely words before less likely candidates. It is useful against predictable choices and common phrases.", procedure: ["Choose the educational dictionary strategy.", "Inspect the fixed candidate count and internal target profile.", "Run against the SHA-256 baseline first, then compare an adaptive algorithm.", "Inspect actual attempts, elapsed time, and stop reason."], observe: "A candidate is reported as recovered only after the selected verifier accepts it. Candidate text is not returned.", implication: "Guess order changes practical risk because common choices are tested early.", misconception: "A target not recovered within this tiny list is not proven uncrackable.", limitation: "The bundled seven-entry wordlist is an authored teaching fixture, not a representative attack dictionary.", question: "How did candidate order affect the number of checks before recovery?" },
  { title: "How brute-force search spaces grow", area: "SEARCH SPACE", page: "attack", objective: "Calculate and enumerate a small finite alphabet search space.", background: "For alphabet size A and length n, exact-length strings number Aⁿ; this lab sums those counts up to the selected maximum length.", procedure: ["Select the brute-force method.", "Choose an alphabet and maximum length.", "Read the search-space count before starting.", "Run the bounded experiment and compare actual checked candidates with the full space."], observe: "The UI shows the exact configured space and actual attempts. A time or attempt limit returns an inconclusive state.", implication: "Adding characters or length expands the possible combinations quickly, while predictable structure can reduce an attacker's search.", misconception: "One stopped experiment does not show that a password is impossible to guess.", limitation: "The implementation caps alphabets and lengths to keep the classroom process contained.", question: "How does increasing the maximum length change the total search space?" },
  { title: "Why predictable patterns reduce guessability", area: "PATTERNS", page: "analysis", objective: "Compare pattern-aware estimates with visual intuition about substitutions and suffixes.", background: "Human choices often include recognizable words, sequences, dates, keyboard walks, and predictable substitutions.", procedure: ["Enter a made-up example only in the browser-local analyzer.", "Inspect detected patterns and connected suggestions.", "Try a synthetic variant with an added suffix or common substitution.", "Compare the model findings, not only the score."], observe: "The result is a zxcvbn-ts model estimate. No password is sent to the lab API.", implication: "A longer value can remain predictable when it follows a common construction.", misconception: "Character classes and visual complexity do not guarantee high guessability resistance.", limitation: "The estimator uses English/common dictionaries and cannot know all contextual or attacker-specific information.", question: "Which detected construction made the largest difference to your assessment?" },
  { title: "How policy profiles differ", area: "POLICY", page: "policy", objective: "Compare modern minimum-length policy checks with an explicitly educational legacy rule.", background: "Policy compliance is a set of rules. It is distinct from strength, exposure, and storage security.", procedure: ["Enter one synthetic sample.", "Compare the single-factor and MFA-factor modern profiles.", "Compare the traditional-composition education profile.", "Inspect the individual rule state and blocklist explanation."], observe: "Each profile is evaluated by the TypeScript core; `not checked` is distinct from pass.", implication: "Modern guidance emphasizes length, blocklists, and usability over mandatory character mixtures.", misconception: "Passing a policy does not prove a value is strong or unexposed.", limitation: "The local whole-value screen uses bundled dictionaries, not a current breach corpus.", question: "Which profile encourages a longer passphrase without requiring character-class mixtures?" },
  { title: "What password reuse similarity means", area: "REUSE", page: "reuse", objective: "Identify exact duplicates and obvious near-duplicates in a short synthetic set.", background: "Users may reuse a base value with a changed suffix or small substitution. A heuristic can highlight such patterns.", procedure: ["Enter a few made-up examples in the reuse laboratory.", "Run the comparison and inspect exact groups and pair explanations.", "Try unrelated values and note when no pair exceeds the threshold.", "Clear the sample set when finished."], observe: "The output contains only indexes and similarity explanations; raw values remain in the page component state.", implication: "Small changes to a reused base may leave related credentials vulnerable.", misconception: "This feature does not discover reuse across real sites or compare independently salted hashes.", limitation: "Normalization and threshold rules can produce false positives and false negatives.", question: "Which sample pair was flagged, and what was the stated reason?" },
  { title: "How to read benchmark results", area: "MEASUREMENT", page: "benchmarks", objective: "Interpret repeated local measurements without treating them as universal rates.", background: "A benchmark needs a defined workload, warm-up, repetitions, timer, parameters, and environment metadata.", procedure: ["Run the benchmark from the measurement screen.", "Compare individual observations, medians, and IQRs.", "Read the OS, runtime, CPU, memory, and library metadata.", "Export the actual JSON observations if needed."], observe: "Chart bars and tables derive from the returned measurements. If the API is unavailable, no result is shown.", implication: "A measured cost helps choose practical parameters on the target system but is not a universal attacker throughput.", misconception: "A single short run cannot predict a production service or cracking cluster.", limitation: "The current API uses five repetitions per algorithm on one machine and does not collect historical hardware comparisons.", question: "Why should two algorithm measurements use consistent workloads and parameter reporting?" },
];

export function LearningPage({ onNavigate }: { readonly onNavigate: (page: PageId) => void }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? GUIDED_LABS : GUIDED_LABS.filter((lab) => lab.area === filter);
  const areas = [...new Set(GUIDED_LABS.map((lab) => lab.area))];
  return <>
    <PageHeading eyebrow="GUIDED EXPERIMENTS · REAL LOCAL OPERATIONS" title="Learning Center" description="Each guide links to a working laboratory module. Run the experiment yourself and interpret its actual output; no pre-written measurement values are displayed." />
    <section className="work-card learning-intro"><BookOpen size={20} /><div><strong>Use synthetic values only</strong><p>Analysis guides use browser-local examples. Hashing and attacks require an explicit local lab action. Each module explains its scope, limitations, and security implication.</p></div></section>
    <div className="learning-filter"><label htmlFor="learning-area">Filter guided labs<select id="learning-area" value={filter} onChange={(event) => setFilter(event.currentTarget.value)}><option value="all">All topics</option>{areas.map((area) => <option key={area} value={area}>{area}</option>)}</select></label><span>{filtered.length} guide(s)</span></div>
    <div className="learning-grid">{filtered.map((lab, index) => <GuidedLabCard key={lab.title} lab={lab} index={index + 1} onOpen={() => onNavigate(lab.page)} />)}</div>
  </>;
}

function GuidedLabCard({ lab, index, onOpen }: { readonly lab: GuidedLab; readonly index: number; readonly onOpen: () => void }) {
  return <article className="work-card guided-lab-card">
    <div className="guided-lab-top"><span className="lab-number">{String(index).padStart(2, "0")}</span><span className="eyebrow">{lab.area}</span></div>
    <h2>{lab.title}</h2>
    <p className="guided-objective"><strong>Objective.</strong> {lab.objective}</p>
    <details className="guided-details"><summary>Read theory, procedure and questions</summary>
      <div className="guided-detail-content">
        <section><h3>Background theory</h3><p>{lab.background}</p></section>
        <section><h3>Procedure</h3><ol>{lab.procedure.map((step) => <li key={step}>{step}</li>)}</ol></section>
        <section><h3>Expected behavior</h3><p>{lab.observe}</p></section>
        <section><h3>Security implication</h3><p>{lab.implication}</p></section>
        <section><h3>Common misconception</h3><p>{lab.misconception}</p></section>
        <section><h3>Limitations</h3><p>{lab.limitation}</p></section>
        <section className="learning-question"><h3>Discussion question</h3><p>{lab.question}</p></section>
      </div>
    </details>
    <button className="secondary-button guided-launch" type="button" onClick={onOpen}>Open {lab.area.toLocaleLowerCase()} module <ArrowRight size={14} /></button>
  </article>;
}

function formatMemory(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unavailable";
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KiB` : `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}
