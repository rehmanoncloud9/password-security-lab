import { useState } from "react";
import { Download, Gauge, Info, Trash2 } from "lucide-react";
import { PageHeading } from "../components/PageHeading.js";
import type { BenchmarkReport, SafeResult, SafeResultInput } from "../app/types.js";

function downloadFile(name: string, body: string, contentType: string): void {
  const url = URL.createObjectURL(new Blob([body], { type: contentType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function jsonEnvironment(environment: Record<string, unknown>): string {
  return Object.entries(environment).map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`).join(" · ");
}

export function BenchmarksPage({
  apiAvailable,
  report,
  busy,
  error,
  onRun,
  onSafeResult,
}: {
  readonly apiAvailable: boolean;
  readonly report: BenchmarkReport | null;
  readonly busy: boolean;
  readonly error: string;
  readonly onRun: () => Promise<BenchmarkReport | null>;
  readonly onSafeResult: (result: SafeResultInput) => void;
}) {
  const [exportError, setExportError] = useState("");

  async function run() {
    const measured = await onRun();
    if (measured) onSafeResult({ category: "benchmark", title: "Hash and verification benchmark", outcome: `${measured.results.length} algorithms measured; ${measured.results[0]?.repetitions ?? 0} repetitions each` });
  }

  return <>
    <PageHeading eyebrow="ACTUAL LOCAL MEASUREMENTS" title="Benchmarks" description="Measure real hash generation and verification work on this machine. Results include individual observations, median, interquartile range, parameters, runtime, and hardware metadata." actions={<button className="primary-button" type="button" onClick={() => void run()} disabled={!apiAvailable || busy}>{busy ? "Measuring…" : "Run benchmark"}<Gauge size={15} /></button>} />
    <div className="feature-stack">
      <section className="work-card benchmark-method-card">
        <div className="card-title-row"><div><span className="eyebrow">MEASUREMENT METHOD</span><h2>Comparable local workload</h2></div></div>
        <div className="method-grid"><div><strong>Warm-up</strong><p>Each algorithm performs one unreported hash and correct-password verification before measured repetitions.</p></div><div><strong>Five repetitions</strong><p>Every displayed observation came from an actual local operation measured with a monotonic high-resolution timer.</p></div><div><strong>Interpretation</strong><p>These measurements describe this machine and runtime. They are not a universal attacker rate or a crack-time prediction.</p></div></div>
        <div className="inline-notice"><Info size={15} /><p>The service allows one benchmark at a time. If the local API is unavailable, this screen reports unavailable and does not substitute example values.</p></div>
        {error && <p className="inline-alert error-alert" role="alert">{error}</p>}
      </section>
      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">RUNTIME RESULTS</span><h2>Algorithm comparison</h2></div>{report && <button type="button" className="secondary-button" onClick={() => { try { downloadFile("password-lab-benchmark.json", JSON.stringify(report, null, 2), "application/json"); setExportError(""); } catch { setExportError("Benchmark JSON export could not be created."); } }}><Download size={15} />Export JSON</button>}</div>
        {report ? <>
          <p className="measurement-caption">{report.method}</p>
          <p className="environment-caption">Environment: {jsonEnvironment(report.environment)}</p>
          <div className="benchmark-chart" role="img" aria-label="Measured median hash generation times; a data table follows">
            <h3>Median generation time</h3>
            {report.results.map((item) => {
              const maximum = Math.max(0.001, ...report.results.map((row) => row.hashGenerationMs.median));
              const width = Math.max(1, item.hashGenerationMs.median / maximum * 100);
              return <div className="benchmark-bar-row" key={item.algorithm}><span>{item.algorithm.replaceAll("_", "-")}</span><div className="bar-track"><span style={{ width: `${width}%` }} /></div><strong>{item.hashGenerationMs.median.toFixed(3)} ms</strong></div>;
            })}
          </div>
          <div className="table-scroll"><table className="data-table benchmark-table"><caption>Actual hash and verification observations, milliseconds</caption><thead><tr><th scope="col">Algorithm</th><th scope="col">Parameters</th><th scope="col">Hash median (IQR)</th><th scope="col">Verify median (IQR)</th><th scope="col">Hash observations</th><th scope="col">Verify observations</th></tr></thead><tbody>{report.results.map((item) => <tr key={item.algorithm}><th scope="row">{item.algorithm.replaceAll("_", "-")}</th><td>{Object.entries(item.parameters).map(([key, value]) => `${key}=${value}`).join("; ") || "No tunable parameters"}</td><td>{item.hashGenerationMs.median.toFixed(3)} ({item.hashGenerationMs.iqr.toFixed(3)})</td><td>{item.verificationMs.median.toFixed(3)} ({item.verificationMs.iqr.toFixed(3)})</td><td>{item.hashGenerationMs.individual.map((value) => value.toFixed(3)).join(", ")}</td><td>{item.verificationMs.individual.map((value) => value.toFixed(3)).join(", ")}</td></tr>)}</tbody></table></div>
          <div className="environment-grid">{Object.entries(report.environment).map(([key, value]) => <div key={key}><span>{key.replaceAll(/([A-Z])/g, " $1")}</span><strong>{typeof value === "object" ? JSON.stringify(value) : String(value)}</strong></div>)}</div>
          <ul className="limitations-list">{report.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
        </> : <div className="empty-state"><Gauge size={24} /><strong>No benchmark has run in this session.</strong><p>Start a real local measurement when the API is available.</p></div>}
        {exportError && <p className="inline-alert error-alert" role="alert">{exportError}</p>}
      </section>
    </div>
  </>;
}

function csvEscape(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function ReportsPage({ results, onClear }: { readonly results: readonly SafeResult[]; readonly onClear: () => void }) {
  const [error, setError] = useState("");
  const fields = ["time", "category", "title", "outcome", "durationMs", "throughputPerSecond", "algorithm", "parameters"] as const;

  function exportJson() {
    try {
      downloadFile("password-lab-session-results.json", JSON.stringify(results, null, 2), "application/json");
      setError("");
    } catch {
      setError("JSON report could not be created.");
    }
  }

  function exportCsv() {
    try {
      const lines = [fields.join(","), ...results.map((item) => fields.map((field) => {
        const value = field === "parameters" ? JSON.stringify(item.parameters ?? {}) : String(item[field] ?? "");
        return csvEscape(value);
      }).join(","))];
      downloadFile("password-lab-session-results.csv", lines.join("\r\n"), "text/csv;charset=utf-8");
      setError("");
    } catch {
      setError("CSV report could not be created.");
    }
  }

  return <>
    <PageHeading eyebrow="CURRENT BROWSER SESSION · SECRET-FREE" title="Results & Reports" description="Review experiment summaries captured in this page session. Exports contain measured outcomes and settings only—no password values, verifiers, salts, or generated outputs." actions={<>
      <button className="secondary-button" type="button" onClick={exportCsv} disabled={!results.length}><Download size={14} />Export CSV</button>
      <button className="secondary-button" type="button" onClick={exportJson} disabled={!results.length}><Download size={14} />Export JSON</button>
    </>} />
    <section className="work-card reports-card">
      <div className="card-title-row"><div><span className="eyebrow">EPHEMERAL HISTORY</span><h2>Session activity</h2></div><button type="button" className="text-action" disabled={!results.length} onClick={onClear}><Trash2 size={14} />Clear history</button></div>
      {results.length ? <div className="table-scroll"><table className="data-table reports-table"><caption>Secret-free operation summaries created during this page session</caption><thead><tr><th scope="col">Time</th><th scope="col">Type</th><th scope="col">Experiment</th><th scope="col">Outcome</th><th scope="col">Duration</th><th scope="col">Candidate checks / second</th><th scope="col">Parameters</th></tr></thead><tbody>{results.map((item) => <tr key={item.id}><td>{new Date(item.time).toLocaleTimeString()}</td><td><span className={`report-category category-${item.category}`}>{item.category}</span></td><th scope="row">{item.title}</th><td>{item.outcome}</td><td>{item.durationMs === undefined ? "—" : `${item.durationMs.toFixed(3)} ms`}</td><td>{item.throughputPerSecond === undefined ? "—" : item.throughputPerSecond.toLocaleString()}</td><td>{Object.entries(item.parameters ?? {}).map(([key, value]) => `${key}=${value}`).join(" · ") || item.algorithm || "—"}</td></tr>)}</tbody></table></div> : <div className="empty-state"><FileIcon /><strong>No operations recorded in this session yet.</strong><p>Hashing, verification, policy, reuse, attack and benchmark summaries appear here after those operations run.</p></div>}
      <p className="result-foot">History is kept in this React page session only. Reloading or closing the tab clears it. It excludes plaintext and generated password values.</p>
      {error && <p className="inline-alert error-alert" role="alert">{error}</p>}
    </section>
  </>;
}

function FileIcon() { return <Download size={22} aria-hidden="true" />; }
