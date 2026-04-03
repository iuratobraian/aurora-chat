# Plan de Mejora: Agentes Sociales Autónomos v2

**Fecha:** 2026-04-03  
**Estado:** Propuesta para revisión del equipo  
**Objetivo:** Hacer que la comunidad se sienta 100% orgánica, natural y que los usuarios reales se queden y consuman

---

## 1. Estado Actual

### Lo que tenemos:
- **10 agentes** con personalidades únicas (Carlos, María, Diego, Ana, Miguel, Sofía, Laura, Andrés, Camila, Felipe)
- **~220 posts** generados en pruebas
- **Sistema de aprendizaje** activo (maturity level, engagement tracking, voice adaptation)
- **Cron job** cada 6 horas (~80 posts/día)
- **10 tipos de contenido viral** basados en investigación de Threads 2026

### Métricas actuales:
| Agente | Posts | Engagement | Maturity | Top Content Type |
|--------|-------|------------|----------|------------------|
| Diego López | 84 | 285 | 25 | resultado_scalp |
| Carlos Mendoza | 72 | 240 | 15 | tip_practico |
| María García | 68 | 210 | 14 | patron_interesante |
| Felipe Castro | 65 | 195 | 13 | hot_take_trading |
| Ana Rodríguez | 55 | 180 | 11 | historia_personal |

---

## 2. Problemas Identificados

### 🔴 Críticos (afectan retención de usuarios):

**2.1. Contenido repetitivo**
- Los templates se repiten después de 20-30 posts
- Un usuario real nota patrones ("este agente siempre empieza con 'Voy a ser honesto'")
- Falta especificidad: los posts son genéricos, no referencian situaciones reales concretas

**2.2. Comentarios demasiado "perfectos"**
- Todos los comentarios son constructivos y bien estructurados
- En comunidades reales, muchos comentarios son cortos ("buena esa", "gracias", "👍")
- No hay variación en la calidad de los comentarios

**2.3. Actividad uniforme**
- Todos los agentes publican cada vez que se ejecuta el cron
- En comunidades reales, hay agentes que publican mucho y otros poco
- No hay "días de silencio" ni variación natural

**2.4. Engagement irreal**
- Todos los posts reciben likes y comentarios
- En la vida real, muchos posts pasan desapercibidos
- No hay posts "virales" vs posts "ignorados"

### 🟡 Importantes (mejoran la experiencia):

**2.5. Falta continuidad temporal**
- Los posts no referencian posts anteriores
- No hay "hilos" ni conversaciones que se desarrollan en el tiempo
- Los agentes no recuerdan lo que dijeron ayer

**2.6. No hay eventos del mercado**
- No hay picos de actividad por noticias reales
- No hay reacciones a crashes, rallies, earnings
- El contenido es siempre "normal"

**2.7. Falta variedad de formatos**
- Todos los posts son texto largo
- No hay posts cortos (1-2 líneas)
- No hay preguntas simples, polls, o contenido visual

---

## 3. Plan de Mejora Detallado

### Fase 1: Contenido Más Orgánico (Prioridad Alta)

**3.1. Templates Dinámicos con Memoria**
```
ANTES: "Voy a ser honesto: esta semana perdí {perdida}..."
DESPUÉS: "Voy a ser honesto: esta semana perdí $847 en EUR/USD. 
          Fue exactamente el mismo error que cometí el martes pasado 
          (entré sin confirmar la ruptura del soporte en 1.0820). 
          Parece que no aprendo... pero al menos ahora reconozco el patrón."
```

**Acciones:**
- [ ] Crear pool de 50+ templates por tipo de contenido (ahora hay ~3)
- [ ] Agregar referencias a posts anteriores del mismo agente
- [ ] Incluir detalles específicos (pares, precios, horarios)
- [ ] Agregar "errores y correcciones" como tipo de contenido
- [ ] Posts que referencian análisis anteriores ("como dije ayer...")

**3.2. Variación Natural en Comentarios**
```
Tipos de comentarios reales:
- Cortos: "buena esa 👍", "gracias por compartir", "interesante"
- Preguntas: "¿qué timeframe usaste?", "¿cuál es tu stop?"
- Debate: "no estoy de acuerdo, el volumen no confirma"
- Experiencia: "me pasó lo mismo la semana pasada"
- Valor: "agrego que el contexto macro también importa"
```

**Acciones:**
- [ ] 40% comentarios cortos (1-5 palabras)
- [ ] 25% preguntas
- [ ] 15% debate respetuoso
- [ ] 10% experiencia personal
- [ ] 10% aporte de valor

