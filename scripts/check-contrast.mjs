import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(path.join(root, "apps", "web", "src", "styles.css"), "utf8");

function readTokenBlock(selector) {
  const pattern = selector === ":root" ? /:root\s*\{([^}]*)\}/ : /\.theme-dark\s*\{([^}]*)\}/;
  const block = css.match(pattern)?.[1];
  if (!block) throw new Error(`Missing CSS token block: ${selector}`);
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(([, name, value]) => [name, value.toLowerCase()]),
  );
}

function luminance(hex) {
  const rgb = hex.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16) / 255);
  const linear = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function ratio(foreground, background) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

function mix(foreground, background, foregroundWeight) {
  const fg = foreground.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16));
  const bg = background.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16));
  const channels = fg.map((channel, index) => Math.round(channel * foregroundWeight + bg[index] * (1 - foregroundWeight)));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

const themes = [
  ["light", readTokenBlock(":root")],
  ["dark", { ...readTokenBlock(":root"), ...readTokenBlock(".theme-dark") }],
];
const failures = [];

for (const [theme, tokens] of themes) {
  const checks = [
    ["primary text on surface", tokens.text, tokens.surface],
    ["secondary text on surface", tokens["text-muted"], tokens.surface],
    ["subtle text on surface", tokens["text-subtle"], tokens.surface],
    ["subtle text on secondary surface", tokens["text-subtle"], tokens["surface-subtle"]],
    ["subtle text on page background", tokens["text-subtle"], tokens["app-bg"]],
    ["blue link on surface", tokens["blue-deep"], tokens.surface],
    ["blue link on selected surface", tokens["blue-deep"], tokens["surface-blue"]],
    ["cyan label on surface", tokens["cyan-ink"], tokens.surface],
    ["cyan label on secondary surface", tokens["cyan-ink"], tokens["surface-subtle"]],
    ["cyan label on tinted surface", tokens["cyan-ink"], mix(tokens.cyan, tokens.surface, 0.1)],
    ["green state on surface", tokens.green, tokens.surface],
    ["green state on tint", tokens.green, tokens["green-soft"]],
    ["red state on surface", tokens.red, tokens.surface],
    ["red state on tint", tokens.red, tokens["red-soft"]],
    ["medium strength badge", tokens["cyan-ink"], mix(tokens.cyan, tokens.surface, theme === "light" ? 0.1 : 0.12)],
    ["white text on action fill", "#ffffff", tokens["blue-action"]],
    ["white text on action hover", "#ffffff", tokens["blue-action-hover"]],
  ];

  for (const [label, foreground, background] of checks) {
    if (!foreground || !background) throw new Error(`Missing ${theme} contrast token for ${label}`);
    const value = ratio(foreground, background);
    if (value < 4.5) failures.push(`${theme}: ${label} is ${value.toFixed(2)}:1 (requires 4.5:1)`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Semantic text and action token contrast checks passed at 4.5:1 for light and dark themes.");
