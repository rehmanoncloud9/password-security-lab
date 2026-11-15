import { useMemo, useState, type FormEvent } from "react";
import {
  analyzePassword,
  analyzeReuse,
  evaluatePolicy,
  generatePassword,
  PASSPHRASE_WORD_COUNT,
  type AnalysisResult,
  type PolicyId,
  type PolicyResult,
  type ReuseResult,
} from "@psa/core";
import { AlertTriangle, Check, Copy, Eye, EyeOff, KeyRound, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeading } from "../components/PageHeading.js";
import type { LabEvent, SafeResultInput } from "../app/types.js";

function PasswordField({
  id,
  label,
  value,
  onChange,
  maxLength = 512,
  type = "password",
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly maxLength?: number;
  readonly type?: "password" | "text";
}) {
  const [visible, setVisible] = useState(type === "text");
  return <label className="field-label" htmlFor={id}>{label}
    <span className="password-field">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        autoComplete="off"
        spellCheck={false}
        maxLength={maxLength}
        aria-describedby={`${id}-privacy`}
      />
      <button className="field-icon-button" type="button" aria-label={visible ? "Mask value" : "Show value"} onClick={() => setVisible(!visible)}>
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </span>
    <small id={`${id}-privacy`} className="field-hint">Use a made-up example. This value remains in this browser page unless you separately submit it to a local lab operation.</small>
  </label>;
}

