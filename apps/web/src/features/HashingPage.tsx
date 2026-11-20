import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, Check, CircleHelp, FlaskConical, KeyRound, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeading } from "../components/PageHeading.js";
import type { CandidateVariant, HashRecord, LabAlgorithm, LabFixture } from "../app/types.js";

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

const FALLBACK_FIXTURES: readonly LabFixture[] = [
  {
    fixtureId: "fixture-alpha-baseline",
    label: "Alpha Baseline (Synthetic Alphanumeric)",
    description: "Standard 12-character synthetic password with upper, lower, digits",
    candidatePreview: "Alpha#Demo2026",
    availableVariants: ["correct", "wrong", "modified"],
  },
  {
    fixtureId: "fixture-beta-structured",
    label: "Beta Structured (Synthetic Passphrase)",
    description: "Structured 4-word synthetic passphrase with hyphen delimiter",
    candidatePreview: "battery-horse-staple-demo",
    availableVariants: ["correct", "wrong", "modified"],
  },
  {
    fixtureId: "fixture-gamma-compact",
    label: "Gamma Compact (Synthetic Token)",
    description: "Short 8-character compact synthetic token",
    candidatePreview: "gm99!xQz",
    availableVariants: ["correct", "wrong", "modified"],
  },
];

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
  readonly onCreateHash: (fixtureId: string, algorithm: LabAlgorithm, options: HashOptions) => Promise<boolean>;
  readonly onVerify: (hashId: string, candidateVariant: CandidateVariant) => Promise<VerificationResult>;
  readonly onClear: () => Promise<boolean>;
}) {
  const [fixtures, setFixtures] = useState<readonly LabFixture[]>(FALLBACK_FIXTURES);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>("fixture-alpha-baseline");
  const [algorithm, setAlgorithm] = useState<LabAlgorithm>("argon2id");
  const [iterations, setIterations] = useState(600_000);
  const [workFactor, setWorkFactor] = useState(10);
  const [memoryKiB, setMemoryKiB] = useState(19_456);
  const [timeCost, setTimeCost] = useState(2);
  const [parallelism, setParallelism] = useState(1);
  const [createPair, setCreatePair] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verificationVariant, setVerificationVariant] = useState<Record<string, CandidateVariant>>({});
  const [verificationResult, setVerificationResult] = useState<Record<string, { matched: boolean; ms: number }>>({});
  const [verificationBusy, setVerificationBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let disposed = false;
    async function loadFixtures() {
      try {
        const response = await fetch("http://127.0.0.1:8000/lab/fixtures");
        if (!response.ok) return;
        const data = await response.json() as { fixtures: LabFixture[] };
        if (!disposed && Array.isArray(data.fixtures) && data.fixtures.length > 0) {
          setFixtures(data.fixtures);
          setSelectedFixtureId(data.fixtures[0]!.fixtureId);
        }
      } catch {
        // Fallback fixtures remain active if API is not reachable
      }
    }
    if (apiAvailable) {
      void loadFixtures();
    }
    return () => { disposed = true; };
  }, [apiAvailable]);

  const selectedFixture = fixtures.find((f) => f.fixtureId === selectedFixtureId) ?? fixtures[0]!;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiAvailable || busy) return;
    setBusy(true);
    setError("");
    const options: HashOptions = algorithm === "pbkdf2_sha256" ? { iterations }
      : algorithm === "bcrypt" ? { work_factor: workFactor }
        : algorithm === "argon2id" ? { memory_kib: memoryKiB, time_cost: timeCost, parallelism }
          : {};
    try {
      const first = await onCreateHash(selectedFixtureId, algorithm, options);
      const second = first && createPair && algorithm !== "sha256"
        ? await onCreateHash(selectedFixtureId, algorithm, options)
        : true;
      if (!first || !second) {
        setError("The local service did not create every requested verifier. Review the operations message.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Hash operation could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(hashId: string) {
    const variant = verificationVariant[hashId] ?? "correct";
    if (verificationBusy[hashId]) return;
    setVerificationBusy((current) => ({ ...current, [hashId]: true }));
    setError("");
    try {
      const result = await onVerify(hashId, variant);
      setVerificationBusy((current) => ({ ...current, [hashId]: false }));
      setVerificationResult((current) => ({
        ...current,
        [hashId]: { matched: result.matched, ms: result.verificationMs },
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification could not be completed.");
      setVerificationBusy((current) => ({ ...current, [hashId]: false }));
    }
  }

  async function clearLab(): Promise<boolean> {
    const cleared = await onClear();
    if (cleared) {
      setVerificationVariant({});
      setVerificationResult({});
      setVerificationBusy({});
      setError("");
    }
    return cleared;
  }

  return <>
    <PageHeading
      eyebrow="LOCAL PYTHON CRYPTOGRAPHY LAB"
      title="Hashing Laboratory"
      description="Create short-lived verifiers with established libraries, test candidate verification paths, inspect parameters, and measure real execution time. Operates strictly on server-owned synthetic fixtures."
      actions={<button type="button" className="secondary-button" onClick={() => void clearLab()} disabled={!hashes.length && !hasActiveJob || !apiAvailable}>Clear lab state <Trash2 size={15} /></button>}
    />

    <div className="feature-stack">
      <div className="privacy-callout lab-boundary-callout" role="note">
        <ShieldAlert size={20} className="boundary-alert-icon" />
        <div>
          <strong>RESEARCH LAB: Synthetic samples only</strong>
          <p>Personal credentials must never be entered into lab operations. All operations execute strictly against server-owned test fixtures. The backend API rejects free-form passwords with HTTP 422.</p>
        </div>
      </div>

      <section className="work-card">
        <div className="card-title-row">
          <div>
            <span className="eyebrow">ACTUAL CRYPTOGRAPHIC OPERATION</span>
            <h2>Create a password verifier</h2>
          </div>
          <span className={`service-label ${apiAvailable ? "online-label" : "offline-label"}`}>
            <span className="service-dot" />{apiAvailable ? "Loopback API ready" : "Loopback API unavailable"}
          </span>
        </div>

        <form onSubmit={submit} className="hash-form">
          <div className="fixture-selection-group">
            <label className="field-label" htmlFor="hash-fixture">
              Select Synthetic Test Fixture
              <select
                id="hash-fixture"
                value={selectedFixtureId}
                onChange={(event) => setSelectedFixtureId(event.currentTarget.value)}
              >
                {fixtures.map((f) => (
                  <option key={f.fixtureId} value={f.fixtureId}>
                    {f.label} ({f.fixtureId})
                  </option>
                ))}
              </select>
            </label>

            {selectedFixture && (
              <div className="fixture-preview-card">
                <div className="fixture-preview-header">
                  <FlaskConical size={14} />
                  <span>Fixture details: <strong>{selectedFixture.label}</strong></span>
                </div>
                <p className="fixture-preview-description">{selectedFixture.description}</p>
                <div className="fixture-preview-meta">
                  <span>Candidate sample: <code>{selectedFixture.candidatePreview}</code></span>
                  <span>Available variants: <em>{selectedFixture.availableVariants.join(", ")}</em></span>
                </div>
              </div>
            )}
          </div>

          <div className="hash-parameter-grid">
            <label className="field-label" htmlFor="hash-algorithm">
              Algorithm
              <select
                id="hash-algorithm"
                value={algorithm}
                onChange={(event) => { setAlgorithm(event.currentTarget.value as LabAlgorithm); setCreatePair(false); }}
              >
                <option value="argon2id">Argon2id</option>
                <option value="bcrypt">bcrypt</option>
                <option value="pbkdf2_sha256">PBKDF2-HMAC-SHA256</option>
                <option value="sha256">SHA-256 (unsafe baseline)</option>
              </select>
            </label>

            {algorithm === "pbkdf2_sha256" && (
              <label className="field-label" htmlFor="pbkdf2-iterations">
                Iterations
                <input
                  id="pbkdf2-iterations"
                  type="number"
                  min={600_000}
                  max={1_200_000}
                  step={100_000}
                  value={iterations}
                  onChange={(event) => setIterations(event.currentTarget.valueAsNumber)}
                />
              </label>
            )}

            {algorithm === "bcrypt" && (
              <label className="field-label" htmlFor="bcrypt-factor">
                Work factor
                <input
                  id="bcrypt-factor"
                  type="number"
                  min={10}
                  max={14}
                  value={workFactor}
                  onChange={(event) => setWorkFactor(event.currentTarget.valueAsNumber)}
                />
              </label>
            )}

            {algorithm === "argon2id" && (
              <>
                <label className="field-label" htmlFor="argon-memory">
                  Memory (KiB)
                  <input
                    id="argon-memory"
                    type="number"
                    min={19_456}
                    max={65_536}
                    step={1_024}
                    value={memoryKiB}
                    onChange={(event) => setMemoryKiB(event.currentTarget.valueAsNumber)}
                  />
                </label>
                <label className="field-label" htmlFor="argon-time">
                  Time cost
                  <input
                    id="argon-time"
                    type="number"
                    min={2}
                    max={4}
                    value={timeCost}
                    onChange={(event) => setTimeCost(event.currentTarget.valueAsNumber)}
                  />
                </label>
                <label className="field-label" htmlFor="argon-parallel">
                  Parallelism
                  <input
                    id="argon-parallel"
                    type="number"
                    min={1}
                    max={2}
                    value={parallelism}
                    onChange={(event) => setParallelism(event.currentTarget.valueAsNumber)}
                  />
                </label>
              </>
            )}
          </div>

          <div className="hash-form-footer">
            <label className={`inline-check ${algorithm === "sha256" ? "is-disabled" : ""}`}>
              <input
                type="checkbox"
                checked={createPair && algorithm !== "sha256"}
                disabled={algorithm === "sha256"}
                onChange={(event) => setCreatePair(event.currentTarget.checked)}
              />
              Create two independent salts for comparison
            </label>
            <button className="primary-button" type="submit" disabled={!apiAvailable || busy}>
              {busy ? "Computing…" : "Generate verifier"}
              <KeyRound size={15} />
            </button>
          </div>
        </form>

        <div className="inline-notice">
          <CircleHelp size={15} />
          <p>SHA-256 is a fast, unkeyed baseline and is unsuitable for password storage. bcrypt inputs over 72 UTF-8 bytes are rejected, never truncated. Argon2id uses memory hardness to resist GPU/ASIC acceleration.</p>
        </div>

        {operationError && <div className="inline-alert error-alert" role="alert"><AlertTriangle size={15} />{operationError}</div>}
        {error && <div className="inline-alert error-alert" role="alert"><AlertTriangle size={15} />{error}</div>}
      </section>

      <section className="work-card">
        <div className="card-title-row">
          <div>
            <span className="eyebrow">SHORT-LIVED SERVER MEMORY</span>
            <h2>Generated verifiers</h2>
          </div>
          <span className="measurement-label">{hashes.length} record(s) in this session</span>
        </div>

        {hashes.length ? (
          <div className="verifier-list">
            {hashes.map((record, index) => (
              <VerifierCard
                key={record.hashId}
                record={record}
                sequence={index + 1}
                variant={verificationVariant[record.hashId] ?? "correct"}
                result={verificationResult[record.hashId] ?? null}
                busy={Boolean(verificationBusy[record.hashId])}
                onVariantChange={(variant) => setVerificationVariant((curr) => ({ ...curr, [record.hashId]: variant }))}
                onVerify={() => void verify(record.hashId)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state compact-empty">
            <KeyRound size={21} />
            <strong>No verifier has been generated in this session.</strong>
            <p>Generated verifiers expire automatically from server memory after their TTL.</p>
          </div>
        )}
      </section>

      <section className="work-card concept-table-card">
        <div className="card-title-row">
          <div>
            <span className="eyebrow">EDUCATIONAL COMPARISON</span>
            <h2>Algorithm suitability</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <caption>Purpose and parameter behavior of the implemented storage methods</caption>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">Stored salt</th>
                <th scope="col">Adjustable cost</th>
                <th scope="col">Resistance property</th>
                <th scope="col">Current Guidance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">SHA-256</th>
                <td>No</td>
                <td>No</td>
                <td>None (Fast general hash)</td>
                <td><span className="danger-text">Unsafe for passwords</span></td>
              </tr>
              <tr>
                <th scope="row">PBKDF2-HMAC-SHA256</th>
                <td>Random (16B)</td>
                <td>Iterations ($\ge 600,000$)</td>
                <td>CPU time-hard</td>
                <td>Acceptable (FIPS compliance)</td>
              </tr>
              <tr>
                <th scope="row">bcrypt</th>
                <td>Random (16B)</td>
                <td>Work factor (10–14)</td>
                <td>L1 cache memory footprint</td>
                <td>Widespread standard; 72B input limit</td>
              </tr>
              <tr>
                <th scope="row">Argon2id</th>
                <td>Random (16B)</td>
                <td>Memory ($\ge 19$ MiB), Time, Threads</td>
                <td>Memory-hard (anti-ASIC/GPU)</td>
                <td>Modern recommendation (RFC 9106)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </>;
}

function VerifierCard({
  record,
  sequence,
  variant,
  result,
  busy,
  onVariantChange,
  onVerify,
}: {
  readonly record: HashRecord;
  readonly sequence: number;
  readonly variant: CandidateVariant;
  readonly result: { matched: boolean; ms: number } | null;
  readonly busy: boolean;
  readonly onVariantChange: (variant: CandidateVariant) => void;
  readonly onVerify: () => void;
}) {
  return (
    <article className="verifier-card">
      <div className="verifier-heading">
        <div>
          <span className="eyebrow">VERIFIER {String(sequence).padStart(2, "0")} · {record.fixtureId}</span>
          <h3>{record.algorithm.replaceAll("_", "-")}</h3>
        </div>
        <span className="duration-badge">{record.generationMs.toFixed(2)} ms</span>
      </div>

      <dl className="verifier-details">
        <dt>Encoded verifier</dt>
        <dd><code className="hash-code">{record.storedHash}</code></dd>
        <dt>Salt</dt>
        <dd>
          {record.salt ?? "Not used by this fast-hash baseline"}
          {record.salt && <span className="muted-copy"> · stored alongside verifier, not secret</span>}
        </dd>
        <dt>Parameters</dt>
        <dd>
          {Object.entries(record.parameters).map(([key, item]) => `${key}: ${item}`).join(" · ") || "Plain SHA-256; no work parameters"}
        </dd>
      </dl>

      <div className="verify-form">
        <label className="field-label" htmlFor={`variant-select-${record.hashId}`}>
          Candidate variant to test
          <select
            id={`variant-select-${record.hashId}`}
            value={variant}
            onChange={(e) => onVariantChange(e.currentTarget.value as CandidateVariant)}
            disabled={busy}
          >
            <option value="correct">correct — Valid matching fixture candidate</option>
            <option value="wrong">wrong — Different/incorrect candidate</option>
            <option value="modified">modified — Mutated single-character variant</option>
          </select>
        </label>
        <button
          className="secondary-button"
          type="button"
          disabled={busy}
          onClick={onVerify}
        >
          {busy ? "Verifying…" : "Verify candidate variant"}
          <ShieldCheck size={14} />
        </button>
      </div>

      {result && (
        <div
          className={`verification-result ${result.matched ? "success-result" : "failure-result"}`}
          role="status"
        >
          <span>{result.matched ? <Check size={14} /> : <AlertTriangle size={14} />}</span>
          {result.matched ? "Candidate matched" : "Candidate rejected (no match)"}
          <span className="muted-copy"> · verified in {result.ms.toFixed(2)} ms</span>
        </div>
      )}
    </article>
  );
}
