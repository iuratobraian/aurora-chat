import { execSync } from "child_process";
import fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf-8");
const envMap = {};

envStr.split("\n").forEach(line => {
    if (line && line.includes("=")) {
        const [k, ...rest] = line.split("=");
        envMap[k.trim()] = rest.join("=").trim();
    }
});

const cmd = process.argv.slice(2).join(" ");
console.log(`Running: ${cmd}`);

execSync(cmd, {
    env: { ...process.env, ...envMap },
    stdio: "inherit"
});
