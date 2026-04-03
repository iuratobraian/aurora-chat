# 🤖 AGENT REGISTRY - TradeShare

**Última actualización:** 2026-04-03  
**Mantenido por:** Aurora AI  
**Protocolo:** Cada agente DEBE registrarse antes de operar

---

## 📋 CÓMO REGISTRARSE

1. Leer este archivo
2. Agregar tu entrada en la tabla de abajo
3. Firmar tu primer mensaje en `TEAM_CHAT.md`
4. Actualizar `CURRENT_FOCUS.md` con tu tarea

---

## 👥 AGENTES REGISTRADOS

| ID | Nombre | Email/Handle | Firma | Rol | Estado | Última Actividad |
|----|--------|--------------|-------|-----|--------|------------------|
| AGENT-001 | iuratobraian | iuratobraian@gmail.com | ✅ Verificado | Team Lead / USUARIO | ✅ Activo | 2026-04-03 |
| AGENT-002 | Aurora Bot | aurora@antigravity.io | ✅ Verificado | Backup / Sync | ✅ Activo | 2026-04-03 |
| AGENT-003 | @aurora | aurora@tradeshare.io | ✅ Verificado | Agente Integrador | ✅ Activo | 2026-04-03 |
| AGENT-004 | Codex | codex@tradeshare.io | ⏳ Pendiente | Developer | ⏳ Pendiente | - |
| AGENT-005 | OpenCode | opencode@tradeshare.io | ⏳ Pendiente | Developer | ⏳ Pendiente | - |
| AGENT-006 | BIG-PICKLE | bigpickle@tradeshare.io | ⏳ Pendiente | QA / Security | ⏳ Pendiente | - |
| AGENT-007 | Antigravity | antigravity@tradeshare.io | ⏳ Pendiente | Team Lead / PM | ⏳ Pendiente | - |

---

## 📍 DÓNDE ENCONTRAR EL CHAT DEL EQUIPO

**IMPORTANTE:** Todos los agentes DEBEN revisar esto al iniciar sesión.

### Chat Principal del Equipo
📄 **Archivo:** `.agent/workspace/coordination/TEAM_CHAT.md`  
🔗 **Ruta absoluta:** `C:\Users\iurato\Desktop\PROYECTO ACTUAL\.agent\workspace\coordination\TEAM_CHAT.md`

### Cómo Participar
1. Abrir `TEAM_CHAT.md`
2. Leer los mensajes existentes
3. Agregar tu respuesta al final con el formato:
   ```markdown
   ### Mensaje #[número]
   **De:** [Tu Nombre] ([Tu ID])
   **Fecha:** [Fecha y hora]
   **Reply to:** #[número del mensaje que respondés]
   
   [Tu mensaje...]
   
   -- Firmado: [Tu Nombre] ([Tu ID])
   ```

### Otros Archivos de Coordinación
| Archivo | Propósito |
|---------|-----------|
| `TASK_BOARD.md` | Tareas pendientes y completadas |
| `CURRENT_FOCUS.md` | En qué está trabajando cada agente |
| `HANDOFFS.md` | Transiciones entre agentes |
| `AGENT_LOG.md` | Historial de actividades |
| `NOTION_SYNC_PROTOCOL.md` | Sincronización con Notion |
| `TEAM_CHAT.md` | **Chat del equipo** |

---

## 🔐 PROTOCOLO DE VERIFICACIÓN

### Para Verificar tu Identidad
1. Elegí un ID único (ej: AGENT-004)
2. Creá una firma simple: `SHA256("TuNombre-TuEmail-Fecha")`
3. Agregá tu entrada en la tabla
4. Firmá tu primer mensaje en el chat

### Ejemplo de Firma
```
-- Firmado: Codex (AGENT-004)
Timestamp: 2026-04-03T15:30:00Z
Hash: SHA256("Codex-codex@tradeshare.io-2026-04-03")
```

---

## 📢 ANUNCIOS IMPORTANTES

### 2026-04-03 - Sistema de Chat Implementado
**Por:** @aurora (AGENT-003)

Se implementó un sistema de chat asíncrono para que el equipo pueda discutir propuestas antes de implementar.

**Primer tema de discusión:** `PLAN_MEJORA_AGENTES_SOCIALES.md`

**Acción requerida:** Todos los agentes deben:
1. Registrarse en este archivo
2. Leer el plan de mejora
3. Dar su opinión en `TEAM_CHAT.md`
4. Esperar consenso antes de implementar

---

## 🚨 REGLAS DE ORO

1. **NO implementar sin consenso del equipo**
2. **SIEMPRE firmar los mensajes en el chat**
3. **REVISAR el chat antes de empezar cualquier tarea**
4. **RESPETAR las decisiones del equipo**
5. **MANTENER la identidad consistente** (mismo ID siempre)

---

**¿Tenés dudas?** Preguntá en el chat.  
**¿Querés registrarte?** Agregá tu fila en la tabla.  
**¿Querés discutir algo?** Usá `TEAM_CHAT.md`.
