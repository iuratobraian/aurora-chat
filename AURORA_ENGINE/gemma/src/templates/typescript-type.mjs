#!/usr/bin/env node
/**
 * Template: Tipos e Interfaces TypeScript
 */

export default {
  name: 'typescript-type',
  description: 'Tipos e interfaces TypeScript estrictos y bien diseñados',
  prompt: `
Estructura de tipos TypeScript esperada:

\`\`\`typescript
// 1. Interfaces para objetos principales
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// 2. Types para unions y mapped types
export type UserRole = 'admin' | 'user' | 'moderator';

export type UserStatus = 'active' | 'inactive' | 'suspended';

// 3. Interfaces con propiedades opcionales
export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
  metadata?: Record<string, unknown>;
}

// 4. Types para request/response
export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// 5. Type guards
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'name' in obj
  );
}

// 6. Utility types
export type UserWithoutSensitiveData = Omit<User, 'password' | 'ssn'>;

export type UserWithStatus = User & { status: UserStatus };

export type PartialUser = Partial<User>;

export type ReadonlyUser = Readonly<User>;
\`\`\`

REGLAS:
- Interfaces para objetos, types para unions/mapped
- Prefiere interface para objetos que se extienden
- Usa type para unions, intersections, utilities
- Siempre exporta tipos que son parte de API pública
- Evita \`any\`, usa \`unknown\` y type guards
- Omit/Pick/Partial para transformar tipos existentes
- Type guards para validación runtime
- Record<string, unknown> para objetos genéricos
- Readonly para datos inmutables

Genera tipos completos siguiendo estas convenciones.
`
};
