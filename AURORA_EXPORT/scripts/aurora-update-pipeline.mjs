import { spawn } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const commands = [
  ["npm", ["run", "team:check"]],
  ["npm", ["run", "gpu:check"]],
  ["npm", ["run", "models:status"]],
  ["npm", ["run", "team:check"]],
  ["npm", ["run", "ops:activity"]],
  ["npm", ["run", "auto:runner"]],
  ["npm", ["run", "train:loop"]]
];

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: "inherit", shell: true });
    child.on("close", (code) => {
      if (code === 0) resolve(`OK: ${command} ${args.join(" ")}`);
      else reject(new Error(`Command failed: ${command} ${args.join(" ")}`));
    });
  });
}

async function runPipeline() {
  const log = [];
  for (const [cmd, args] of commands) {
    try {
      await runCommand(cmd, args);
      log.push({ command: `${cmd} ${args.join(" ")}`, success: true });
    } catch (error) {
      log.push({ command: `${cmd} ${args.join(" ")}`, success: false, error: error.message });
      break;
    }
  }
  console.log("Pipeline result:", log);
  return log;
}

runPipeline().catch((error) => {
  console.error("Pipeline error:", error.message);
  process.exit(1);
});
