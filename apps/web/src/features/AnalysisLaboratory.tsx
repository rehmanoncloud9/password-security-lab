import { useMemo, useState, type FormEvent } from "react";
import {
  analyzePassword,
  analyzeReuse,
  checkExposureHibp,
  checkLocalBlocklist,
  DEFAULT_PASSPHRASE_WORD_COUNT,
  DEFAULT_RANDOM_LENGTH,
  evaluatePolicy,
  generatePassword,
  PASSPHRASE_WORD_COUNT,
  type AnalysisResult,
  type BlocklistResult,
  type HibpCheckResult,
  type PolicyId,
  type PolicyResult,
  type ReuseResult,
} from "@psa/core";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Database,
  Eye,
  EyeOff,
  Globe,
  Info,
  KeyRound,
  Layers,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { PageHeading } from "../components/PageHeading.js";
import type { LabEvent, SafeResultInput } from "../app/types.js";

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter a password...",
  maxLength = 512,
  type = "password",
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly maxLength?: number;
  readonly type?: "password" | "text";
}) {
  const [visible, setVisible] = useState(type === "text");
  return (
    <label className="field-label" htmlFor={id}>
      {label}
      <span className="password-field">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          maxLength={maxLength}
          aria-describedby={`${id}-privacy`}
        />
        <button
          className="field-icon-button"
          type="button"
          aria-label={visible ? "Mask value" : "Show value"}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
      <small id={`${id}-privacy`} className="field-hint">
        Personal password tool: executes locally in browser memory. Never sent to the lab API or network.
      </small>
    </label>
  );
}

