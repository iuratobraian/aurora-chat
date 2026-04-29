import { askKimiWithContext } from "./aurora-kimi-agent.mjs";

async function main() {
  const context = {
    currentTask: "Optimización de Memoria para Infraestructura de Testing",
    filesToEdit: [
      "package.json",
      "vite.config.ts",
      "vitest.config.ts"
    ],
    technicalRequirements: [
      "Resolver fallos de 'Worker exited unexpectedly' en Vitest (OOM)",
      "Configurar NODE_OPTIONS con --max-old-space-size",
      "Evaluar y configurar --runInBand o segmentación de tests",
      "Identificar posibles memory leaks en la suite de tests actual"
    ]
  };

  console.log("Consultando a Kimi para estrategia de optimización de memoria...");
  const prompt = `Diseña una estrategia detallada para resolver los problemas de Out Of Memory (OOM) en nuestra infraestructura de Vitest. 
  La suite de tests está fallando de forma intermitente con 'Worker exited unexpectedly'. 
  Propón cambios específicos para package.json y los archivos de configuración de Vite/Vitest. 
  ¿Cómo deberíamos configurar los workers y la memoria de Node para maximizar la estabilidad sin degradar demasiado el rendimiento?`;

  const result = await askKimiWithContext(prompt, context);
  console.log("\n--- ESTRATEGIA DE OPTIMIZACIÓN PROPUESTA POR KIMI ---");
  console.log(result);
}

main();
