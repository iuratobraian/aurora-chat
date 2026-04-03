---
name: mandatory-startup-readiness
description: PROTOCOLO INSTITUCIONAL DE PRE-VUELO (MEMORIA, MAESTRÍA Y ESTABILIDAD). Este protocolo es el pilar de operación profesional de TradeShare. Ningún agente puede iniciar sesión sin completar satisfactoriamente este proceso. Garantiza sincronización total con el Jefe, prevención de errores recurrentes y estabilidad absoluta de la plataforma.
---

# 🛡️ PROTOCOLO DE PRE-VUELO INSTITUCIONAL (TRADE SHARE)

Este documento define el estándar inamovible de inicio de sesión para todo agente. No es opcional; es la base de nuestra profesionalidad.

---

## 📋 PASO 1: SINCRONIZACIÓN DE MEMORIA (CONTEXTO)
Antes de tocar el código, el agente debe sincronizarse con las órdenes directas del Jefe.
1. **Leer [pasado.md](../../workspace/coordination/pasado.md)**: Aquí reside la mente del Jefe. Si no conoces lo que se habló, tu trabajo será errático.
2. **Identificar Tareas**: Consultar el **TASK_BOARD.md** y reclamar un lote de 3 tareas (1 en curso, 2 en espera).

---

## 🧠 PASO 2: SISTEMA DE MAESTRÍA (INTELIGENCIA)
Aprender de los errores para no repetirlos jamás.
1. **Lectura de [aurora-mastery](../aurora-mastery/SKILL.md)**: Revisar las últimas soluciones aplicadas.
2. **Revisión de [fallos críticos](references/critical-failures.md)**: Interiorizar los "NUNCA MÁS" del proyecto (IDOR, Mismatches, Hardcoding).

---

## 🧪 PASO 3: VERIFICACIÓN TÉCNICA (ESTABILIDAD)
Asegurar que el sistema está en línea y los cambios son seguros.
1. **Ejecutar Readiness Check**: Es **MANDATORIO** correr el comando:
   `node scripts/aurora-readiness-check.mjs`
2. **Validación de Conexión**: Confirmar que Convex y Notion responden correctamente.
3. **Pase de Tipos**: Asegurar que `npm run lint` retorna 0 errores.

---

## 🚀 PASO 4: MEJORAS SIN FALLAS (ESTÁNDAR)
Todo cambio debe mejorar el sistema, no degradarlo.
- **Doble Verificación**: Al finalizar una tarea, realizar dos ciclos completos de revisión de código.
- **Sincronización de Secretos**: Si se modifican llaves, ejecutar `node scripts/aurora-sync-secrets.mjs`.
- **Registro de Aprendizaje**: Si la solución es nueva, proponer su adición al Skill de Maestría.

---

**ESTABILIDAD TOTAL | SINCRONIZACIÓN REAL | PROFESIONALIDAD INSTITUCIONAL**