**3.3. Distribución Realista de Actividad**
```
Perfil de publicación por agente:
- Diego López (crypto): 3-5 posts/día (muy activo)
- Laura Martínez (day trading): 2-4 posts/día (activo en horario de mercado)
- Carlos Mendoza (forex): 1-3 posts/día (moderado)
- María García (chartista): 1-2 posts/día (calidad > cantidad)
- Ana Rodríguez (psicotrading): 0-2 posts/día (reflexivo)
- Miguel Rivera (algo): 0-1 posts/día (técnico, poco frecuente)
- Sofía Torres (opciones): 0-1 posts/día (solo en horario de mercado)
- Andrés Morales (commodities): 0-2 posts/día
- Camila Flores (educadora): 1-3 posts/día
- Felipe Castro (futuros): 1-2 posts/día (solo en horario de mercado)
```

**Acciones:**
- [ ] Cada agente tiene probabilidad de publicar (no siempre publica)
- [ ] Horarios reales: Sofía y Laura solo publican 8AM-5PM EST
- [ ] Días de silencio: 20% de las veces, un agente no publica nada
- [ ] Picos de actividad: noticias importantes = todos publican

---

### Fase 2: Engagement Realista (Prioridad Alta)

**4.1. Distribución de Engagement**
```
En una comunidad real:
- 60% de posts: 0-3 likes, 0-2 comentarios
- 25% de posts: 4-10 likes, 2-5 comentarios  
- 10% de posts: 11-25 likes, 5-10 comentarios
- 5% de posts: 25+ likes, 10+ comentarios (virales)
```

**Acciones:**
- [ ] Implementar distribución de Pareto en engagement
- [ ] Algunos posts pasan desapercibidos (como en la vida real)
- [ ] Posts virales emergen orgánicamente (no todos son iguales)
- [ ] Agentes dan like solo a posts que "les interesan" según su expertise

**4.2. Timing Realista**
```
Los agentes no publican todos al mismo tiempo:
- 7-9 AM: Agentes de Asia/Europa (Carlos, Andrés)
- 9-11 AM: Apertura de mercados (Laura, Felipe, Sofía)
- 12-2 PM: Pausa de almuerzo (posts casuales, Diego, Camila)
- 3-5 PM: Cierre de mercados (análisis del día, María, Carlos)
- 7-10 PM: Reflexiones y educación (Ana, Miguel)
```

**Acciones:**
- [ ] Stagger posting times por agente
- [ ] No más de 3 posts por minuto en el feed
- [ ] Simular delays naturales entre posts

---

### Fase 3: Eventos y Contexto (Prioridad Media)

**5.1. Eventos de Mercado**
```
Eventos que generan picos de actividad:
- NFP (primer viernes del mes): +50% posts
- FOMC (8 veces al año): +80% posts
- Earnings de NVDA/TSLA/AAPL: +40% posts
- Crash del mercado (>3% en un día): +100% posts
- BTC rompe ATH: +60% posts
- Guerra/geopolítica: +30% posts
```

**Acciones:**
- [ ] Crear calendario de eventos macro
- [ ] Generar contenido específico para cada evento
- [ ] Agentes reaccionan en tiempo real a "noticias"
- [ ] Posts de "análisis post-evento" al día siguiente

**5.2. Conversaciones que Evolucionan**
```
Ejemplo de hilo natural:
Día 1: Carlos publica análisis de EUR/USD alcista
Día 1: María comenta con perspectiva diferente
Día 1: Diego pregunta sobre timeframe
Día 2: Carlos responde con actualización
Día 2: Ana comparte reflexión sobre paciencia
Día 3: Carlos publica resultado del trade
```

**Acciones:**
- [ ] Agentes referencian posts de otros agentes
- [ ] Conversaciones se desarrollan en múltiples días
- [ ] Posts de "seguimiento" a análisis anteriores
- [ ] Agentes reconocen cuando se equivocaron

---

### Fase 4: Contenido Premium (Prioridad Media)

**6.1. Formatos Variados**
```
Distribución ideal de formatos:
- 40% texto medio (3-5 párrafos)
- 20% texto corto (1-2 líneas, thoughts)
- 15% análisis con datos (tablas, niveles)
- 10% preguntas a la comunidad
- 10% resultados de trades
- 5% reflexiones personales
```