function StrengthPanel({ result, error }: { readonly result: AnalysisResult | null; readonly error: string }) {
  if (error) return <div className="inline-alert error-alert" role="alert"><AlertTriangle size={16} />{error}</div>;
  if (!result) return <div className="empty-state"><ShieldCheck size={23} /><strong>Enter a synthetic example</strong><p>The analyzer runs in this tab and does not send the value to the lab API.</p></div>;
  const strength = ["Very weak", "Weak", "Moderate", "Strong", "Very strong"][result.score] ?? "Unknown";
  return <section className="detail-card strength-panel" aria-live="polite">
    <div className="result-heading"><div><span className="eyebrow">PATTERN-AWARE ESTIMATE</span><h2>{strength} <span className="subtle-text">· {result.score}/4</span></h2></div><span className={`status-pill strength-${result.score}`}>{result.band.replaceAll("_", " ")}</span></div>
    <div className="score-track" role="img" aria-label={`Estimated strength score ${result.score} out of 4`}>
      {Array.from({ length: 5 }, (_, index) => <span key={index} className={index <= result.score ? "score-segment is-filled" : "score-segment"} />)}
    </div>
    <p className="guess-estimate">Estimated guesses <strong>{result.estimatedGuesses.toLocaleString()}</strong><span>model output, not measured attack time</span></p>
    <div className="result-columns">
      <div><h3>Detected patterns</h3>{result.findings.length ? <ul className="finding-list">{result.findings.map((finding) => <li key={finding.id}><span className={`finding-mark ${finding.severity}`} /><span><strong>{finding.pattern}</strong><small>{finding.explanation}</small></span></li>)}</ul> : <p className="muted-copy">No familiar patterns were identified in the loaded dictionaries. This is not proof of safety.</p>}</div>
      <div><h3>Suggested improvements</h3>{result.suggestions.length ? <ul className="suggestion-list">{result.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul> : <p className="muted-copy">The model has no specific suggestion for this sample.</p>}</div>
    </div>
    <div className="result-foot">{result.estimator.name} {result.estimator.version} · {result.limitations[0]}</div>
  </section>;
}

export function AnalysisPage({
  password,
  onPasswordChange,
  result,
  error,
  visible,
  onToggleVisible,
  onClear,
}: {
  readonly password: string;
  readonly onPasswordChange: (value: string) => void;
  readonly result: AnalysisResult | null;
  readonly error: string;
  readonly visible: boolean;
  readonly onToggleVisible: () => void;
  readonly onClear: () => void;
}) {
  const codePoints = Array.from(password).length;
  return <>
    <PageHeading eyebrow="BROWSER-LOCAL · NO NETWORK REQUEST" title="Password Analysis" description="Inspect guessability patterns and targeted suggestions for a synthetic example. Strength and policy compliance are separate evaluations." />
    <div className="analysis-workspace">
      <section className="work-card candidate-card">
        <div className="card-title-row"><div><span className="eyebrow">INPUT BUFFER</span><h2>Candidate inspection</h2></div><span className="local-only-badge"><ShieldCheck size={13} /> Local only</span></div>
        <label className="field-label" htmlFor="analysis-candidate">Made-up password example</label>
        <div className="password-field candidate-field">
          <input id="analysis-candidate" type={visible ? "text" : "password"} value={password} onChange={(event) => onPasswordChange(event.currentTarget.value)} autoComplete="off" spellCheck={false} maxLength={512} aria-describedby="analysis-privacy" />
          <button className="field-icon-button" type="button" onClick={onToggleVisible} aria-label={visible ? "Mask example" : "Show example"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          {password && <button className="field-icon-button" type="button" onClick={onClear} aria-label="Clear example"><Trash2 size={15} /></button>}
        </div>
        <div className="input-meta"><span>{codePoints} / 256 Unicode code points</span><span id="analysis-privacy">Analysis executes locally in this browser tab.</span></div>
        <div className="privacy-callout"><ShieldCheck size={16} /><p><strong>Do not enter a password you currently use.</strong> Analysis values are never submitted to the Python laboratory or external services.</p></div>
      </section>
      <StrengthPanel result={result} error={error} />
      <section className="work-card analysis-method-card">
        <div className="card-title-row"><div><span className="eyebrow">MODEL DETAILS</span><h2>How this estimate works</h2></div></div>
        <div className="method-grid"><div><strong>Pattern matching</strong><p>zxcvbn-ts weighs dictionary words, repeats, sequences, keyboard paths and common substitutions.</p></div><div><strong>Model limits</strong><p>Context outside the loaded English/common dictionaries, future breaches and private personal details are not represented.</p></div><div><strong>Separate measurements</strong><p>Hash and attack timings are actual laboratory measurements; they are shown only in their respective experiment screens.</p></div></div>
      </section>
    </div>
  </>;
}

const POLICIES: readonly { id: PolicyId; label: string }[] = [
  { id: "modern_single_factor", label: "Modern single-factor (15+)" },
  { id: "modern_mfa", label: "Modern MFA factor (8+)" },
  { id: "educational_traditional", label: "Traditional composition (education)" },
];

function getPolicyComparison(password: string): PolicyResult[] {
  return POLICIES.map((policy) => evaluatePolicy(password, policy.id));
}

export function PolicyPage({
  password,
  onPasswordChange,
  result,
  policyId,
  onPolicyChange,
  onEvent,
  onSafeResult,
}: {
  readonly password: string;
  readonly onPasswordChange: (value: string) => void;
  readonly result: PolicyResult | null;
  readonly policyId: PolicyId;
  readonly onPolicyChange: (value: PolicyId) => void;
  readonly onEvent: (level: LabEvent["level"], message: string) => void;
  readonly onSafeResult: (result: SafeResultInput) => void;
}) {
  const comparisonState = useMemo(() => {
    if (!password) return { values: [] as PolicyResult[], error: "" };
    try { return { values: getPolicyComparison(password), error: "" }; }
    catch (cause) {
      return { values: [] as PolicyResult[], error: cause instanceof Error ? cause.message : "Policy comparison failed." };
    }
  }, [password]);
  const comparison = comparisonState.values;
  const selectedPolicy = result ?? comparison.find((item) => item.policyId === policyId) ?? null;

  function recordComparison() {
    if (!comparison.length) return;
    onEvent("success", "Compared one synthetic candidate against three local policy profiles.");
    onSafeResult({ category: "policy", title: "Policy comparison", outcome: comparison.map((item) => `${item.label}: ${item.overall}`).join("; ") });
  }

  return <>
    <PageHeading eyebrow="INDEPENDENT COMPLIANCE CHECKS" title="Policy Checker" description="Evaluate concrete rules separately from the guessability estimate. Compare modern reference profiles with a clearly labeled legacy teaching example." />
    <div className="feature-stack">
      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">SYNTHETIC CANDIDATE</span><h2>Evaluate policy rules</h2></div><span className="policy-separation"><ShieldCheck size={14} /> Policy ≠ strength</span></div>
        <PasswordField id="policy-candidate" label="Made-up password example" value={password} onChange={onPasswordChange} />
        <div className="field-row policy-select-row"><label className="field-label" htmlFor="policy-profile">Selected policy profile<select id="policy-profile" value={policyId} onChange={(event) => onPolicyChange(event.currentTarget.value as PolicyId)}>{POLICIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <button type="button" className="primary-button" onClick={recordComparison} disabled={!password}>Record comparison</button>
        </div>
        {selectedPolicy && <PolicyDetails result={selectedPolicy} />}
        {comparisonState.error && <div className="inline-alert error-alert" role="alert"><AlertTriangle size={15} />{comparisonState.error}</div>}
        {!password && <div className="empty-state compact-empty"><ShieldCheck size={22} /><strong>Enter a synthetic example to check rules.</strong></div>}
      </section>
      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">LIVE LOCAL EVALUATION</span><h2>Compare policy outcomes</h2></div><span className="measurement-label">Computed by the TypeScript core</span></div>
        {comparison.length ? <div className="table-scroll"><table className="data-table policy-table"><caption>Current example evaluated against all supported presets</caption><thead><tr><th scope="col">Policy</th><th scope="col">Minimum length</th><th scope="col">Character classes</th><th scope="col">Whole-value dictionary</th><th scope="col">Overall</th></tr></thead><tbody>{comparison.map((policy) => <tr key={policy.policyId}><th scope="row">{policy.label}</th>{["minimum-length", "composition", "whole-value-blocklist"].map((id) => <td key={id}><StateBadge state={policy.checks.find((item) => item.id === id)?.state ?? "not_checked"} /></td>)}<td><StateBadge state={policy.overall === "compliant" ? "pass" : policy.overall === "non_compliant" ? "fail" : "not_checked"} /></td></tr>)}</tbody></table></div> : <div className="empty-state compact-empty"><KeyRound size={21} /><strong>Policy results appear here after a candidate is entered.</strong></div>}
        <div className="policy-footnotes"><p><strong>Modern profile:</strong> 15 code points for single-factor use; 8 where the password is one factor of MFA. No required upper/lower/digit/symbol mixture.</p><p><strong>Educational profile:</strong> demonstrates a legacy composition rule. It is not the modern recommended policy.</p><p><strong>Blocklist status:</strong> checks the complete value against bundled English/common dictionaries. It is not a breach corpus; unavailable checks are never shown as passing.</p></div>
      </section>
    </div>
  </>;
}

function StateBadge({ state }: { readonly state: string }) {
  return <span className={`table-state state-${state.replaceAll("_", "-")}`}><span />{state.replaceAll("_", " ")}</span>;
}

function PolicyDetails({ result }: { readonly result: PolicyResult }) {
  return <div className="policy-details" aria-live="polite"><div className="result-heading"><div><span className="eyebrow">SELECTED PROFILE</span><h3>{result.label}</h3></div><StateBadge state={result.overall} /></div><ul className="check-results">{result.checks.map((check) => <li key={check.id}><StateBadge state={check.state} /><div><strong>{check.label}</strong><p>{check.rationale}</p></div></li>)}</ul><p className="result-foot">{result.disclaimer}</p></div>;
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
    setSamples((current) => current.map((item, currentIndex) => currentIndex === index ? value : item));
    setResult(null);
  }

  function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const checked = analyzeReuse(visibleEntries.map((item) => item.value));
      setResult(checked);
      setError("");
      onEvent("success", `Compared ${visibleEntries.length} synthetic reuse samples in browser memory.`);
      onSafeResult({ category: "reuse", title: "Reuse comparison", outcome: `${checked.exactDuplicateGroups.length} exact groups; ${checked.similarPairs.length} similar pairs` });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reuse comparison could not be completed.");
    }
  }

  return <>
    <PageHeading eyebrow="IN-MEMORY SAMPLE SET · NO PERSISTENCE" title="Reuse Laboratory" description="Compare a small set of synthetic examples for exact duplicates and obvious predictable variations. This does not check passwords used on real websites." />
    <div className="feature-stack">
      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">SHORT-LIVED INPUT</span><h2>Compare made-up examples</h2></div><span className="local-only-badge"><ShieldCheck size={13} /> Browser only</span></div>
        <form onSubmit={compare}>
          <div className="reuse-input-grid">{samples.map((sample, index) => <PasswordField key={index} id={`reuse-${index}`} label={`Example ${index + 1}`} value={sample} onChange={(value) => update(index, value)} maxLength={128} />)}</div>
          <div className="form-actions"><span className="measurement-label">{visibleEntries.length} non-empty value(s) · {samples.length} input(s) · maximum 20</span><div><button className="secondary-button" type="button" disabled={samples.length >= 20} onClick={() => setSamples((current) => [...current, ""])}>Add sample</button><button className="secondary-button" type="button" onClick={() => { setSamples(["", "", ""]); setResult(null); setError(""); }}>Clear values</button><button className="primary-button" type="submit" disabled={!visibleEntries.length}>Compare examples</button></div></div>
        </form>
        {error && <div className="inline-alert error-alert" role="alert"><AlertTriangle size={15} />{error}</div>}
      </section>
      <section className="work-card">
        <div className="card-title-row"><div><span className="eyebrow">EXPLAINABLE HEURISTIC</span><h2>Comparison results</h2></div></div>
        {result ? <div className="reuse-results" aria-live="polite">
          <div className="reuse-summary"><div><strong>{result.exactDuplicateGroups.length}</strong><span>exact duplicate group(s)</span></div><div><strong>{result.similarPairs.length}</strong><span>similar pair(s)</span></div><div><strong>{visibleEntries.length}</strong><span>sample(s) checked</span></div></div>
          <div className="comparison-list">
            {result.exactDuplicateGroups.map((group) => <div className="comparison-row exact-row" key={group.join("-")}><span className="comparison-type">EXACT</span><div><strong>Examples {group.map((index) => (visibleEntries[index]?.index ?? index) + 1).join(", ")}</strong><p>These values are identical after the analyzer's documented normalization.</p></div></div>)}
            {result.similarPairs.map((pair) => <div className="comparison-row similar-row" key={`${pair.firstIndex}-${pair.secondIndex}`}><span className="comparison-type">SIMILAR</span><div><strong>Examples {(visibleEntries[pair.firstIndex]?.index ?? pair.firstIndex) + 1} and {(visibleEntries[pair.secondIndex]?.index ?? pair.secondIndex) + 1} · {Math.round(pair.similarity * 100)}%</strong><p>{pair.explanation}</p></div></div>)}
            {!result.exactDuplicateGroups.length && !result.similarPairs.length && <p className="muted-copy">No exact duplicates or pairs above the configured similarity threshold were identified.</p>}
          </div>
          <div className="result-foot">NFKC normalization, lowercase comparison, code-point Levenshtein similarity; threshold {Math.round(result.limits.threshold * 100)}%, minimum 6 code points. False positives are possible. Values are not returned by the core result.</div>
        </div> : <div className="empty-state compact-empty"><RepeatIcon /><strong>Run a comparison to see pairs and explanations.</strong></div>}
      </section>
    </div>
  </>;
}

function RepeatIcon() { return <RefreshCw size={21} aria-hidden="true" />; }

export function GeneratorPage({
  onEvent,
  onSafeResult,
}: {
  readonly onEvent: (level: LabEvent["level"], message: string) => void;
  readonly onSafeResult: (result: SafeResultInput) => void;
}) {
  const [mode, setMode] = useState<"random" | "passphrase">("random");
  const [length, setLength] = useState(24);
  const [wordCount, setWordCount] = useState(12);
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
      const output = mode === "random"
        ? generatePassword({ mode, length, ...sets, excludeAmbiguous })
        : generatePassword({ mode, wordCount, separator: "-" });
      setGenerated(output);
      setGeneratedAnalysis(analyzePassword(output.password));
      setVisible(false);
      setMessage("");
      setError("");
      onEvent("success", `Generated a local ${mode === "random" ? "random password" : "passphrase"}; value remains in page memory.`);
      onSafeResult({ category: "generation", title: mode === "random" ? "Random password generated" : "Passphrase generated", outcome: `${output.mode}; ${output.theoreticalSelectionBits.toFixed(1)} theoretical selection bits` });
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
      setMessage("Generated value copied to the clipboard. Clear the clipboard when you are finished.");
      setError("");
    } catch {
      setMessage("");
      setError("Clipboard access is unavailable. You can select and copy the shown value manually.");
    }
  }

  return <>
    <PageHeading eyebrow="WEB CRYPTO · LOCAL GENERATION" title="Password Generator" description="Generate a random password or passphrase using the browser's cryptographically secure random source. The value is never saved automatically." />
    <div className="generator-layout">
      <section className="work-card generator-controls">
        <div className="card-title-row"><div><span className="eyebrow">GENERATION PROFILE</span><h2>Configure output</h2></div><KeyRound size={19} className="accent-icon" /></div>
        <fieldset className="segmented-control"><legend>Generation mode</legend><label className={mode === "random" ? "selected" : ""}><input type="radio" name="generation-mode" value="random" checked={mode === "random"} onChange={() => { setMode("random"); setGenerated(null); setGeneratedAnalysis(null); }} />Random password</label><label className={mode === "passphrase" ? "selected" : ""}><input type="radio" name="generation-mode" value="passphrase" checked={mode === "passphrase"} onChange={() => { setMode("passphrase"); setGenerated(null); setGeneratedAnalysis(null); }} />Passphrase</label></fieldset>
        {mode === "random" ? <>
          <label className="field-label" htmlFor="random-length">Length <strong>{length} characters</strong><input id="random-length" type="range" min={8} max={128} value={length} onChange={(event) => { setLength(event.currentTarget.valueAsNumber); setGenerated(null); setGeneratedAnalysis(null); }} /><span className="field-hint">Allowed range: 8–128 ASCII characters.</span></label>
          <fieldset className="checkbox-fieldset"><legend>Character pool</legend>{(["lowercase", "uppercase", "numbers", "symbols"] as const).map((key) => <label key={key}><input type="checkbox" checked={sets[key]} onChange={(event) => setOptionValue(key, event.currentTarget.checked)} />{key[0]?.toUpperCase()}{key.slice(1)}</label>)}<label><input type="checkbox" checked={excludeAmbiguous} onChange={(event) => { setExcludeAmbiguous(event.currentTarget.checked); setGenerated(null); setGeneratedAnalysis(null); }} />Exclude ambiguous characters (i, l, 1, o, 0)</label><p className="field-hint">Each selected set joins one uniform alphabet. At shorter lengths, a generated value may not contain every selected character type.</p></fieldset>
        </> : <>
          <label className="field-label" htmlFor="phrase-count">Word count <strong>{wordCount} words</strong><input id="phrase-count" type="range" min={4} max={20} value={wordCount} onChange={(event) => { setWordCount(event.currentTarget.valueAsNumber); setGenerated(null); setGeneratedAnalysis(null); }} /><span className="field-hint">Uniform independent selections with replacement from a local {PASSPHRASE_WORD_COUNT}-word educational list.</span></label>
          <div className="privacy-callout"><ShieldCheck size={16} /><p>The list is a small locally curated educational set, not a standardized Diceware list. The displayed entropy is theoretical selection entropy, not the analyzer's guessability estimate.</p></div>
        </>}
        <button type="button" className="primary-button generate-button" onClick={generate}><RefreshCw size={16} />Generate securely</button>
      </section>
      <section className="work-card generated-output-card">
        <div className="card-title-row"><div><span className="eyebrow">EPHEMERAL OUTPUT</span><h2>Generated value</h2></div>{generated && <button type="button" className="icon-action inline-icon-action" onClick={() => { setGenerated(null); setGeneratedAnalysis(null); setMessage(""); setError(""); }} aria-label="Clear generated value"><Trash2 size={16} /></button>}</div>
        {generated ? <>
          <div className="generated-value-row"><output className={`generated-value ${visible ? "is-visible" : ""}`} aria-label="Generated synthetic password">{visible ? generated.password : "•".repeat(Math.min(48, generated.password.length))}</output><button type="button" className="field-icon-button" onClick={() => setVisible(!visible)} aria-label={visible ? "Mask generated value" : "Show generated value"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button><button type="button" className="secondary-button copy-button" onClick={copyGenerated}><Copy size={15} />Copy</button></div>
          <div className="generated-facts"><div><span>Theoretical selection entropy</span><strong>{generated.theoreticalSelectionBits.toFixed(1)} bits</strong></div><div><span>Output length</span><strong>{Array.from(generated.password).length} code points</strong></div><div><span>Estimator score</span><strong>{generatedAnalysis?.score ?? "Unavailable"}/4</strong></div></div>
          <p className="result-foot">{generated.source}. Pattern-aware estimate: {generatedAnalysis?.band.replaceAll("_", " ") ?? "unavailable"}. Entropy and guessability describe different models.</p>
          <div className="privacy-callout warning-callout"><AlertTriangle size={16} /><p>Generated values remain in React page memory until cleared or navigation/reload releases the screen state. They are not written to browser storage or reports.</p></div>
          {message && <p className="success-message" role="status"><Check size={15} />{message}</p>}
        </> : <div className="empty-state generator-empty"><SparkleIcon /><strong>No password generated</strong><p>Choose a profile and generate a value. The random source is Web Crypto with rejection sampling.</p></div>}
        {error && <div className="inline-alert error-alert" role="alert"><AlertTriangle size={15} />{error}</div>}
      </section>
    </div>
  </>;
}

function SparkleIcon() { return <KeyRound size={24} aria-hidden="true" />; }
