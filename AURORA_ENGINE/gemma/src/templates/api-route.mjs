#!/usr/bin/env node
/**
 * Template: Ruta API
 */

export default {
  name: 'api-route',
  description: 'Ruta API RESTful con validación y manejo de errores',
  prompt: `
Estructura de ruta API esperada:

\`\`\`typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// Schemas de validación
const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
});

// GET - Listar recursos
app.get('/', async (c) => {
  try {
    // Lógica de consulta
    return c.json({ data: [] });
  } catch (error) {
    console.error('Error listing items:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET - Obtener recurso por ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    // Lógica de consulta
    return c.json({ data: {} });
  } catch (error) {
    return c.json({ error: 'Not found' }, 404);
  }
});

// POST - Crear recurso (con validación)
app.post('/', zValidator('json', CreateItemSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    // Lógica de creación
    return c.json({ data: { id: '123', ...data } }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

// PUT - Actualizar recurso
app.put('/:id', zValidator('json', CreateItemSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    // Lógica de actualización
    return c.json({ data: { id, ...data } });
  } catch (error) {
    return c.json({ error: 'Not found' }, 404);
  }
});

// DELETE - Eliminar recurso
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    // Lógica de eliminación
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Not found' }, 404);
  }
});

export default app;
\`\`\`

REGLAS:
- Validar inputs con Zod
- Responder con códigos HTTP correctos (200, 201, 400, 404, 500)
- Formato de respuesta consistente: { data } o { error }
- Manejar errores explícitamente
- Loguear errores en servidor
- No exponer detalles internos en respuestas de error
- Usar middlewares para autenticación cuando aplique
- Documentar endpoints con comentarios

Genera una ruta API completa siguiendo estas convenciones.
`
};