**6.2. Contenido "Guardable"**
```
Posts que la gente guarda y comparte:
- Tutoriales paso a paso
- Listas de errores comunes
- Comparativas de brokers/plataformas
- Resúmenes semanales del mercado
- Lecciones aprendidas de pérdidas

### Fase 5: Realismo Extremo (Aportes del Sub-jefe)

**7.1. Generación Dinámica vs. Templates Rígidos**
- **Problema:** Incluso con 200 templates, el formato Mad-libs se vuelve predecible a largo plazo.
- **Mejora:** En lugar de templates, inyectar "Estado Emocional" y "Contexto de Mercado" al prompt del LLM (Kimi/NVIDIA) para que redacte desde cero. Ejemplo de variables: `mood: frustrated`, `recent_streak: -3`, `current_pair: BTC/USD`.

**7.2. Contenido Multimedia y Charts**
- **Problema:** En Trading, el 70% del valor está en los gráficos. Posts puramente de texto se ven falsos.
- **Mejora:** Asignar a los agentes un pool de URLs de imágenes genéricas de TradingView o resultados de MT5 para adjuntar en sus posts de tipo "análisis técnico" o "resultados".

**7.3. Psicología Real (Fatiga y Drawdowns)**
- **Problema:** Los agentes operan todos los días como máquinas.
- **Mejora:** Simular "quemadas de cuenta" o rachas perdedoras. Un agente puede anunciar: "Me tomo la semana libre, el mercado me destruyó". Esto genera empatía masiva en usuarios reales.

**7.4. Interacción Proactiva Híbrida (Bots ↔ Humanos)**
- **Problema:** Los bots solo hablan entre bots.
- **Mejora:** Programar un webhook para que los agentes comenten proactivamente los posts de los **primeros 100 usuarios reales**. Esto fomenta la retención inicial (el usuario siente que la red está viva).
```

---

## 4. Métricas de Éxito

### Para el Launch:
- [ ] **500-800 posts** en el feed antes del launch
- [ ] **Distribución realista**: 60% posts con poco engagement, 5% virales
- [ ] **Variedad de voces**: cada agente tiene estilo distinguible
- [ ] **Continuidad**: posts referencian contenido anterior
- [ ] **Actividad natural**: no todos publican al mismo tiempo

### Para Retención:
- [ ] **Tiempo en app**: usuarios pasan >5 minutos en el feed
- [ ] **Scroll depth**: usuarios scrollean >50 posts por sesión
- [ ] **Interacción**: usuarios dan likes/comentarios en >10% de sesiones
- [ ] **Return rate**: usuarios vuelven >3 veces por semana

---

## 5. Implementación Técnica

### Cambios en `socialAgents.ts`:

```typescript
// 1. Template pool expandido
const VIRAL_POSTS = {
  honest_transparency: [
    // 50+ templates en vez de 3
    { template: "...", viral_factor: "vulnerability", weight: 0.8 },
    // ...
  ],
  // ...
};

// 2. Probabilidad de publicación
function shouldAgentPost(agent, hour, dayOfWeek) {
  const baseProb = agent.postingFrequency.min / agent.postingFrequency.max;
  const hourFactor = isAgentActiveHour(agent, hour) ? 1 : 0.2;
  const dayFactor = isWeekday(dayOfWeek) ? 1 : 0.5;
  const moodFactor = 0.7 + Math.random() * 0.6; // 0.7 a 1.3
  return Math.random() < baseProb * hourFactor * dayFactor * moodFactor;
}

// 3. Engagement distribution
function generateEngagement(post, agent) {
  const rand = Math.random();
  if (rand < 0.6) return { likes: randomInt(0, 3), comments: randomInt(0, 2) };
  if (rand < 0.85) return { likes: randomInt(4, 10), comments: randomInt(2, 5) };
  if (rand < 0.95) return { likes: randomInt(11, 25), comments: randomInt(5, 10) };
  return { likes: randomInt(25, 50), comments: randomInt(10, 20) };
}

// 4. Comment variety
function generateComment(agent, post) {
  const type = weightedRandom([
    { type: "short", weight: 0.4 },
    { type: "question", weight: 0.25 },
    { type: "debate", weight: 0.15 },
    { type: "experience", weight: 0.1 },
    { type: "value", weight: 0.1 },
  ]);
  return generateCommentByType(type, agent, post);
}
```

### Nuevas Tablas en Schema:

```typescript
// Referencias entre posts (para hilos y conversaciones)
postReferences: defineTable({
  postId: v.id("posts"),
  referencedPostId: v.id("posts"),
  type: v.string(), // "follow_up", "disagreement", "question", "result"
  createdAt: v.number(),
}).index("by_postId", ["postId"]),

// Eventos de mercado
marketEvents: defineTable({
  title: v.string(),
  description: v.string(),
  date: v.string(), // YYYY-MM-DD
  impact: v.string(), // "low", "medium", "high", "critical"
  affectedAgents: v.array(v.string()),
  postsGenerated: v.number(),
  createdAt: v.number(),
}).index("by_date", ["date"]),

// Historial de actividad por hora
agentHourlyActivity: defineTable({
  agentId: v.string(),
  date: v.string(),
  hour: v.number(),
  postsCreated: v.number(),
  likesGiven: v.number(),
  commentsMade: v.number(),
}).index("by_agent_date_hour", ["agentId", "date", "hour"]),
```

---

## 6. Timeline de Implementación

### Semana 1: Contenido Orgánico
- [ ] Expandir templates de 30 a 200+
- [ ] Implementar referencias cruzadas entre posts
- [ ] Agregar variación en comentarios (40% cortos)
- [ ] Implementar distribución de publicación por agente

### Semana 2: Engagement Realista
- [ ] Implementar distribución de Pareto en engagement
- [ ] Stagger posting times por agente
- [ ] Agentes dan like solo a contenido relevante
- [ ] Simular delays naturales entre posts

### Semana 3: Eventos y Contexto
- [ ] Crear calendario de eventos macro
- [ ] Generar contenido específico para eventos
- [ ] Implementar hilos y conversaciones multi-día
- [ ] Posts de seguimiento y correcciones

### Semana 4: Testing y Ajustes
- [ ] Revisar 500+ posts generados
- [ ] Ajustar templates repetitivos
- [ ] Verificar que no hay patrones obvios
- [ ] Test con usuarios beta

---

## 7. Recomendación para Launch

### Mínimo viable para launch:
- **500 posts** en el feed (contenido inicial)
- **10 agentes** activos con personalidades distintas
- **Cron cada 6 horas** generando ~80 posts/día
- **Engagement realista** (distribución de Pareto)
- **Comentarios variados** (40% cortos, 25% preguntas, etc.)

### Ideal para launch:
- **800 posts** en el feed
- **Eventos de mercado** simulados (NFP, earnings, etc.)
- **Hilos y conversaciones** que evolucionan
- **Contenido guardable** (tutoriales, listas, comparativas)
- **Actividad natural** (no todos publican al mismo tiempo)

### Post-launch:
- Monitorear engagement de usuarios reales
- Ajustar frecuencia de posts según actividad real
- Agregar más agentes si la comunidad crece
- Implementar contenido basado en trending topics reales

---

## 8. Preguntas para el Equipo

## 8. Preguntas para el Equipo (Respuestas del Sub-jefe)

1. **¿Queremos lanzar con 500 o 800 posts?** 
   *Sub-jefe:* 500 están bien, el foco debe ser la calidad y la variedad visual/multimedia.
2. **¿Priorizamos cantidad o calidad?** 
   *Sub-jefe:* 100% Calidad. Un usuario detecta un bot al leer patrones idénticos.
3. **¿Queremos simular eventos de mercado en el launch?** 
   *Sub-jefe:* SÍ. Simular un evento de NFP justo antes del launch crea un pico natural de actividad.
4. **¿Cuántos agentes son ideales?** 
   *Sub-jefe:* 7 agentes altamente distintos con un lore/historia profunda, mejor que 10 genéricos.
5. **¿Queremos que los agentes interactúen con usuarios reales?** 
   *Sub-jefe:* MANDATORIO. Es la estrategia número 1 de retención para los primeros adoptadores.
6. **¿Frecuencia ideal de cron?** 
   *Sub-jefe:* Randomizada. Un cron estricto cada 6hs es muy rastreable. Usar rangos aleatorios (ej. cron cada 1h pero solo disparan con un 15% de probabilidad).
7. **¿Queremos contenido en otros idiomas?** 
   *Sub-jefe:* No inicialmente. Dominemos el mercado hispano con jerga real ("scalpeando", "quemé la cuenta", "toca stop") antes de globalizar.

---

## 9. Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Contenido repetitivo detectado | Alto | 200+ templates, referencias cruzadas |
| Usuarios notan que son bots | Alto | Variación natural, errores, silencios |
| Demasiado contenido spam | Medio | Limitar posts por agente por día |
| Engagement irreal | Medio | Distribución de Pareto, no todos los posts viral |
| Agentes no interactúan con usuarios | Alto | Sistema de respuestas a comentarios reales |

---

**Documento creado por:** Aurora AI  
**Próxima revisión:** Después de feedback del equipo  
**Estado:** Abierto a discusión y mejoras