function AnalysisEmptyState() {
  return (
    <div className="analysis-empty-container">
      <div className="empty-graphic-card">
        <div className="empty-illustration-box">
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="68" height="68" rx="16" fill="url(#ill-card-bg)" />
            <rect x="14" y="22" width="40" height="28" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <path
              d="M26 22V17C26 12.58 29.58 9 34 9C38.42 9 42 12.58 42 17V22"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="34" cy="34" r="3" fill="#2563eb" />
            <path d="M34 37V42" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="ill-card-bg" x1="0" y1="0" x2="68" y2="68" gradientUnits="userSpaceOnUse">
                <stop stopColor="#eff6ff" />
                <stop offset="1" stopColor="#dbeafe" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h3>Enter a password to get started</h3>
        <p>
          The analyzer will evaluate strength, identify patterns, check dictionary and breach exposure, and provide actionable guidance.
        </p>

        {/* 4-Step Process Bar matching Reference 2 */}
        <div className="analysis-process-steps" aria-label="Analysis evaluation stages">
          <div className="process-step">
            <span className="step-icon-circle"><Search size={14} /></span>
            <strong>Analyze</strong>
            <small>Strength & entropy</small>
          </div>
          <span className="step-arrow">→</span>
          <div className="process-step">
            <span className="step-icon-circle"><ShieldCheck size={14} /></span>
            <strong>Check</strong>
            <small>Blocklists & breaches</small>
          </div>
          <span className="step-arrow">→</span>
          <div className="process-step">
            <span className="step-icon-circle"><Layers size={14} /></span>
            <strong>Detect</strong>
            <small>Patterns & structure</small>
          </div>
          <span className="step-arrow">→</span>
          <div className="process-step">
            <span className="step-icon-circle"><Sparkles size={14} /></span>
            <strong>Recommend</strong>
            <small>Improvements</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrengthPanel({
  result,
  blocklist,
  hibp,
  hibpBusy,
  onCheckHibp,
  error,
}: {
  readonly result: AnalysisResult | null;
  readonly blocklist: BlocklistResult | null;
  readonly hibp: HibpCheckResult | null;
  readonly hibpBusy: boolean;
  readonly onCheckHibp: () => void;
  readonly error: string;
}) {
  if (error) {
    return (
      <div className="inline-alert error-alert" role="alert">
        <AlertTriangle size={16} />
        {error}
      </div>
    );
  }
  if (!result) {
    return <AnalysisEmptyState />;
  }

  const strength = ["Very weak", "Weak", "Moderate", "Strong", "Very strong"][result.score] ?? "Unknown";

  return (
    <section className="detail-card strength-panel" aria-live="polite">
      <div className="result-heading">
        <div>
          <span className="eyebrow">PATTERN-AWARE ESTIMATE</span>
          <h2>
            {strength} <span className="subtle-text">· {result.score}/4</span>
          </h2>
        </div>
        <span className={`status-tag strength-tag-${result.score}`}>{result.band.replaceAll("_", " ")}</span>
      </div>

      <div className="score-track" role="img" aria-label={`Estimated strength score ${result.score} out of 4`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index <= result.score ? "score-segment is-filled" : "score-segment"} />
        ))}
      </div>

      <p className="guess-estimate">
        Estimated guesses <strong>{result.estimatedGuesses.toLocaleString()}</strong>
        <span>model output, not measured attack time</span>
      </p>

      {/* Local Blocklist Alert */}
      {blocklist?.state === "found_in_local_list" && (
        <div className="inline-alert error-alert" role="alert">
          <ShieldAlert size={18} />
          <div>
            <strong>Known Common Password Blocklist Match</strong>
            <p>{blocklist.message}</p>
          </div>
        </div>
      )}

      {/* HIBP Exposure Status Card */}
      <div className="exposure-check-box">
        <div className="exposure-check-header">
          <Globe size={15} />
          <strong>Breach Exposure Check (HIBP k-Anonymity)</strong>
        </div>
        {hibp ? (
          <div
            className={`hibp-status-row ${
              hibp.state === "found_in_provider_corpus"
                ? "is-breached"
                : hibp.state === "not_found_in_provider_corpus"
                  ? "is-safe"
                  : "is-unavailable"
            }`}
          >
            {hibp.state === "found_in_provider_corpus" && (
              <>
                <AlertTriangle size={16} />
                <span>
                  <strong>Exposed in Known Breaches:</strong> Appeared {hibp.breachCount?.toLocaleString() ?? "multiple"} times in recorded breach corpora (prefix: {hibp.prefixSent}).
                </span>
              </>
            )}
            {hibp.state === "not_found_in_provider_corpus" && (
              <>
                <Check size={16} />
                <span>
                  <strong>Not Found in Breach Database:</strong> No matches found via k-anonymity query (prefix: {hibp.prefixSent}).
                </span>
              </>
            )}
            {hibp.state === "unavailable" && (
              <>
                <AlertTriangle size={16} />
                <span><strong>HIBP Service Unavailable:</strong> {hibp.message}</span>
              </>
            )}
          </div>
        ) : (
          <div className="hibp-action-row">
            <p className="muted-copy">
              Opt-in: Checks Have I Been Pwned via k-anonymity. Sends only the first 5 hexadecimal characters of SHA-1 with padding over HTTPS. Full password is never transmitted.
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={onCheckHibp}
              disabled={hibpBusy}
            >
              {hibpBusy ? "Querying HIBP (5-hex prefix)…" : "Check Breach Status"}
              <Globe size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="result-columns">
        <div>
          <h3>Detected patterns</h3>
          {result.findings.length ? (
            <ul className="finding-list">
              {result.findings.map((finding) => (
                <li key={finding.id}>
                  <span className={`finding-mark ${finding.severity}`} />
                  <span>
                    <strong>{finding.pattern}</strong>
                    <small>{finding.explanation}</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted-copy">No familiar patterns were identified in the loaded dictionaries. This is not proof of safety.</p>
          )}
        </div>
        <div>
          <h3>Suggested improvements</h3>
          {result.suggestions.length ? (
            <ul className="suggestion-list">
              {result.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p className="muted-copy">The model has no specific suggestion for this sample.</p>
          )}
        </div>
      </div>
      <div className="result-foot">
        {result.estimator.name} {result.estimator.version} · {result.limitations[0]}
      </div>
    </section>
  );
}

export function AnalysisPage({
  password,
  onPasswordChange,
  visible,
  onToggleVisible,
  onClear,
}: {
  readonly password: string;
  readonly onPasswordChange: (value: string) => void;
  readonly visible: boolean;
  readonly onToggleVisible: () => void;
  readonly onClear: () => void;
}) {
  const [hibpResult, setHibpResult] = useState<HibpCheckResult | null>(null);
  const [hibpBusy, setHibpBusy] = useState(false);

  const analysisState = useMemo(() => {
    if (!password) return { result: null, blocklist: null, error: "" };
    try {
      const result = analyzePassword(password);
      const blocklist = checkLocalBlocklist(password);
      return { result, blocklist, error: "" };
    } catch (cause) {
      return {
        result: null,
        blocklist: null,
        error: cause instanceof Error ? cause.message : "Analysis could not be completed.",
      };
    }
  }, [password]);

  async function handleCheckHibp() {
    if (!password || hibpBusy) return;
    setHibpBusy(true);
    try {
      const res = await checkExposureHibp(password, { userConsented: true });
      setHibpResult(res);
    } catch {
      setHibpResult({
        state: "unavailable",
        message: "HIBP request failed or service unreachable.",
      });
    } finally {
      setHibpBusy(false);
    }
  }

  function handleClearAll() {
    setHibpResult(null);
    setHibpBusy(false);
    onClear();
  }

  const codePoints = Array.from(password).length;

  return (
    <div className="page-container">
      {/* Breadcrumb & Header matching Reference 2 */}
      <div className="page-breadcrumb-header">
        <div className="breadcrumb-line">
          <span>Laboratory</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Password Analysis</span>
        </div>
        <div className="header-titles">
          <h1>Password Analysis</h1>
          <p>
            Inspect guessability patterns, dictionary presence and breach exposure. Analysis runs locally in your browser for full privacy.
          </p>
        </div>
      </div>

      <div className="analysis-two-col-layout">
        {/* Left Column: Form & Inspection */}
        <div className="analysis-left-col">
          <section className="work-card candidate-card">
            <div className="card-title-row">
              <div className="title-with-icon">
                <Search size={16} className="title-icon-blue" />
                <h2>Candidate Inspection</h2>
              </div>
              <span className="privacy-status-badge">
                <Lock size={12} /> Browser-Only (Private)
              </span>
            </div>

            <label className="field-label" htmlFor="analysis-candidate">
              Password candidate
            </label>
            <div className="password-field candidate-field">
              <input
                id="analysis-candidate"
                type={visible ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  onPasswordChange(event.currentTarget.value);
                  setHibpResult(null);
                }}
                placeholder="Enter a password to analyze..."
                autoComplete="off"
                spellCheck={false}
                maxLength={512}
                aria-describedby="analysis-privacy"
              />
              <button
                className="field-icon-button"
                type="button"
                onClick={onToggleVisible}
                aria-label={visible ? "Mask example" : "Show example"}
              >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {password && (
                <button
                  className="field-icon-button"
                  type="button"
                  onClick={handleClearAll}
                  aria-label="Clear example"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            <div className="input-meta">
              <span>{codePoints} / 256 characters</span>
              <span id="analysis-privacy">Analysis executes locally in this browser tab.</span>
            </div>

            {/* Compact Your Privacy Notice */}
            <div className="compact-privacy-box">
              <Shield size={16} className="privacy-shield-icon" />
              <div>
                <strong>Your Privacy</strong>
                <p>Password analysis runs entirely in this browser. Your password is never sent to any server or stored on disk.</p>
              </div>
            </div>
          </section>

          {/* 3-Tile 'How the analysis works' Card matching Reference 2 */}
          <section className="work-card analysis-method-card">
            <div className="card-title-row">
              <div className="title-with-icon">
                <Layers size={16} className="title-icon-blue" />
                <h2>How the analysis works</h2>
              </div>
            </div>
            <div className="method-three-tiles">
              <div className="method-tile">
                <div className="method-tile-icon-box">
                  <Zap size={15} />
                </div>
                <strong>Pattern Matching</strong>
                <p>Detects dictionary words, repeats, sequences, keyboard paths and common substitutions.</p>
              </div>
              <div className="method-tile">
                <div className="method-tile-icon-box">
                  <Database size={15} />
                </div>
                <strong>Local Blocklist</strong>
                <p>Checks against a curated list of common passwords (~1,000 entries).</p>
              </div>
              <div className="method-tile">
                <div className="method-tile-icon-box">
                  <Sliders size={15} />
                </div>
                <strong>Model & Limits</strong>
                <p>Powered by zxcvbn-ts with industry-aligned heuristics and configurable limits.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Dynamic Strength Panel or Visual Process Empty State */}
        <div className="analysis-right-col">
          <StrengthPanel
            result={analysisState.result}
            blocklist={analysisState.blocklist}
            hibp={hibpResult}
            hibpBusy={hibpBusy}
            onCheckHibp={() => void handleCheckHibp()}
            error={analysisState.error}
          />
        </div>
      </div>
    </div>
  );
}

const POLICIES: readonly { id: PolicyId; label: string; standard: string }[] = [
  { id: "modern_single_factor", label: "Modern single-factor (15+)", standard: "NIST SP 800-63B-4 §5.1.1.2" },
  { id: "modern_mfa", label: "Modern MFA factor (8+)", standard: "NIST SP 800-63B-4 §5.1.1.2" },
  { id: "educational_traditional", label: "Traditional Composition (Legacy)", standard: "Legacy Teaching Profile" },
  { id: "custom_service", label: "Service Compatibility (8–64 chars)", standard: "Practical Interoperability" },
];

function getPolicyComparison(password: string): PolicyResult[] {
  return POLICIES.map((policy) => evaluatePolicy(password, policy.id));
}

export function PolicyPage({
  password,
  onPasswordChange,
  policyId,
  onPolicyChange,
  onEvent,
  onSafeResult,
}: {
  readonly password: string;
  readonly onPasswordChange: (value: string) => void;
  readonly policyId: PolicyId;
  readonly onPolicyChange: (value: PolicyId) => void;
  readonly onEvent: (level: LabEvent["level"], message: string) => void;
  readonly onSafeResult: (result: SafeResultInput) => void;
}) {
  const comparisonState = useMemo(() => {
    if (!password) return { values: [] as PolicyResult[], error: "" };
    try {
      return { values: getPolicyComparison(password), error: "" };
    } catch (cause) {
      return {
        values: [] as PolicyResult[],
        error: cause instanceof Error ? cause.message : "Policy comparison failed.",
      };
    }
  }, [password]);

  const comparison = comparisonState.values;
  const selectedPolicy = comparison.find((item) => item.policyId === policyId) ?? null;

  function recordComparison() {
    if (!comparison.length) return;
    onEvent("success", "Evaluated password candidate against 4 local policy profiles.");
    onSafeResult({
      category: "policy",
      title: "Policy comparison",
      outcome: comparison.map((item) => `${item.label}: ${item.overall}`).join("; "),
    });
  }

  return (
    <>
      <PageHeading
        eyebrow="INDEPENDENT COMPLIANCE CHECKS"
        title="Policy Checker"
        description="Evaluate concrete organizational and standard rules separately from guessability estimates. Modern standards emphasize length over character composition."
      />
      <div className="feature-stack">
        <section className="work-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">CANDIDATE EVALUATION</span>
              <h2>Evaluate policy rules</h2>
            </div>
            <span className="policy-separation">
              <ShieldCheck size={14} /> Policy compliance ≠ strength
            </span>
          </div>
          <PasswordField id="policy-candidate" label="Password candidate" value={password} onChange={onPasswordChange} />
          <div className="field-row policy-select-row">
            <label className="field-label" htmlFor="policy-profile">
              Selected policy profile
              <select
                id="policy-profile"
                value={policyId}
                onChange={(event) => onPolicyChange(event.currentTarget.value as PolicyId)}
              >
                {POLICIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} ({item.standard})
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="primary-button" onClick={recordComparison} disabled={!password}>
              Record comparison summary
            </button>
          </div>
          {selectedPolicy && <PolicyDetails result={selectedPolicy} />}
          {comparisonState.error && (
            <div className="inline-alert error-alert" role="alert">
              <AlertTriangle size={15} />
              {comparisonState.error}
            </div>
          )}
          {!password && (
            <div className="empty-state compact-empty">
              <ShieldCheck size={22} />
              <strong>Enter a password candidate above to check policy compliance.</strong>
            </div>
          )}
        </section>

        <section className="work-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">LIVE LOCAL EVALUATION</span>
              <h2>Compare policy outcomes</h2>
            </div>
            <span className="measurement-label">Computed client-side by @psa/core</span>
          </div>
          {comparison.length ? (
            <div className="table-scroll">
              <table className="data-table policy-table">
                <caption>Current candidate evaluated against all supported standards</caption>
                <thead>
                  <tr>
                    <th scope="col">Policy Profile</th>
                    <th scope="col">Standard Ref</th>
                    <th scope="col">Min Length</th>
                    <th scope="col">Character Classes</th>
                    <th scope="col">Blocklist Screening</th>
                    <th scope="col">Overall Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((policy) => {
                    const standard = POLICIES.find((p) => p.id === policy.policyId)?.standard ?? "";
                    return (
                      <tr key={policy.policyId}>
                        <th scope="row">{policy.label}</th>
                        <td><code>{standard}</code></td>
                        <td><StateBadge state={policy.checks.find((item) => item.id === "minimum-length")?.state ?? "not_checked"} /></td>
                        <td><StateBadge state={policy.checks.find((item) => item.id === "composition")?.state ?? "not_checked"} /></td>
                        <td><StateBadge state={policy.checks.find((item) => item.id === "whole-value-blocklist")?.state ?? "not_checked"} /></td>
                        <td><StateBadge state={policy.overall === "compliant" ? "pass" : policy.overall === "non_compliant" ? "fail" : "not_checked"} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state compact-empty">
              <KeyRound size={21} />
              <strong>Policy comparison table will appear here once a candidate is entered.</strong>
            </div>
          )}
          <div className="policy-footnotes">
            <p><strong>NIST SP 800-63B-4 Standard:</strong> Requires at least 15 characters for single-factor passwords, or 8 characters when paired with an independent MFA factor. Modern standards explicitly prohibit arbitrary composition rules because they encourage predictable patterns.</p>
            <p><strong>Periodic Expiration:</strong> NIST recommends against forced periodic password rotation unless an actual compromise is detected.</p>
          </div>
        </section>
      </div>
    </>
  );
}

function StateBadge({ state }: { readonly state: string }) {
  return (
    <span className={`table-state state-${state.replaceAll("_", "-")}`}>
      <span />
      {state.replaceAll("_", " ")}
    </span>
  );
}

function PolicyDetails({ result }: { readonly result: PolicyResult }) {
  return (
    <div className="policy-details" aria-live="polite">
      <div className="result-heading">
        <div>
          <span className="eyebrow">SELECTED PROFILE</span>
          <h3>{result.label}</h3>
        </div>
        <StateBadge state={result.overall} />
      </div>
      <ul className="check-results">
        {result.checks.map((check) => (
          <li key={check.id}>
            <StateBadge state={check.state} />
            <div>
              <strong>{check.label}</strong>
              <p>{check.rationale}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="result-foot">{result.disclaimer}</p>
    </div>
  );
}

export function ReusePage({
  onEvent,
  onSafeResult,
}: {
  readonly onEvent: (level: LabEvent["level"], message: string) => void;
  readonly onSafeResult: (result: SafeResultInput) => void;
}) {
  const [samples, setSamples] = useState<string[]>(["", "", ""]);
  const [result, setResult] = useState<ReuseResult | null>(null);
  const [error, setError] = useState("");
  const visibleEntries = samples.map((value, index) => ({ value, index })).filter((item) => item.value.length > 0);

  function update(index: number, value: string) {
    setSamples((current) => current.map((item, currentIndex) => (currentIndex === index ? value : item)));
    setResult(null);
  }

  function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const checked = analyzeReuse(visibleEntries.map((item) => item.value));
      setResult(checked);
      setError("");
      onEvent("success", `Compared ${visibleEntries.length} candidates in browser memory.`);
      onSafeResult({
        category: "reuse",
        title: "Reuse comparison",
        outcome: `${checked.exactDuplicateGroups.length} exact groups; ${checked.similarPairs.length} similar pairs`,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reuse comparison could not be completed.");
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="IN-MEMORY SAMPLE SET · ZERO PERSISTENCE"
        title="Reuse Laboratory"
        description="Compare candidate passwords in browser memory for exact duplicates and predictable variations. Data is never persisted or transmitted."
      />
      <div className="feature-stack">
        <section className="work-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">SHORT-LIVED INPUT</span>
              <h2>Compare made-up examples</h2>
            </div>
            <span className="local-only-badge">
              <ShieldCheck size={13} /> Browser memory only
            </span>
          </div>
          <form onSubmit={compare}>
            <div className="reuse-input-grid">
              {samples.map((sample, index) => (
                <PasswordField
                  key={index}
                  id={`reuse-${index}`}
                  label={`Example ${index + 1}`}
                  value={sample}
                  onChange={(value) => update(index, value)}
                  maxLength={128}
                />
              ))}
            </div>
            <div className="form-actions">
              <span className="measurement-label">
                {visibleEntries.length} non-empty value(s) · {samples.length} input(s) · maximum 20
              </span>
              <div>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={samples.length >= 20}
                  onClick={() => setSamples((current) => [...current, ""])}
                >
                  Add candidate
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setSamples(["", "", ""]);
                    setResult(null);
                    setError("");
                  }}
                >
                  Clear all
                </button>
                <button className="primary-button" type="submit" disabled={!visibleEntries.length}>
                  Compare examples
                </button>
              </div>
            </div>
          </form>
          {error && (
            <div className="inline-alert error-alert" role="alert">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}
        </section>

        <section className="work-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">EXPLAINABLE HEURISTIC</span>
              <h2>Comparison results</h2>
            </div>
          </div>
          {result ? (
            <div className="reuse-results" aria-live="polite">
              <div className="reuse-summary">
                <div>
                  <strong>{result.exactDuplicateGroups.length}</strong>
                  <span>exact duplicate group(s)</span>
                </div>
                <div>
                  <strong>{result.similarPairs.length}</strong>
                  <span>similar pair(s)</span>
                </div>
                <div>
                  <strong>{visibleEntries.length}</strong>
                  <span>sample(s) checked</span>
                </div>
              </div>
              <div className="comparison-list">
                {result.exactDuplicateGroups.map((group) => (
                  <div className="comparison-row exact-row" key={group.join("-")}>
                    <span className="comparison-type">EXACT</span>
                    <div>
                      <strong>Examples {group.map((index) => (visibleEntries[index]?.index ?? index) + 1).join(", ")}</strong>
                      <p>These values are identical after unicode normalization.</p>
                    </div>
                  </div>
                ))}
                {result.similarPairs.map((pair) => (
                  <div className="comparison-row similar-row" key={`${pair.firstIndex}-${pair.secondIndex}`}>
                    <span className="comparison-type">SIMILAR</span>
                    <div>
                      <strong>
                        Examples {(visibleEntries[pair.firstIndex]?.index ?? pair.firstIndex) + 1} and{" "}
                        {(visibleEntries[pair.secondIndex]?.index ?? pair.secondIndex) + 1} · {Math.round(pair.similarity * 100)}%
                      </strong>
                      <p>{pair.explanation}</p>
                    </div>
                  </div>
                ))}
                {!result.exactDuplicateGroups.length && !result.similarPairs.length && (
                  <p className="muted-copy">No exact duplicates or pairs above the configured similarity threshold were identified.</p>
                )}
              </div>
              <div className="result-foot">
                NFKC normalization, lowercase comparison, code-point Levenshtein similarity; threshold {Math.round(result.limits.threshold * 100)}%, minimum 6 code points. Values never leave memory.
              </div>
            </div>
          ) : (
            <div className="empty-state compact-empty">
              <RefreshCw size={21} aria-hidden="true" />
              <strong>Run a comparison to see duplicates and similarity explanations.</strong>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export function GeneratorPage({
  onEvent,
  onSafeResult,
  onSendToAnalysis,
}: {
  readonly onEvent: (level: LabEvent["level"], message: string) => void;
  readonly onSafeResult: (result: SafeResultInput) => void;
  readonly onSendToAnalysis?: (password: string) => void;
}) {
  const [mode, setMode] = useState<"random" | "passphrase">("random");
  const [length, setLength] = useState(DEFAULT_RANDOM_LENGTH);
  const [wordCount, setWordCount] = useState(DEFAULT_PASSPHRASE_WORD_COUNT);
  const [separator, setSeparator] = useState("-");
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [sets, setSets] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [generated, setGenerated] = useState<ReturnType<typeof generatePassword> | null>(null);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<AnalysisResult | null>(null);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const setOptionValue = (key: keyof typeof sets, value: boolean) => {
    setSets((current) => ({ ...current, [key]: value }));
    setGenerated(null);
    setGeneratedAnalysis(null);
  };

  function generate() {
    try {
      const output =
        mode === "random"
          ? generatePassword({ mode, length, ...sets, excludeAmbiguous })
          : generatePassword({ mode, wordCount, separator });
      setGenerated(output);
      setGeneratedAnalysis(analyzePassword(output.password));
      setVisible(false);
      setMessage("");
      setError("");
      onEvent("success", `Generated a local ${mode === "random" ? "random password" : "passphrase"} with CSPRNG; value remains in page memory.`);
      onSafeResult({
        category: "generation",
        title: mode === "random" ? "Random password generated" : "Passphrase generated",
        outcome: `${output.mode}; ${output.theoreticalSelectionBits.toFixed(1)} bits of theoretical selection entropy`,
      });
    } catch (cause) {
      setGenerated(null);
      setGeneratedAnalysis(null);
      setError(cause instanceof Error ? cause.message : "Secure generation could not be completed.");
    }
  }

  async function copyGenerated() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.password);
      setMessage("Generated value copied to clipboard. Clear clipboard history when finished.");
      setError("");
    } catch {
      setMessage("");
      setError("Clipboard access unavailable. You can reveal and copy the value manually.");
    }
  }

  function handleSendToAnalysis() {
    if (!generated || !onSendToAnalysis) return;
    onSendToAnalysis(generated.password);
  }

  return (
    <>
      <PageHeading
        eyebrow="WEB CRYPTO CSPRNG · LOCAL GENERATION"
        title="Password Generator"
        description="Generate cryptographically secure passwords and passphrases in browser memory using rejection sampling. Ephemeral, zero persistence, zero telemetry."
      />

      <div className="generator-layout">
        <section className="work-card generator-controls">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">GENERATION PROFILE</span>
              <h2>Configure output</h2>
            </div>
            <Sparkles size={18} className="accent-icon" />
          </div>

          <fieldset className="segmented-control">
            <legend>Generation mode</legend>
            <label className={mode === "random" ? "selected" : ""}>
              <input
                type="radio"
                name="generation-mode"
                value="random"
                checked={mode === "random"}
                onChange={() => {
                  setMode("random");
                  setGenerated(null);
                  setGeneratedAnalysis(null);
                }}
              />
              Random password
            </label>
            <label className={mode === "passphrase" ? "selected" : ""}>
              <input
                type="radio"
                name="generation-mode"
                value="passphrase"
                checked={mode === "passphrase"}
                onChange={() => {
                  setMode("passphrase");
                  setGenerated(null);
                  setGeneratedAnalysis(null);
                }}
              />
              Passphrase
            </label>
          </fieldset>

          {mode === "random" ? (
            <>
              <label className="field-label" htmlFor="random-length">
                Length <strong>{length} characters</strong>
                <input
                  id="random-length"
                  type="range"
                  min={8}
                  max={128}
                  value={length}
                  onChange={(event) => {
                    setLength(event.currentTarget.valueAsNumber);
                    setGenerated(null);
                    setGeneratedAnalysis(null);
                  }}
                />
                <span className="field-hint">Configurable range: 8–128 characters. Default: 20.</span>
              </label>

              <fieldset className="checkbox-fieldset">
                <legend>Character pool</legend>
                {(["lowercase", "uppercase", "numbers", "symbols"] as const).map((key) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={sets[key]}
                      onChange={(event) => setOptionValue(key, event.currentTarget.checked)}
                    />
                    {key[0]?.toUpperCase()}{key.slice(1)}
                  </label>
                ))}
                <label>
                  <input
                    type="checkbox"
                    checked={excludeAmbiguous}
                    onChange={(event) => {
                      setExcludeAmbiguous(event.currentTarget.checked);
                      setGenerated(null);
                      setGeneratedAnalysis(null);
                    }}
                  />
                  Exclude ambiguous characters (i, l, 1, L, o, 0, O)
                </label>
                <p className="field-hint">
                  Rejection sampling is applied to guarantee zero modulo bias across the combined alphabet.
                </p>
              </fieldset>
            </>
          ) : (
            <>
              <label className="field-label" htmlFor="phrase-count">
                Word count <strong>{wordCount} words</strong>
                <input
                  id="phrase-count"
                  type="range"
                  min={4}
                  max={20}
                  value={wordCount}
                  onChange={(event) => {
                    setWordCount(event.currentTarget.valueAsNumber);
                    setGenerated(null);
                    setGeneratedAnalysis(null);
                  }}
                />
                <span className="field-hint">
                  Uniform independent selections from the EFF Large Wordlist ({PASSPHRASE_WORD_COUNT} distinct entries).
                </span>
              </label>

              <label className="field-label" htmlFor="passphrase-separator">
                Word Separator
                <select
                  id="passphrase-separator"
                  value={separator}
                  onChange={(e) => {
                    setSeparator(e.currentTarget.value);
                    setGenerated(null);
                    setGeneratedAnalysis(null);
                  }}
                >
                  <option value="-">Hyphen (-)</option>
                  <option value=" ">Space ( )</option>
                  <option value=".">Period (.)</option>
                  <option value="_">Underscore (_)</option>
                </select>
              </label>

              <div className="privacy-callout">
                <ShieldCheck size={16} />
                <p>
                  Words are sampled with replacement using unbiased 16-bit rejection sampling over the 7,776-entry EFF list (~12.92 bits per word). 6 words provide ~77.5 bits of theoretical selection entropy.
                </p>
              </div>
            </>
          )}

          <button type="button" className="primary-button generate-button" onClick={generate}>
            <RefreshCw size={16} />
            Generate securely
          </button>
        </section>

        <section className="work-card generated-output-card">
          <div className="card-title-row">
            <div>
              <span className="eyebrow">EPHEMERAL OUTPUT</span>
              <h2>Generated value</h2>
            </div>
            {generated && (
              <button
                type="button"
                className="icon-action inline-icon-action"
                onClick={() => {
                  setGenerated(null);
                  setGeneratedAnalysis(null);
                  setMessage("");
                  setError("");
                }}
                aria-label="Clear generated value"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {generated ? (
            <>
              <div className="generated-value-row">
                <output className={`generated-value ${visible ? "is-visible" : ""}`} aria-label="Generated password">
                  {visible ? generated.password : "•".repeat(Math.min(48, generated.password.length))}
                </output>
                <button
                  type="button"
                  className="field-icon-button"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? "Mask generated value" : "Show generated value"}
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button type="button" className="secondary-button copy-button" onClick={copyGenerated}>
                  <Copy size={15} />
                  Copy
                </button>
              </div>

              <div className="generated-facts">
                <div>
                  <span>Theoretical selection entropy</span>
                  <strong>{generated.theoreticalSelectionBits.toFixed(1)} bits</strong>
                </div>
                <div>
                  <span>Output length</span>
                  <strong>{Array.from(generated.password).length} code points</strong>
                </div>
                <div>
                  <span>Estimator score</span>
                  <strong>{generatedAnalysis?.score ?? "Unavailable"}/4</strong>
                </div>
              </div>

              {onSendToAnalysis && (
                <div className="send-to-analysis-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleSendToAnalysis}
                  >
                    Analyze with local estimator
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              <p className="result-foot">
                Source: {generated.source}. Theoretical entropy ({generated.theoreticalSelectionBits.toFixed(1)} bits) describes the generation search space, while pattern-aware score evaluates model-based guessability.
              </p>

              <div className="privacy-callout warning-callout">
                <AlertTriangle size={16} />
                <p>
                  Generated passwords exist exclusively in React state memory. Reloading or navigating away clears the secret immediately.
                </p>
              </div>

              {message && (
                <p className="success-message" role="status">
                  <Check size={15} />
                  {message}
                </p>
              )}
            </>
          ) : (
            <div className="empty-state generator-empty">
              <KeyRound size={24} aria-hidden="true" />
              <strong>No password generated yet</strong>
              <p>Select your desired parameters and generate a value. Uses Web Crypto CSPRNG with unbiased rejection sampling.</p>
            </div>
          )}

          {error && (
            <div className="inline-alert error-alert" role="alert">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          {/* Security Best Practices Guidance Card */}
          <div className="security-guidance-card">
            <div className="guidance-header">
              <Lock size={15} />
              <h3>Password Security Best Practices</h3>
            </div>
            <ul className="guidance-list">
              <li>
                <strong>Use a Password Manager:</strong> Store long, unique credentials in an encrypted manager so you only need to remember one master passphrase.
              </li>
              <li>
                <strong>Never Reuse Passwords:</strong> A breach at one service exposes all other services sharing the same credential.
              </li>
              <li>
                <strong>Enable Phishing-Resistant MFA:</strong> Use FIDO2/WebAuthn/Passkeys or authenticator apps to protect against credential stuffing and interception.
              </li>
              <li>
                <strong>Passphrase vs. Random:</strong> Use 6+ word passphrases for memorable master keys; use 20+ character random strings for password manager auto-fill.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
