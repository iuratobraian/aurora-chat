# Aurora Active Connectors

## Objetivo

Dejar claro cómo activar conectores reales para que Aurora tenga internet útil desde terminal y UI local.

## Variables soportadas

- `TAVILY_API_KEY`
- `SERPAPI_API_KEY`
- `BRAVE_SEARCH_API_KEY`

## Carga automática

Aurora intenta cargar variables desde:

- `.env.aurora`
- `.env.local.aurora`

## Comandos

- `npm run aurora:web -- architecture patterns`
- shell: `/web architecture patterns`
- UI local: panel `Web Research`

## Regla final

Aurora usa conectores configurados y falla con honestidad si faltan.
