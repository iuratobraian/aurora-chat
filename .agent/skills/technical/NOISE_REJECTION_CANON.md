# Noise Rejection Canon

## Objetivo

Dejar explícito qué es ruido dentro del repo y qué sí debe entrar como señal valiosa para multiplicar el crecimiento de Aurora Core.

## Regla principal

Aurora Core no crece por acumular texto.
Crece por acumular señal reutilizable.

## Todo lo que debe ignorar como ruido

### 1. Texto sin impacto operativo

- teoría general sin aplicación
- explicaciones largas que no cambian decisiones
- resúmenes que no dejan siguiente paso

### 2. Motivación vacía

- frases inspiracionales
- hype
- grandilocuencia
- promesas de superioridad sin sistema

### 3. Duplicación

- repetir la misma regla en múltiples archivos sin valor extra
- copiar ideas ya registradas
- clonar checklists sin adaptación

### 4. Suposiciones no verificadas

- datos sin fuente
- arquitectura imaginada como si fuera hecho
- métricas inventadas
- afirmaciones absolutas sin evidencia

### 5. Consejos sin contexto

- “mejores prácticas” genéricas
- tips sueltos sin módulo, riesgo o caso de uso
- recetas que no dicen cuándo no aplican

### 6. Output bonito pero inútil

- listas largas sin prioridad
- documentación ornamental
- taxonomías que no cambian ejecución
- ideas que no pasan a spec o template

### 7. Aprendizajes falsos

- registrar algo una sola vez como si fuera patrón
- guardar workarounds temporales como doctrina
- confundir parche con solución

### 8. Ruido emocional

- urgencia teatral
- presión sin claridad
- dramatización del problema
- cierre triunfal sin validación

### 9. Ruido de producto

- features sin relación con el core
- ideas “cool” sin usuario, negocio ni validación
- crecimiento basado en vanity metrics

### 10. Ruido técnico

- abstraer demasiado pronto
- complejidad sin necesidad
- herramientas nuevas sin problema claro
- refactors sin criterio

## Qué sí debe entrar como señal valiosa

### 1. Heurísticas

- reglas cortas
- repetibles
- útiles en más de una tarea

### 2. Anti-patrones

- errores que ya costaron tiempo
- trampas de arquitectura
- fallas repetidas de proceso

### 3. Contratos

- source of truth
- entradas
- salidas
- invariantes

### 4. Validaciones

- checks que detectan fallas reales
- criterios de aceptación
- señales de salida

### 5. Decisiones

- qué se eligió
- por qué
- con qué tradeoff

### 6. Playbooks

- secuencias probadas
- runbooks
- pasos de diagnóstico

### 7. Templates

- estructuras que reducen ambigüedad
- formatos que ahorran tiempo

### 8. Fuentes confiables

- docs oficiales
- engineering blogs oficiales
- estado real del repo

## Regla de entrada al cerebro

Una pieza de información solo merece entrar si:

1. evita un error
2. acelera una tarea
3. mejora una decisión
4. aclara una arquitectura
5. mejora calidad o seguridad

Si no cumple al menos una, es ruido.

## Regla final

Aurora Core debe preferir siempre:

- menos información
- más verdad
- más estructura
- más reutilización
