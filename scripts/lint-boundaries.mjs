import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx|css)$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

const failures = [];
const coreFiles = await sourceFiles("packages/core/src");
for (const path of coreFiles) {
  const normalizedPath = path.replaceAll("\\", "/");
  const content = await readFile(path, "utf8");
  if (/\b(?:XMLHttpRequest|localStorage|sessionStorage|indexedDB|sendBeacon)\b/.test(content)) {
    failures.push(`${path}: core must not access persistence or legacy network APIs`);
  }
  if (/\bfetch\b/.test(content)) {
    // "fetch" is a legitimate entry in the EFF wordlist, and exposure/hibp.ts is the opt-in k-anonymity client
    if (!normalizedPath.endsWith("/wordlist.ts") && !normalizedPath.endsWith("/exposure/hibp.ts")) {
      failures.push(`${path}: core must not access network APIs`);
    }
  }
  if (/from\s+["'](?:apps\/lab-api|@psa\/web|react)(?:\/|["'])/.test(content)) {
    failures.push(`${path}: core must not depend on React or the lab`);
  }
}

const webFiles = await sourceFiles("apps/web/src");
for (const path of webFiles) {
  const content = await readFile(path, "utf8");
  if (/\b(?:sessionStorage|indexedDB|sendBeacon|document\.cookie)\b/.test(content)) {
    failures.push(`${path}: app must not use session storage, database, analytics or cookies`);
  }
  const normalizedPath = path.replaceAll("\\", "/");
  if (/\blocalStorage\b/.test(content) && !normalizedPath.endsWith("/theme/preferences.ts")) {
    failures.push(`${path}: browser storage is allowed only for the display-theme preference`);
  }
  if (/url\(\s*["']?https?:\/\//i.test(content)) {
    failures.push(`${path}: styles must not fetch remote assets`);
  }
}

const themePreferences = await readFile("apps/web/src/theme/preferences.ts", "utf8");
if (!themePreferences.includes('getItem("psl-theme")') || !themePreferences.includes('setItem("psl-theme", theme)')) {
  failures.push("theme preference storage must read and write only the psl-theme key");
}
if (/password|candidate|verifier|generated/i.test(themePreferences)) {
  failures.push("theme preference storage must not reference password-related values");
}

const app = await readFile("apps/web/src/App.tsx", "utf8");
if (!app.includes('const API = "http://127.0.0.1:8000";')) {
  failures.push("apps/web/src/App.tsx: lab API must remain fixed to loopback");
}
const consumer = await readFile("examples/sdk-consumer/src/index.ts", "utf8");
if (!consumer.includes('from "@psa/core"') || /lab-api|attack/i.test(consumer)) {
  failures.push("examples/sdk-consumer must import only the independent analysis core");
}

if (failures.length) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Privacy/architecture boundary lint passed (${coreFiles.length} core and ${webFiles.length} web files).\n`);
}
