import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NAVIGATION } from "../.test-build/app/navigation.js";
import { AppShell } from "../.test-build/components/AppShell.js";
import { AnalysisPage, GeneratorPage, PolicyPage, ReusePage } from "../.test-build/features/AnalysisLaboratory.js";
import { AttackPage } from "../.test-build/features/AttackPage.js";
import { BenchmarksPage, ReportsPage } from "../.test-build/features/BenchmarkReports.js";
import { HashingPage } from "../.test-build/features/HashingPage.js";
import { readThemePreference, saveThemePreference } from "../.test-build/theme/preferences.js";

let checks = 0;

function check(name, callback) {
  callback();
  checks += 1;
  console.log(`PASS ${name}`);
}

function markup(element) {
  return renderToStaticMarkup(element);
}

const noOp = () => undefined;
const shellProps = (page, theme) => ({
  page,
  theme,
  onNavigate: noOp,
  onToggleTheme: noOp,
  api: null,
  apiError: "The local API is unavailable.",
  children: createElement("h1", null, "Current module"),
  rightPanel: createElement("aside", null, "Local API unavailable"),
  bottomPanels: createElement("section", null, "No recent experiment events"),
});

check("shell renders each destination and selected state", () => {
  const html = markup(createElement(AppShell, shellProps("analysis", "light")));
  for (const destination of NAVIGATION) {
    const escapedLabel = destination.label.replaceAll("&", "&amp;");
    assert.ok(html.includes(escapedLabel), destination.label);
  }
  assert.match(html, /aria-label="Laboratory navigation"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /Settings: switch to dark theme/);
  assert.match(html, /Local API unavailable/);
  assert.doesNotMatch(html, /Host CPU<\/span><strong>0\.0%/);
});

check("both theme shells expose the matching theme state", () => {
  assert.match(markup(createElement(AppShell, shellProps("overview", "light"))), /theme-light/);
  assert.match(markup(createElement(AppShell, shellProps("overview", "dark"))), /theme-dark/);
});

check("analysis renders real pattern findings locally", () => {
  const html = markup(createElement(AnalysisPage, {
    password: "qwerty",
    onPasswordChange: noOp,
    visible: false,
    onToggleVisible: noOp,
    onClear: noOp,
  }));
  assert.match(html, /PATTERN-AWARE ESTIMATE/);
  assert.match(html, />spatial</);
  assert.match(html, /Analysis executes locally in this browser tab/);
});

check("policy screen renders computed checks for its synthetic candidate", () => {
  const html = markup(createElement(PolicyPage, {
    password: "qwerty",
    onPasswordChange: noOp,
    policyId: "modern_single_factor",
    onPolicyChange: noOp,
    onEvent: noOp,
    onSafeResult: noOp,
  }));
  assert.match(html, /Compare policy outcomes/);
  assert.match(html, /Modern single-factor/);
  assert.match(html, /Exact whole-value dictionary screen/);
  assert.match(html, /non-compliant/);
});

check("generator and reuse modules render their working input controls", () => {
  const generator = markup(createElement(GeneratorPage, { onEvent: noOp, onSafeResult: noOp }));
  const reuse = markup(createElement(ReusePage, { onEvent: noOp, onSafeResult: noOp }));
  assert.match(generator, /Generation mode/);
  assert.match(generator, /Generate securely/);
  assert.match(generator, /Web Crypto/);
  assert.match(reuse, /Compare made-up examples/);
  assert.match(reuse, /Compare examples/);
});

check("hashing screen reports unavailable service and offers all four algorithms", () => {
  const html = markup(createElement(HashingPage, {
    apiAvailable: false,
    hasActiveJob: false,
    hashes: [],
    operationError: "",
    onCreateHash: async () => false,
    onVerify: async () => ({ matched: false, algorithm: "sha256", verificationMs: 0 }),
    onClear: async () => false,
  }));
  for (const algorithm of ["Argon2id", "bcrypt", "PBKDF2-HMAC-SHA256", "SHA-256 (unsafe baseline)"]) {
    assert.ok(html.includes(algorithm), algorithm);
  }
  assert.match(html, /Loopback API unavailable/);
  assert.match(html, /No verifier has been generated/);
});

check("attack screen shows the six bounded strategies and safety caps", () => {
  const html = markup(createElement(AttackPage, {
    apiAvailable: false,
    job: null,
    operationError: "",
    onStart: async () => undefined,
    onCancel: async () => undefined,
  }));
  for (const strategy of ["Educational dictionary", "Brute-force enumeration", "Pattern and date guessing", "Common suffix guessing", "Character substitution", "Two-word combinations"]) {
    assert.ok(html.includes(strategy), strategy);
  }
  assert.match(html, /Maximum 10 s/);
  assert.match(html, /10,000 attempts/);
  assert.match(html, /No experiment has run/);
});

check("benchmark and report screens distinguish empty data from measured results", () => {
  const benchmark = markup(createElement(BenchmarksPage, {
    apiAvailable: false,
    report: null,
    busy: false,
    error: "",
    onRun: async () => null,
    onSafeResult: noOp,
  }));
  const reports = markup(createElement(ReportsPage, { results: [], onClear: noOp }));
  assert.match(benchmark, /No benchmark has run/);
  assert.match(benchmark, /does not substitute example values/);
  assert.match(reports, /No operations recorded in this session/);
});

check("theme preference storage contains only the display setting", () => {
  const values = new Map();
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  try {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
      } },
    });
    assert.equal(readThemePreference(), "light");
    assert.equal(saveThemePreference("dark"), true);
    assert.equal(readThemePreference(), "dark");
    assert.deepEqual([...values], [["psl-theme", "dark"]]);
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

console.log(`${checks} frontend runtime render checks passed.`);
