import { execSync } from "node:child_process";

const PORT = 4310;

function findOwners() {
  try {
    const output = execSync(`netstat -ano | findstr :${PORT}`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    });
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && /LISTENING/.test(line))
      .map((line) => {
        const parts = line.split(/\s+/);
        return Number(parts[parts.length - 1]);
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function kill(pid) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    console.log(`Port ${PORT} owner ${pid} terminated.`);
  } catch (error) {
    console.warn(`No pude cerrar ${pid}: ${error.message}`);
  }
}

const owners = findOwners();
if (!owners.length) {
  console.log(`Puerto ${PORT} libre.`);
  process.exit(0);
}
console.log(`Puerto ${PORT} ocupado por PID(s): ${owners.join(", ")}`);
owners.forEach((pid) => kill(pid));
