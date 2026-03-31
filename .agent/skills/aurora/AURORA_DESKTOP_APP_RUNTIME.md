# Aurora Desktop App Runtime

## Objetivo

Convertir Aurora en una app de escritorio Windows simple de usar y fácil de mantener sobre el runtime local existente.

## Implementación actual

Aurora Desktop usa:

- `desktop/aurora-desktop.ps1`
- `desktop/aurora-desktop.cmd`
- `scripts/aurora-api.mjs`
- `/.agent/aurora/app/*`

## Cómo funciona

1. comprueba si `aurora-api` ya está viva
2. si no está viva, la arranca en background
3. abre una ventana WinForms
4. embebe la UI de Aurora en `http://localhost:4310/app`
5. al cerrar, apaga la API si fue lanzada por la app

## Ventajas

- no requiere dependencias nuevas
- corre sobre Windows nativo
- mantiene la UI local ya creada
- es fácil de evolucionar a Tauri o Electron después

## Limitaciones

- usa `WebBrowser` de WinForms en esta primera versión
- no tiene updater
- no tiene packaging instalable aún

## Comandos

- `npm run aurora:desktop`
- `desktop/aurora-desktop.cmd`

## Siguiente nivel

Cuando esta base quede estable:

1. encapsular con Tauri o Electron
2. agregar bandeja del sistema
3. agregar logs de escritorio
4. agregar settings persistentes
5. agregar vista de lotes multiagente

## Regla final

Aurora Desktop debe seguir siendo una consola de coordinación sobre el repo de desarrollo, no un bypass del Project OS.
