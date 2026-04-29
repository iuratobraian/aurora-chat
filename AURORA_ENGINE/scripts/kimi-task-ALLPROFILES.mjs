import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config();

const kimiPrompt = `
TAREA: Implementar la query faltante api.profiles.getAllProfiles en convex/profiles.ts.

PROBLEMA:
El Panel de Admin falla con un Server Error [CONVEX Q(profiles:getAllProfiles)] porque la función no existe en el backend, pero el frontend la llama con un argumento { limit: number }.

REQUERIMIENTOS:
1. Definir getAllProfiles en convex/profiles.ts como una query de Convex.
2. Argumentos: v.optional(v.object({ limit: v.optional(v.number()), status: v.optional(v.string()) })) u similar. Según el código visto, el frontend usa { limit: 500 } o { limit: 100 }.
3. Seguridad: Solo usuarios con rol >= 5 (ADMIN) o rol "admin" pueden ejecutarla.
4. Lógica:
   - Validar identidad del caller.
   - Consultar la tabla "profiles".
   - Aplicar límite (default 100, max 1000).
   - Opcional: Permitir filtrado por status (active, deleted, banned).
   - Retornar un objeto { profiles: safeProfiles, total?: number }.
   - safeProfiles no debe incluir el campo "password".
5. Indexación: Usar índices existentes como "by_status" si se filtra, o simplemente orden cronológico por _creationTime si no hay filtro.

DATO ADICIONAL:
El esquema ya tiene índices por userId, usuario, email, userNumber, status, deletedAt, role, xp, level.

GENERA EL CÓDIGO EXACTO para insertar en convex/profiles.ts.
`;

console.log("Kimi está diseñando la implementación de getAllProfiles...");
console.log(kimiPrompt);
