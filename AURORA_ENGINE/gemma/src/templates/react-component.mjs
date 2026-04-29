#!/usr/bin/env node
/**
 * Template: Componente React con TypeScript
 */

export default {
  name: 'react-component',
  description: 'Componente React funcional con TypeScript y buenas prácticas',
  prompt: `
Estructura de componente React esperada:

\`\`\`tsx
import React from 'react';

// 1. Types/Interfaces
interface ComponentProps {
  // props con tipos estrictos
}

// 2. Componente principal
export const ComponentName: React.FC<ComponentProps> = ({ ...props }) => {
  // hooks al inicio
  // lógica del componente
  // handlers
  // render
  return (
    <div>
      {/* JSX semántico y accesible */}
    </div>
  );
};

// 3. Export por defecto solo si es necesario
export default ComponentName;
\`\`\`

REGLAS:
- Props siempre tipadas explícitamente
- Custom hooks para lógica compleja
- Manejo de loading/error states
- Accesible por defecto (aria-*, semantic HTML)
- Tailwind para estilos
- No inline styles
- Funciones pequeñas (< 30 líneas)
- Comentarios solo para lógica no trivial

Genera un componente completo siguiendo estas convenciones.
`
};
