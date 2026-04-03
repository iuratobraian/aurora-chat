# Growth Engine Systems

## Objetivo

Dar a los agentes una base clara para hacer crecer la app como una red social de inversionistas con retención fuerte, descubrimiento útil y confianza alta.

No se trata de copiar adicción.
Se trata de construir:

- hábito útil
- relevancia personalizada
- descubrimiento de valor
- reputación confiable
- comunidad durable

## Qué aprendemos de las plataformas top

### 1. No existe “un algoritmo”

Las plataformas grandes operan con múltiples superficies y múltiples rankers.

Lección:
- no intentar una única lógica de feed
- separar ranking por intención de uso

Superficies sugeridas para esta app:
- `feed principal`
- `señales y mercado`
- `comunidades`
- `aprendizaje`
- `descubrimiento`
- `mensajería / sala IA`

Cada una debe tener:
- objetivo
- señales
- reglas de elegibilidad
- fallback

### 2. El ranking usa señales de comportamiento, relación y calidad

Patrón común:
- interacción previa
- similitud temática
- recencia
- calidad esperada
- feedback explícito

Lección:
- el feed debe aprender de:
  - qué mira el usuario
  - qué guarda
  - qué comparte
  - qué ignora
  - qué reporta
  - a quién sigue
  - en qué comunidades participa

### 3. El usuario necesita control

Las plataformas top agregaron:
- `show more / show less`
- favoritos
- no me interesa
- filtros
- explicación del por qué se recomienda algo

Lección:
- no hacer caja negra total
- dar control fino mejora retención de calidad

### 4. El descubrimiento funciona mejor cuando está separado del grafo social puro

Feed y descubrimiento no son lo mismo.

Lección:
- separar contenido de:
  - gente que sigo
  - cuentas similares
  - contenido útil del mercado
  - oportunidades de aprendizaje

### 5. La conversación también se rankea

Comentarios y respuestas relevantes suben por:
- calidad
- likes
- replies
- afinidad
- verificación

Lección:
- rankear comentarios por valor
- destacar respuestas útiles, verificadas o con contexto técnico

### 6. Las mejores plataformas equilibran retención con seguridad

No todo lo que retiene conviene.

En inversión, copiar mal esto destruye producto.

No debemos optimizar por:
- ragebait financiero
- promesas irreales
- señales irresponsables
- publicaciones de alto estímulo pero bajo valor

## Traducción para una red social de inversionistas

## Superficies del producto

### Feed principal

Objetivo:
- mantener al usuario actualizado con contenido útil y confiable

Debe rankear por:
- relación con el autor
- calidad histórica del autor
- saves
- shares
- dwell time útil
- comentarios de calidad
- reputación y accuracy contextual
- recencia

No debe rankear por:
- engagement basura
- bait
- volumen puro

### Señales y mercado

Objetivo:
- entregar información accionable y contextual

Debe rankear por:
- relevancia del activo que sigue el usuario
- perfil del usuario
- calidad del proveedor
- win rate confiable
- claridad del setup
- actualidad

### Comunidades

Objetivo:
- profundizar pertenencia

Debe rankear por:
- participación reciente
- afinidad temática
- interacciones repetidas
- salud de la comunidad

### Academia

Objetivo:
- convertir curiosidad en progreso

Debe rankear por:
- nivel del usuario
- contenido ya visto
- siguiente mejor paso
- dificultad adecuada

### Descubrimiento

Objetivo:
- mostrar nuevas personas, ideas y herramientas

Debe rankear por:
- similitud temática
- credibilidad
- calidad sostenida
- novedad controlada

## Señales prioritarias para nuestro ecosistema

### Señales explícitas

- seguir
- guardar
- compartir
- calificar utilidad
- marcar no me interesa
- reportar
- agregar a favoritos

### Señales implícitas

- dwell time
- profundidad de lectura
- taps a perfil
- visitas repetidas a una comunidad
- repetición de consumo por activo o tema
- abandono temprano
- mute / ocultar

### Señales de calidad del autor

