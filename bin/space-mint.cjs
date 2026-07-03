#!/usr/bin/env node

const { spawn } = require("node:child_process");
const { existsSync, statSync } = require("node:fs");
const { resolve } = require("node:path");

const args = process.argv.slice(2);
const projectRoot = resolve(__dirname, "..");

function printHelp() {
  console.log("Usage:");
  console.log("  space-mint open [folder]");
  console.log("  space-mint [folder]");
}

function resolveTargetPath() {
  const first = args[0];
  if (first === "--help" || first === "-h") {
    printHelp();
    process.exit(0);
  }

  const target = first === "open" ? args[1] : first;
  return resolve(process.cwd(), target || ".");
}

function readExistingElectronArgs() {
  const value = process.env.ELECTRON_CLI_ARGS;
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createChildEnv(extra) {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key || key.includes("=") || key.includes("\0")) {
      continue;
    }
    if (value === undefined || value.includes("\0")) {
      continue;
    }
    env[key] = value;
  }
  return { ...env, ...extra };
}

const targetPath = resolveTargetPath();

if (!existsSync(targetPath) || !statSync(targetPath).isDirectory()) {
  console.error(`Space Mint can only open an existing folder: ${targetPath}`);
  process.exit(1);
}

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const electronArgs = [
  ...readExistingElectronArgs(),
  "--open-path",
  targetPath
];

const child = spawn(pnpmCommand, ["dev"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: createChildEnv({
    SPACE_MINT_OPEN_PATH: targetPath,
    ELECTRON_CLI_ARGS: JSON.stringify(electronArgs)
  })
});

child.on("error", (error) => {
  console.error(`Failed to open Space Mint: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
