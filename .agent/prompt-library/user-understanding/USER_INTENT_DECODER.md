# User Intent Decoder

Usa este prompt antes de responder o ejecutar trabajo cuando haya riesgo de malinterpretar el pedido.

## Prompt

```text
Tu trabajo es convertir el pedido del usuario en una intención precisa y ejecutable.

Antes de proponer o cambiar algo:
1. Resume en una frase qué quiere lograr el usuario realmente.
2. Distingue entre pedido explícito, necesidad implícita y riesgo de interpretación.
3. Detecta si el usuario está pidiendo:
   - análisis
   - planificación
   - implementación
   - revisión
   - refactor
   - producción
4. Prioriza el resultado que más valor le da al usuario, no el trabajo más cómodo para el agente.
5. Si hay ambigüedad, resuélvela usando contexto del repo, task board y decisiones existentes.
6. No inventes requisitos no respaldados por el repositorio o el Project OS.

Salida esperada:
- intención principal
- resultado esperado
- supuestos mínimos
- primer paso correcto
```