- reputación
- verificaciones
- precisión histórica
- consistencia
- ratio de reportes
- calidad de respuestas

### Señales de calidad del contenido

- claridad
- originalidad
- estructura
- guardados
- compartidos
- debate útil
- baja tasa de feedback negativo

## Mecanismos de retención sanos

Copiar:
- onboarding personalizado
- progreso visible
- recordatorios útiles
- favoritos
- contenidos relacionados
- streaks sanos
- metas semanales
- explicaciones de por qué se recomienda algo

No copiar:
- scroll infinito sin propósito
- estímulos vacíos
- notificaciones agresivas
- castigar al usuario por no volver
- oscuridad algorítmica

## Loop maestro para esta app

1. el usuario entra
2. ve contenido relevante de su mercado y nivel
3. encuentra una idea útil
4. guarda o comparte
5. participa en comunidad o academia
6. mejora su perfil y reputación
7. vuelve porque obtiene valor real

## Qué debe optimizar el algoritmo

Orden de métricas:
1. valor percibido
2. retención de calidad
3. profundidad de sesión
4. retorno semanal
5. guardados y compartidos útiles
6. creación de contenido valioso
7. upgrade a planes o herramientas

## Qué no debe optimizar

- likes vacíos
- tiempo bruto sin utilidad
- publicaciones tóxicas
- polémica financiera
- hype de corto plazo

## Controles de usuario obligatorios

- seguir / dejar de seguir
- favoritos
- no me interesa
- ocultar autor
- ocultar tema
- modo cronológico opcional
- ver por qué aparece un post
- configuración de intensidad de recomendaciones

## Módulos que los agentes deben construir

### 1. Relevance Layer

Puntaje por:
- affinity
- content quality
- recency
- community fit
- market relevance
- negative feedback

### 2. Trust Layer

Puntaje por:
- reputación
- verificaciones
- historial
- comportamiento
- flags de riesgo

### 3. Exploration Layer

Debe mezclar:
- contenido seguro ya conocido
- contenido nuevo de alta probabilidad
- serendipia controlada

### 4. Control Layer

Debe permitir:
- feedback explícito
- ajustes de feed
- trazabilidad ligera

## Tareas correctas para agentes

- diseñar ranking contracts
- crear eventos de feedback
- separar surfaces
- instrumentar métricas
- agregar controles del usuario
- rankear comentarios
- construir sistema de reputación sólido
- auditar health de comunidades

## Regla final

La app no debe crecer como casino social.
Debe crecer como red de inteligencia, reputación y utilidad para inversionistas.

## Referencias base

- Meta / Facebook Feed ranking:
  - https://about.fb.com/news/2018/05/inside-feed-news-feed-ranking/
  - https://about.fb.com/news/2022/10/new-ways-to-customize-your-facebook-feed/
  - https://about.fb.com/news/2025/04/cracking-down-spammy-content-facebook/amp/
  - https://about.fb.com/news/2016/08/news-feed-fyi-showing-you-more-personally-informative-stories/
  - https://about.fb.com/news/2021/08/widely-viewed-content-report/

- Meta / Instagram señales recientes de recomendaciones:
  - https://about.fb.com/news/2026/01/2026-ai-drives-performance/

- TikTok personalización y control del feed:
  - https://newsroom.tiktok.com/en/learn-why-a-video-is-recommended-for-you
  - https://support.tiktok.com/en/account-and-privacy/account-privacy-settings/refresh-your-for-you-feed/
  - https://newsroom.tiktok.com/en-gb/tiktok-trending-summer-2025-and-new-ways-to-shape-your-feed
  - https://newsroom.tiktok.com/en-us/limiting-unwanted-content

- YouTube recomendaciones responsables:
  - https://blog.youtube/inside-youtube/on-youtubes-recommendation-system/
  - https://blog.youtube/news-and-events/continuing-our-work-to-improve/
  - https://blog.youtube/news-and-events/giving-you-more-control-over-homepage
  - https://blog.youtube/responsibility/
