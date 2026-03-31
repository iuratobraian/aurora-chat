---
description: Sincroniza los cambios con GitHub y hace deploy en Convex
---

// turbo-all

Este workflow se encarga de guardar automáticamente tus cambios importantes en GitHub y subirlos a tu servidor de Convex para reflejarlos en producción.

Sigue estos pasos ordenadamente (todos con turbo activado):

1. Pídele al usuario un resumen rápido de los cambios, o genera uno tú mismo si tienes todo el contexto.
2. Agrega los cambios al staging:
`git add .`
3. Haz un commit con el mensaje adecuado:
`git commit -m "chore: actualizacion y pase a produccion"` (o cambia el mensaje acorde a tu resumen)
4. Sube los cambios al repositorio remoto:
`git push`
5. Finalmente, despliega la base de datos y backend al servidor en la nube de Convex:
`npx convex deploy` 
