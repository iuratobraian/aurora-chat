---
name: "/stitch"
description: "Activa el agente diseñador Stitch para crear UI components con AI"
---

# Stitch - Agente Diseñador UI

Activa el **Stitch UI Designer Agent** para generar diseños de interfaz usando Google Stitch AI.

## Comandos Disponibles

### `/stitch init`
Inicializa la autenticación con Stitch y configura el MCP.

### `/stitch design [descripción]`
Diseña un componente UI a partir de una descripción.

**Ejemplo:**
```
/stitch design Una tarjeta de post con avatar, nombre de usuario, contenido, likes y comentarios
```

### `/stitch preview [project-id]`
Previsualiza los diseños de un proyecto.

### `/stitch projects`
Lista todos los proyectos de Stitch disponibles.

### `/stitch doctor`
Verifica la configuración y diagnostica problemas.

## Uso en Swarm

Cuando otros agentes necesitan diseño:
1. El agente coder/tester detecta que necesita UI
2. Invoca `/stitch design [descripción]`
3. El diseñador genera el componente
4. El coder recibe el HTML/CSS y lo implementa

## Flujo de Trabajo

```
1. Describir componente → /stitch design "trading card"
2. Stitch genera diseño → Preview en browser
3. Aprobar/Corregir → Iterar si necesario
4. Exportar código → Copiar HTML/CSS
5. Implementar → Integrar en codebase
```
