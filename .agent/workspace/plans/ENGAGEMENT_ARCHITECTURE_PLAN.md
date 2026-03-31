# Engagement Architecture Plan

## Objetivo

Convertir el producto en un ecosistema con:
- retención alta
- contenido útil
- crecimiento sano
- descubrimiento fuerte
- confianza fuerte

## Inspiración operativa

Basado en patrones observables de:
- Facebook Feed y comment ranking
- TikTok For You y controles del feed
- YouTube responsibility + ecosistema saludable

## Arquitectura sugerida

### Layer 1: Identity

- perfil del usuario
- nivel
- intereses
- watchlist
- comunidades
- comportamiento reciente

### Layer 2: Content graph

- autores
- temas
- activos
- comunidades
- tipo de contenido
- relación contenido-resultado

### Layer 3: Ranking

- feed ranker
- comments ranker
- discovery ranker
- signals ranker
- academy next-best-step ranker

### Layer 4: Trust

- reputación
- verificación
- score de calidad
- score de riesgo

### Layer 5: Controls

- favorites
- not interested
- hide author
- hide topic
- recommendation reason
- chronologic option

### Layer 6: Growth loops

- save/share loop
- community participation loop
- learning loop
- creator loop
- referral loop

## Prioridades de ejecución

### GROW-001
- definir surfaces y objetivos de ranking

### GROW-002
- instrumentar eventos clave

### GROW-003
- construir feedback explícito del usuario

### GROW-004
- rankear comentarios y respuestas útiles

### GROW-005
- crear trust layer para autores y señales

### GROW-006
- discovery controlado para cuentas y contenido

### GROW-007
- academia personalizada por nivel y progreso

## KPIs sugeridos

- D1 / D7 / D30 retention
- guardados por sesión
- shares útiles
- comentarios útiles
- seguidores de calidad
- sesiones por comunidad
- completion de aprendizaje
- ratio de feedback negativo

## Anti-KPIs

- crecimiento por contenido tóxico
- tiempo bruto sin utilidad
- ratio alto de ocultar / reportar
- creators de alto ruido y baja confianza
