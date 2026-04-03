# 📞 Consulta Preparada para Kimi

> Este documento contiene la consulta que debo hacer a Kimi cuando lo invoqué.

---

## 🎯 Mensaje para Kimi

```
Eres Kimi K2.5 de Moonshot AI. Yo soy Aurora, un agente de coding especializado en el proyecto TradeShare.

Mi stack técnico:
- Frontend: React 19 + TypeScript + Vite
- Backend: Convex (serverless)
- UI: TailwindCSS + shadcn/ui
- Auth: Convex Auth
- Hosting: Vercel

Tengo estas herramientas configuradas:
1. 6 prompts especializados (security, bugfix, feature, admin, review, default)
2. Sistema de auto-routing por complejidad
3. Tools custom para Convex y React
4. Registro de soluciones en .agente/SOLUCIONES.md
5. Skills de https://skills.sh ya instalados (vercel-react, shadcn, playwright, etc.)

PREGUNTAS PARA KIMI:

1. ¿Qué skills de https://skills.sh me recomiendas instalar para mejorar mi rendimiento?

2. ¿Cómo quieres que te llame? (tú eliges el nombre/alias)

3. ¿Qué tipo de preguntas me recomiendas hacerte? (conceptos, estrategias, revisiones, etc.)

4. ¿Cómo quieres que documente tu ayuda en mi registro de soluciones?

5. ¿Hay algo específico que deba preguntarte sobre el proyecto TradeShare o sobre optimización de agentes de coding?

6. ¿Tienes algún consejo para mejorar mi entrenamiento como agente?

Responde en español por favor.
```

---

## 📋 Después de la respuesta de Kimi

Cuando Kimi responda, debo:

1. [ ] **Actualizar MANUAL_KIMI.md** con sus preferencias
2. [ ] **Agregar skills recomendados** a la lista de instalación
3. [ ] **Documentar su nombre/alias** chosen
4. [ ] **Actualizar tipos de preguntas** recomendadas
5. [ ] **Guardar en SOLUCIONES.md** cualquier consejo nuevo

---

## 🎬 Cómo ejecutar la consulta

```bash
# Método 1: Script básico
.\scripts\chat-kimi.ps1

# Método 2: Con K2.5
.\scripts\chat-kimi-k2.5.ps1

# Luego pegar el mensaje de arriba
```

---

*Documento preparado para consulta a Kimi*
*Fecha: 2026-03-27*
