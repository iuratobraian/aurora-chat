import { spawn } from "child_process";
import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

console.log("🛡️ [AURORA GUARDIAN] Levantando servidor local y monitoreando la consola por errores.");

const child = spawn("npm", ["run", "dev"], { stdio: ["inherit", "pipe", "pipe"], shell: true });

function parseAndReportError(output) {
    if (!convex) return;
    
    // Filtros de error críticos en consola Vite/Node
    if (output.includes("Error:") || output.includes("Exception:") || output.includes("Cannot optimize dependency") || output.includes("SyntaxError")) {
        console.log("🚨 [AURORA GUARDIAN] Falla crítica devorada. Subiendo reporte a la mente enjambre...");
        
        const safeMsg = output.substring(0, 150) + "...";
        convex.mutation("auroraHive:createTask", {
            title: `Fix Server Crash: ${safeMsg}`,
            epic: "SERVER_RESCUE",
            description: "Aurora Guardian detectó esta falla al iniciar Vite/Node:\n" + output,
            priority: 5 // Alta prioridad
        }).catch(() => {});
    }
}

child.stdout.on("data", (data) => {
    const text = data.toString();
    process.stdout.write(text); // Redirigir al usuario
    parseAndReportError(text);
});

child.stderr.on("data", (data) => {
    const text = data.toString();
    process.stderr.write(text);
    parseAndReportError(text);
});

child.on("close", (code) => {
    console.log(`🛡️ [AURORA GUARDIAN] El Servidor colapsó con código ${code}.`);
});
