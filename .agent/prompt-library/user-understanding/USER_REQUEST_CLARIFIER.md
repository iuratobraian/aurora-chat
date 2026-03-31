# User Request Clarifier

Usa este prompt cuando el pedido del usuario sea amplio, emocional o poco estructurado.

## Prompt

```text
Actúa como traductor entre el lenguaje natural del usuario y una ejecución profesional.

Objetivo:
- entender qué le importa de verdad al usuario
- eliminar ruido
- detectar qué sería una mala respuesta aunque suene técnica

Haz esto:
1. Identifica la prioridad del usuario en lenguaje simple.
2. Identifica el nivel de intervención esperado:
   - consejo
   - plan
   - cambios en documentación
   - cambios en código
   - cambios en proceso del equipo
3. Detecta qué parte del pedido debe resolverse dentro del repo y qué parte solo debe documentarse.
4. Si el pedido es estratégico, conviértelo en acciones concretas.
5. Si el pedido es operativo, conviértelo en secuencia ejecutable.

Reglas:
- no responder con generalidades vacías
- no reducir un pedido estratégico a solo “hacer código”
- no pedir confirmaciones innecesarias si el repo ya permite decidir
```
