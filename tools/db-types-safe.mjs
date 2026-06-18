import net from "node:net";
import path from "node:path";
import { spawnSync } from "node:child_process";

const scriptsDir = path.join(process.cwd(), "tools");

function checkPort(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function runNodeScript(name) {
  return spawnSync("node", [path.join(scriptsDir, name)], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
}

const remote = runNodeScript("db-types-remote.mjs");
if (remote.status === 0) {
  process.stdout.write(remote.stdout || "");
  process.exit(0);
}

const remoteOutput = `${remote.stdout || ""}\n${remote.stderr || ""}`;
const remoteDenied = /necessary privileges|access this endpoint|forbidden|403/i.test(remoteOutput);

if (!remoteDenied) {
  process.stdout.write(remote.stdout || "");
  process.stderr.write(remote.stderr || "");
  process.exit(remote.status ?? 1);
}

const localDbRunning = await checkPort(54322);
if (!localDbRunning) {
  console.error("[db:types] ERROR remote generation denied and local Supabase is not running");
  console.error("[db:types] Hint: authenticate with a role that can generate remote types or start local Supabase and use db:types:local");
  process.exit(1);
}

const local = runNodeScript("db-types-local.mjs");
process.stdout.write(local.stdout || "");
process.stderr.write(local.stderr || "");
process.exit(local.status ?? 1);
