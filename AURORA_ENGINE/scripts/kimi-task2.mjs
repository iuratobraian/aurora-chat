import { askKimi } from "./aurora-kimi-agent.mjs";

const prompt = `Tarea FIX-007: Revisar ElectricLoader para bugs visuales en LiveChatWidget.

Se reportó que ElectricLoader tiene fallos visuales cuando se usa en el chat.

VERIFICACIONES REALIZADAS:
1. LiveChatWidget.tsx NO importa ni usa ElectricLoader
2. ElectricLoader se usa en: RegisterForm.tsx, LoginForm.tsx, UserManagement.tsx
3. LiveChatWidget tiene sus propias animaciones (spin, pulse, bounce) nativas

PREGUNTA: 
Dado que LiveChatWidget NO usa ElectricLoader, esta tarea es un falso positivo?
O debo buscar otros problemas visuales en el chat?

Responde de forma concisa: ¿Marco esta tarea como completada (no hay bug) o hay algo más que deba revisar?`;

const result = await askKimi(prompt, { timeout: 300000 }); // 5 minutos para KIMI

console.log("\n💜 Respuesta de Kimi - FIX-007:");
console.log(result.answer);
