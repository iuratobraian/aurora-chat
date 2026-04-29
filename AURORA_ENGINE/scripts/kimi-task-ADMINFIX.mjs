import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config();

const kimiPrompt = `
TAREA: Corregir fallos críticos en el Panel de Administración.

PROBLEMAS DETECTADOS:
1. Las "Acciones Rápidas" en AdminDashboard.tsx no funcionan (faltan onClick handlers).
2. Discrepancia de Estadísticas: El Dashboard muestra 72 usuarios (vía api.stats) mientras que la sección de Usuarios muestra 20 (vía api.profiles).
3. Navegación: El AdminDashboard debe ser capaz de navegar a otras secciones (users, posts, etc.) cuando se hace clic en una acción rápida.

ESTRUCTURA:
- AdminView.tsx gestiona el estado activeSection.
- AdminDashboard.tsx recibe las estadísticas pero no tiene forma de reportar el clic.

ARQUITECTURA DE SOLUCIÓN:
1. Añadir prop onSelectSection a AdminDashboard.tsx.
2. Implementar onClick en los botones de AdminDashboard.tsx llamando a onSelectSection.
3. Investigar por qué api.profiles.getAllProfiles devuelve solo 20 usuarios (¿paginación por defecto?).
4. Unificar fuentes de verdad para las estadísticas.

GENERA LAS MODIFICACIONES NECESARIAS siguiendo el protocolo AMM.
`;

console.log("Kimi está analizando el sistema de administración...");
console.log(kimiPrompt);
