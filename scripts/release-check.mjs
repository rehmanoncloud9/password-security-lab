import { readFile } from "node:fs/promises";

const files = [
  "package.json",
  "apps/web/package.json",
  "packages/core/package.json",
  "examples/sdk-consumer/package.json",
];
const manifests = await Promise.all(
  files.map(async (path) => [path, JSON.parse(await readFile(path, "utf8"))]),
);
const versions = new Set(manifests.map(([, manifest]) => manifest.version));
if (versions.size !== 1) {
  throw new Error(`JavaScript package versions differ: ${[...versions].join(", ")}`);
}

const version = manifests[0][1].version;
const pyproject = await readFile("apps/lab-api/pyproject.toml", "utf8");
if (!pyproject.includes(`version = "${version}"`)) {
  throw new Error(`Python project version does not match ${version}`);
}
const changelog = await readFile("CHANGELOG.md", "utf8");
if (!changelog.split(/\r?\n/).some((line) => line.trim() === `## ${version}`)) {
  throw new Error(`CHANGELOG.md has no heading for ${version}`);
}
try {
  await readFile("package-lock.json");
} catch {
  throw new Error("package-lock.json is required for a reproducible release candidate.");
}

const ref = process.env.GITHUB_REF;
if (ref?.startsWith("refs/tags/") && ref !== `refs/tags/v${version}`) {
  throw new Error(`Tag ${ref} does not match package version v${version}`);
}

console.log(`Release preflight metadata is consistent for v${version}.`);
