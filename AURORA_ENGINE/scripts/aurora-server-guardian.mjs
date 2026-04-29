import { spawn } from "child_process";
import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

console.log("🛡️ [AURORA GUARDIAN] Levantando servidor local y monitoreando la consola por errores.");

const child = spawn("npm", ["run", "dev"], { stdio: ["inherit", "pipe", "pipe"], shell: true });

let lastReportTime = 0;
const REPORT_COOLDOWN = 60000; // 1 minuto por falla idéntica

function parseAndReportError(output) {
    if (!convex) return;

    const now = Date.now();
    if (now - lastReportTime < REPORT_COOLDOWN) return;

    // Filtros de error críticos en consola Vite/Node (multilingüe)
    const errorPatterns = [
        // Inglés
        "Error:", "Exception:", "Cannot optimize dependency", "SyntaxError", "EADDRINUSE",
        // Español
        "Error de sintaxis", "No se puede", "Error crítico", "Falla", "Error interno",
        // Francés
        "Erreur:", "Exception:", "Ne peut pas", "Erreur de syntaxe",
        // Portugués
        "Erro:", "Exceção:", "Não é possível", "Erro de sintaxe",
        // Alemán
        "Fehler:", "Ausnahme:", "Syntaxfehler",
        // Italiano
        "Errore:", "Eccezione:", "Errore di sintassi",
    ];

    const hasError = errorPatterns.some(pattern => output.includes(pattern));

    if (hasError) {
        console.log("🚨 [AURORA GUARDIAN] Falla crítica detectada. Subiendo reporte...");

        lastReportTime = now;
        const safeMsg = output.substring(0, 100).replace(/[\r\n]/g, " ");
        convex.mutation("auroraHive:createTask", {
            title: `[RESCUE] ${safeMsg.substring(0, 30)}...`,
            epic: "SERVER_RESCUE",
            description: "Aurora Guardian detectó esta falla:\n" + output,
            source: "auto-diagnostic",
            priority: 10 // P0
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
