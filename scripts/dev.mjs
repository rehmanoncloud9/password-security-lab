import { spawnSync } from "node:child_process";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  console.error("Run this workflow with `npm run dev` so npm supplies its local runtime context.");
  process.exit(1);
}

const initialBuild = spawnSync(
  process.execPath,
  [npmCli, "run", "build", "--workspace", "@psa/core"],
  { cwd: root, stdio: "inherit", env: process.env },
);

if (initialBuild.error) throw initialBuild.error;
if (initialBuild.status !== 0) process.exit(initialBuild.status ?? 1);

const coreConfigPath = path.join(root, "packages", "core", "tsconfig.json");
const watchHost = ts.createWatchCompilerHost(
  coreConfigPath,
  {},
  ts.sys,
  ts.createEmitAndSemanticDiagnosticsBuilderProgram,
  (diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.error(message);
  },
  (diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.info(message);
  },
);
const coreWatcher = ts.createWatchProgram(watchHost);
let webServer;

let stopping = false;
async function stop(signal) {
  if (stopping) return;
  stopping = true;
  if (signal) console.info(`\nStopping local development services (${signal}).`);
  coreWatcher.close();
  if (webServer) await webServer.close();
}

process.once("SIGINT", () => void stop("SIGINT"));
process.once("SIGTERM", () => void stop("SIGTERM"));

try {
  webServer = await createServer({
    configFile: path.join(root, "apps", "web", "vite.config.ts"),
    root: path.join(root, "apps", "web"),
  });
  await webServer.listen();
  webServer.printUrls();
} catch (error) {
  await stop();
  throw error;
}
