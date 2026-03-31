import { spawn } from "node:child_process";

const ROOT = process.cwd();
const steps = [
  ["npm", ["run", "aurora:seed-app-learning"]],
  ["npm", ["run", "aurora:seed-app-tech"]],
  ["npm", ["run", "aurora:seed-community-loops"]],
  ["npm", ["run", "aurora:scorecard"]],
  ["npm", ["run", "ops:activity"]],
  ["npm", ["run", "auto:runner"]],
  ["npm", ["run", "train:loop"]],
  ["npm", ["run", "aurora:research-batch", "--", "4"]]
];

function runStep(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      shell: true,
      stdio: "inherit"
    });
    child.on("close", (code) => {
      resolve({
        command: `${command} ${args.join(" ")}`,
        success: code === 0,
        code
      });
    });
  });
}

async function main() {
  const results = [];
  for (const [command, args] of steps) {
    const result = await runStep(command, args);
    results.push(result);
  }
  const failed = results.filter((result) => !result.success);
  console.log(JSON.stringify({
    ok: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  }, null, 2));
}

main().catch((error) => {
  console.error("Aurora antigravity sync failed:", error.message);
  process.exit(1);
});
