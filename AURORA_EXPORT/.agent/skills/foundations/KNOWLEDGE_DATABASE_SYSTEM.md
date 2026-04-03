# Knowledge Database System

## Objetivo

Definir una base de datos de información interna para guardar conocimiento útil, estructurado y reusable del repo.

## Qué guarda

- decisiones
- heurísticas
- anti-patrones
- patrones
- aprendizajes
- ideas priorizadas
- referencias
- prompts validados
- templates validados

## Qué no guarda

- ruido
- teoría ornamental
- duplicados
- opiniones sin impacto operativo

## Regla principal

Toda información persistente debe ser:

- verificable
- reusable
- breve
- accionable

## Estructura

- `../brain/db/knowledge_index.json`
- `../brain/db/heuristics.jsonl`
- `../brain/db/anti_patterns.jsonl`
- `../brain/db/patterns.jsonl`
- `../brain/db/ideas.jsonl`
- `../brain/db/references.jsonl`

## Flujo

1. detectar hallazgo
2. destilar
3. clasificar
4. guardar en la colección correcta
5. referenciar desde skills/templates si aplica

## Regla final

La base de conocimiento existe para acelerar decisiones y evitar repetir errores.
