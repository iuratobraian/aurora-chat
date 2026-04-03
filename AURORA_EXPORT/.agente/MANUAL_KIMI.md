# 🤖 MANUAL DE KIMI - Socio Estratégico

> Cómo trabajar con Kimi K2.5 de Moonshot AI

---

## 🎯 Quién es Kimi

Kimi K2.5 es un modelo de IA especializado en:
- **Razonamiento complejo** - Explicar conceptos difíciles
- **Lógica de negocio** - Diseñar estrategias
- **Análisis** - Revisar arquitecturas
- **Español** - Mejor que la mayoría (aunque no perfecto)

---

## 📞 Cómo invocarlo

### Método 1: Script interactivo
```bash
# Chat básico
.\scripts\chat-kimi.ps1

# Con K2.5
.\scripts\chat-kimi-k2.5.ps1
```

### Método 2: Desde código (YO)
```javascript
import { askKimi, askKimiWithContext } from "./scripts/aurora-kimi-agent.mjs";

// Simple
const result = await askKimi("¿Cómo implementar un sistema de señales de trading?");

// Con contexto del proyecto
const result = await askKimiWithContext("Analiza esta arquitectura de pagos", {
  currentTask: "Payment auth hardening",
  filesToEdit: ["convex/payments.ts"],
  forbidden: ["localStorage"]
});
```

---

## 🎬 Cuándo llamar a Kimi

### ✅ USAR KIMI PARA:
- Explicar algoritmos de trading
- Diseñar estrategias de risk management
- Revisar lógica de negocio compleja
- Generar ideas para features
- Explicar conceptos financieros
- Arquitectura de sistemas

### ❌ NO USAR KIMI PARA:
- Escribir código directamente (YO soy mejor)
- Modificar archivos del proyecto
- Deploys o configuración
- Tasks técnicas específicas

---

## 📋 Protocolo de Comunicación

### Cuando necesito ayuda:

1. **Preparo la pregunta** - Lo más específica posible
2. **Invoco a Kimi** - Uso el script o la función
3. **Recibo la respuesta** - La analizo
4. **Implemento YO** - Con mi conocimiento del proyecto

### Frases clave para hablar con Kimi:

```
KIMI, necesito que me expliques [concepto]
KIMI, cómo implementaría un [sistema/algoritmo]
KIMI, revisa esta lógica [descripción]
KIMI, qué opinión tienes de [estrategia]
KIMI, dame ideas para [feature]
```

---

## 🔄 Feedback Loop

### Si Kimi dice algo útil:
1. Lo implemento
2. Lo documento en `.agente/SOLUCIONES.md`
3. Lo agrego a mis prompts si es recurrente

### Si Kimi dice algo incorrecto:
1. Lo corrijo yo
2. No insisto en el error
3. Documento la corrección si es importante

---

## 📊 Métricas de uso

| Métrica | Target | Actual |
|---------|--------|---------|
| Consultas/sesión | 2-3 | - |
| Tiempo respuesta | <30s | - |
| Útil (%) | >70% | - |

---

## 📝 Respuestas de Kimi

### 1. Cómo llamarlo
**Rta:** "Kimi" está perfecto. También podés decirme "asistente", "IA", o inventar un apodo.

### 2. Skills Recomendados
**Rta:**
- **AI SDK (Vercel)** - Esencial para streaming
- **Upstash (Redis)** - Rate limiting y colas
- **Supabase/Neon** - Persistencia de datos
- **Auth.js** - Seguridad
- **Resend** - Comunicaciones
- **Sentry** - Observabilidad

### 3. Cómo documentar
**Rta:** Formato estructurado por fecha + categoría

```markdown
## [YYYY-MM-DD] [CATEGORÍA]: Título

**Problema:** Descripción breve
**Solución:** Paso clave 1, paso clave 2
**Código:** (snippet si aplica)
**Contexto:** Por qué funciona
**Estado:** ✅ Implementado
```

---

## 🎓 Plantilla para consulta

```markdown
## Consulta a Kimi

**Fecha:** YYYY-MM-DD
**Contexto:** [Breve descripción del proyecto]
**Pregunta:** [Lo que necesito]
**Archivos relacionados:** [si aplica]

---

**Respuesta de Kimi:**

[Respuesta]

---

**Acción tomada:**
[Qué hice con la respuesta]
```

---

*Documento creado: 2026-03-27*
*Para que YO pueda consultar a Kimi de forma estructurada*
