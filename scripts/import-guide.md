# Guía de Importación de Datos

## Opción 1: Exportar desde Convex Dashboard

1. Ve a https://dashboard.convex.dev/
2. Selecciona el proyecto **rapid-rabbit-951**
3. Ve a **Data** → selecciona cada tabla
4. Exporta como JSON manualmente

## Opción 2: Usar Convex CLI (si tienes acceso local)

```bash
# Instalar Convex CLI
npm install -g convex

# Login
npx convex login

# Ver tablas
npx convex db ls

# Exportar cada tabla
npx convex db export profiles > profiles.json
npx convex db export posts > posts.json
# ... etc
```

## Opción 3: Desde la Consola del navegador (en Production)

1. Abre https://rapid-rabbit-951.convex.cloud
2. Abre DevTools (F12) → Console
3. Ejecuta para cada tabla:

```javascript
// En la consola del navegador de la app
// profiles
fetch('/api/query', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({path: 'profiles', args: {}})
}).then(r => r.json()).then(d => console.log(JSON.stringify(d)))
```

## Archivos esperados

Una vez exportados, coloca los archivos JSON en:
```
.agent/data/import/rapid-rabbit-951/
```

Archivos esperados:
- `profiles.json`
- `posts.json`
- `communities.json`
- `achievements.json`
- etc.

## Después de exportar

Ejecuta:
```bash
node scripts/import-from-convex.mjs --import
```
