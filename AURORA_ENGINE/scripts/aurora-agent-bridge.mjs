import { spawn } from "node:child_process";
import { getRepos } from "./aurora-repo-manager.mjs";

function getActiveRepo() {
  const repos = getRepos();
  return repos.repositorios.find((repo) => repo.nombre === repos.activo);
}

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} finalizo con codigo ${code}`));
    });
  });
}

export async function runCodexExec(prompt) {
  const repo = getActiveRepo();
  if (!repo) throw new Error("No hay repo activo configurado en Aurora.");
  await run("codex", ["exec", "--full-auto", "-C", repo.ruta, prompt], repo.ruta);
}

export async function runCodexCloudList() {
  const repo = getActiveRepo();
  if (!repo) throw new Error("No hay repo activo configurado en Aurora.");
  await run("codex", ["cloud", "list"], repo.ruta);
}

const command = process.argv[2] || "help";

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  if (command === "codex") {
    await runCodexExec(process.argv.slice(3).join(" "));
  } else if (command === "codex-cloud-list") {
    await runCodexCloudList();
  } else {
    console.log("Uso:");
    console.log("  node scripts/aurora-agent-bridge.mjs codex \"tu prompt\"");
    console.log("  node scripts/aurora-agent-bridge.mjs codex-cloud-list");
  }
}
