import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config();

const kimiPrompt = `
TAREA: Implementar TV Privada 'Always-On' con enmascaramiento visual anti-robo.

REQUERIMIENTOS:
1. CommunityTVSection.tsx: Debe usar ProtectedIframe para la señal.
2. Inversión de Lógica: El botón de admin debe decir 'Apagar' cuando está ON y 'Encender' cuando está OFF.
3. Máscaras Visuales: Los banners superior e inferior deben ser persistentes y adaptarse a pantalla completa.
4. Privacidad: Bloquear cualquier intento de clic derecho o extracción de link en el reproductor.

CÓDIGO BASE DETECTADO:
- VideoProtection.tsx (ya tiene banners top/bottom).
- ProtectedIframe (usa VideoProtection).

GENERA LAS MODIFICACIONES PARA CommunityTVSection.tsx siguiendo el patrón de LiveTVSection.tsx.
`;

console.log("Kimi está analizando la arquitectura de la TV Privada...");
console.log(kimiPrompt);
