import { askKimi } from "./aurora-kimi-agent.mjs";

const prompt = `Tarea [UI-FIX]: Reposicionar Panel Admin en LiveTVSection para evitar solapamiento con el Astronauta.

Problema:
- El Astronauta (fixed bottom-6 right-6) cubre los botones de "Idea Ultra Rápida" en el sidebar de la TV.
- El usuario prohibió agregar espacio/padding extra al final del sidebar porque se ve "deprolijo".
- Debemos mover los botones de Admin a una posición más alta en el sidebar.

Sidebar Actual (LiveSidebar):
1. Header (Nombre + Oficial)
2. Mute Toggle
3. (mt-auto) Chat/Cinema Buttons
4. (mt-auto) Admin Panel (IdeaQuickSubmit) <- ESTE ES EL QUE SE TAPA

Propuesta:
1. Mover el Admin Panel justo después del Mute Toggle.
2. Mantener el margen mt-auto para los botones de Chat/Cine para que cuelguen abajo, pero sin que se pisen con el astronauta si es posible, o simplemente priorizar que el Admin Panel esté arriba.

¿Cuál es la mejor estructura de clases Tailwind para que el sidebar se vea premium pero los botones de admin nunca queden en el área de conflicto (esquina inferior derecha)?`;

console.log("💜 Consultando a KIMI K2.5 para UI-FIX...");

try {
  const result = await askKimi(prompt, { timeout: 300000 });
  console.log("\n💜 Respuesta de Kimi - [UI-FIX]:");
  console.log(result.answer);
} catch (err) {
  console.error("❌ Error al consultar a Kimi:", err.message);
}
