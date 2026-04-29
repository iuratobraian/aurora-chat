import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const modelsPath = path.join(ROOT, ".agent/aurora/ai_models.json");

if (!fs.existsSync(modelsPath)) {
  console.log("No hay modelos registrados en ai_models.json");
  process.exit(0);
}

const models = JSON.parse(fs.readFileSync(modelsPath, "utf8"));
for (const model of models) {
  console.log(`${model.name} (${model.provider}) — GPU: ${model.gpuCapable ? "sí" : "no"} — Estado: ${model.status}`);
}
