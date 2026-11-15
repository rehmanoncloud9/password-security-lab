import { useState, type FormEvent } from "react";
import { AlertTriangle, Check, CircleHelp, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeading } from "../components/PageHeading.js";
import type { HashRecord, LabAlgorithm } from "../app/types.js";

interface HashOptions {
  readonly iterations?: number;
  readonly work_factor?: number;
  readonly memory_kib?: number;
  readonly time_cost?: number;
  readonly parallelism?: number;
}

interface VerificationResult {
  readonly matched: boolean;
  readonly algorithm: string;
  readonly verificationMs: number;
}

export function HashingPage({
  apiAvailable,
  hasActiveJob,
  hashes,
  operationError,
  onCreateHash,
  onVerify,
  onClear,
}: {
  readonly apiAvailable: boolean;
  readonly hasActiveJob: boolean;
  readonly hashes: readonly HashRecord[];
  readonly operationError: string;
  readonly onCreateHash: (password: string, algorithm: LabAlgorithm, options: HashOptions) => Promise<boolean>;
  readonly onVerify: (hashId: string, password: string) => Promise<VerificationResult>;
  readonly onClear: () => Promise<boolean>;
}) {
  const [password, setPassword] = useState("");
  const [algorithm, setAlgorithm] = useState<LabAlgorithm>("argon2id");
  const [iterations, setIterations] = useState(600_000);
  const [workFactor, setWorkFactor] = useState(10);
  const [memoryKiB, setMemoryKiB] = useState(19_456);
  const [timeCost, setTimeCost] = useState(2);
  const [parallelism, setParallelism] = useState(1);
  const [createPair, setCreatePair] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState<Record<string, string>>({});
  const [verificationResult, setVerificationResult] = useState<Record<string, string>>({});
  const [verificationBusy, setVerificationBusy] = useState<Record<string, boolean>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || !apiAvailable || busy) return;
    setBusy(true);
    setError("");
    const options: HashOptions = algorithm === "pbkdf2_sha256" ? { iterations }
      : algorithm === "bcrypt" ? { work_factor: workFactor }
        : algorithm === "argon2id" ? { memory_kib: memoryKiB, time_cost: timeCost, parallelism }
          : {};
    try {
      const first = await onCreateHash(password, algorithm, options);
      const second = first && createPair && algorithm !== "sha256"
        ? await onCreateHash(password, algorithm, options)
        : true;
      if (first && second) setPassword("");
      else setError("The local service did not create every requested verifier. Review the operations message.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Hash operation could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(hashId: string) {
    const candidate = verification[hashId] ?? "";
    if (!candidate || verificationBusy[hashId]) return;
    setVerificationBusy((current) => ({ ...current, [hashId]: true }));
    setError("");
    try {
      const result = await onVerify(hashId, candidate);
      setVerification((current) => ({ ...current, [hashId]: "" }));
      setVerificationBusy((current) => ({ ...current, [hashId]: false }));
      setVerificationResult((current) => ({ ...current, [hashId]: result.matched ? "MATCH" : "NO MATCH" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification could not be completed.");
      setVerificationBusy((current) => ({ ...current, [hashId]: false }));
    }
  }

  async function clearLab(): Promise<boolean> {
    const cleared = await onClear();
    if (cleared) {
      setPassword("");
      setVerification({});
      setVerificationResult({});
      setVerificationBusy({});
      setError("");
    }
    return cleared;
  }

  return <>
    <PageHeading eyebrow="LOCAL PYTHON CRYPTOGRAPHY LAB" title="Hashing Laboratory" description="Create short-lived verifiers with established libraries, verify candidates, inspect parameters, and measure real execution time. Use synthetic values only." actions={<button type="button" className="secondary-button" onClick={() => void clearLab()} disabled={!hashes.length && !hasActiveJob || !apiAvailable}>Clear lab state <Trash2 size={15} /></button>} />
    <div className="feature-stack">
      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">ACTUAL CRYPTOGRAPHIC OPERATION</span><h2>Create a password verifier</h2></div><span className={`service-label ${apiAvailable ? "online-label" : "offline-label"}`}><span className="service-dot" />{apiAvailable ? "Loopback API ready" : "Loopback API unavailable"}</span></div>
        <form onSubmit={submit} className="hash-form">
          <label className="field-label" htmlFor="hash-sample">Made-up sample value<input id="hash-sample" type="password" autoComplete="off" maxLength={1024} value={password} onChange={(event) => setPassword(event.currentTarget.value)} required aria-describedby="hash-privacy" /><span id="hash-privacy" className="field-hint">This value is sent only to the loopback API after you select Generate verifier.</span></label>
          <div className="hash-parameter-grid">
            <label className="field-label" htmlFor="hash-algorithm">Algorithm<select id="hash-algorithm" value={algorithm} onChange={(event) => { setAlgorithm(event.currentTarget.value as LabAlgorithm); setCreatePair(false); }}><option value="argon2id">Argon2id</option><option value="bcrypt">bcrypt</option><option value="pbkdf2_sha256">PBKDF2-HMAC-SHA256</option><option value="sha256">SHA-256 (unsafe baseline)</option></select></label>
            {algorithm === "pbkdf2_sha256" && <label className="field-label" htmlFor="pbkdf2-iterations">Iterations<input id="pbkdf2-iterations" type="number" min={600_000} max={1_200_000} step={100_000} value={iterations} onChange={(event) => setIterations(event.currentTarget.valueAsNumber)} /></label>}
            {algorithm === "bcrypt" && <label className="field-label" htmlFor="bcrypt-factor">Work factor<input id="bcrypt-factor" type="number" min={10} max={14} value={workFactor} onChange={(event) => setWorkFactor(event.currentTarget.valueAsNumber)} /></label>}
            {algorithm === "argon2id" && <>
              <label className="field-label" htmlFor="argon-memory">Memory (KiB)<input id="argon-memory" type="number" min={19_456} max={65_536} step={1_024} value={memoryKiB} onChange={(event) => setMemoryKiB(event.currentTarget.valueAsNumber)} /></label>
              <label className="field-label" htmlFor="argon-time">Time cost<input id="argon-time" type="number" min={2} max={4} value={timeCost} onChange={(event) => setTimeCost(event.currentTarget.valueAsNumber)} /></label>
              <label className="field-label" htmlFor="argon-parallel">Parallelism<input id="argon-parallel" type="number" min={1} max={2} value={parallelism} onChange={(event) => setParallelism(event.currentTarget.valueAsNumber)} /></label>
            </>}
          </div>
          <div className="hash-form-footer">
            <label className={`inline-check ${algorithm === "sha256" ? "is-disabled" : ""}`}><input type="checkbox" checked={createPair && algorithm !== "sha256"} disabled={algorithm === "sha256"} onChange={(event) => setCreatePair(event.currentTarget.checked)} />Create two independent salts for comparison</label>
            <button className="primary-button" type="submit" disabled={!apiAvailable || !password || busy}>{busy ? "Computing…" : "Generate verifier"}<KeyRound size={15} /></button>
          </div>
        </form>
        <div className="inline-notice"><CircleHelp size={15} /><p>SHA-256 is a fast, deterministic baseline and is unsuitable alone for password storage. bcrypt inputs over 72 UTF-8 bytes are rejected, never truncated.</p></div>
        {operationError && <div className="inline-alert error-alert" role="alert"><AlertTriangle size={15} />{operationError}</div>}
        {error && <div className="inline-alert error-alert" role="alert"><AlertTriangle size={15} />{error}</div>}
      </section>

      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">SHORT-LIVED SERVER MEMORY</span><h2>Generated verifiers</h2></div><span className="measurement-label">{hashes.length} record(s) in this page session</span></div>
        {hashes.length ? <div className="verifier-list">{hashes.map((record, index) => <VerifierCard key={record.hashId} record={record} sequence={index + 1} value={verification[record.hashId] ?? ""} result={verificationResult[record.hashId] ?? ""} busy={Boolean(verificationBusy[record.hashId])} onChange={(value) => setVerification((current) => ({ ...current, [record.hashId]: value }))} onVerify={() => void verify(record.hashId)} />)}</div> : <div className="empty-state compact-empty"><KeyRound size={21} /><strong>No verifier has been generated in this session.</strong><p>Generated verifiers expire from local server memory after the documented TTL.</p></div>}
      </section>

      <section className="work-card concept-table-card">
        <div className="card-title-row"><div><span className="eyebrow">EDUCATIONAL COMPARISON</span><h2>Algorithm suitability</h2></div></div>
        <div className="table-scroll"><table className="data-table"><caption>Purpose and parameter behavior of the implemented storage methods</caption><thead><tr><th scope="col">Method</th><th scope="col">Stored salt</th><th scope="col">Adjustable cost</th><th scope="col">Storage guidance</th></tr></thead><tbody>
          <tr><th scope="row">SHA-256</th><td>No</td><td>No</td><td><span className="danger-text">Unsafe baseline only</span></td></tr>
          <tr><th scope="row">PBKDF2-HMAC-SHA256</th><td>Random</td><td>Iterations</td><td>Adaptive; useful in FIPS-constrained settings</td></tr>
          <tr><th scope="row">bcrypt</th><td>Random</td><td>Work factor</td><td>Adaptive; 72-byte input limit is enforced</td></tr>
          <tr><th scope="row">Argon2id</th><td>Random</td><td>Memory, time, parallelism</td><td>Memory-hard modern choice</td></tr>
        </tbody></table></div>
      </section>
    </div>
  </>;
}

function VerifierCard({
  record,
  sequence,
  value,
  result,
  busy,
  onChange,
  onVerify,
}: {
  readonly record: HashRecord;
  readonly sequence: number;
  readonly value: string;
  readonly result: string;
  readonly busy: boolean;
  readonly onChange: (value: string) => void;
  readonly onVerify: () => void;
}) {
  return <article className="verifier-card">
    <div className="verifier-heading"><div><span className="eyebrow">VERIFIER {String(sequence).padStart(2, "0")}</span><h3>{record.algorithm.replaceAll("_", "-")}</h3></div><span className="duration-badge">{record.generationMs.toFixed(2)} ms</span></div>
    <dl className="verifier-details"><dt>Encoded verifier</dt><dd><code className="hash-code">{record.storedHash}</code></dd><dt>Salt</dt><dd>{record.salt ?? "Not used by this fast-hash baseline"}{record.salt && <span className="muted-copy"> · stored with the verifier, not secret</span>}</dd><dt>Parameters</dt><dd>{Object.entries(record.parameters).map(([key, item]) => `${key}: ${item}`).join(" · ") || "Plain SHA-256; no work parameters"}</dd></dl>
    <div className="verify-form"><label className="field-label" htmlFor={`verify-${record.hashId}`}>Candidate to verify<input id={`verify-${record.hashId}`} type="password" autoComplete="off" value={value === "MATCH" || value === "NO MATCH" ? "" : value} onChange={(event) => onChange(event.currentTarget.value)} maxLength={1024} /></label><button className="secondary-button" type="button" disabled={!value || value === "MATCH" || value === "NO MATCH" || busy} onClick={onVerify}>{busy ? "Verifying…" : "Verify candidate"}<ShieldCheck size={14} /></button></div>
    {result && <div className={`verification-result ${result === "MATCH" ? "success-result" : "failure-result"}`} role="status"><span>{result === "MATCH" ? <Check size={14} /> : <AlertTriangle size={14} />}</span>{result === "MATCH" ? "Candidate matched" : "Candidate did not match"} · actual verification result</div>}
  </article>;
}
