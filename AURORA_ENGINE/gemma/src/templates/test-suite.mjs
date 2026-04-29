#!/usr/bin/env node
/**
 * Template: Suite de Tests con Vitest
 */

export default {
  name: 'test-suite',
  description: 'Suite de tests completa con Vitest y buenas prácticas',
  prompt: `
Estructura de tests esperada:

\`\`\`typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { functionName } from './module-to-test';

// Mocks de dependencias externas
vi.mock('dependency-module', () => ({
  externalFunction: vi.fn(),
}));

describe('moduleName', () => {
  // Setup/teardown
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('functionName', () => {
    it('should return expected value with valid input', () => {
      // Arrange
      const input = 'valid-input';
      const expected = 'expected-output';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle edge case: null input', () => {
      // Arrange
      const input = null;

      // Act & Assert
      expect(() => functionName(input)).toThrow();
    });

    it('should handle edge case: empty input', () => {
      // Arrange
      const input = '';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBeDefined();
    });

    it('should call external dependency with correct args', () => {
      // Arrange
      const mockFn = vi.fn();
      
      // Act
      functionName('input', mockFn);

      // Assert
      expect(mockFn).toHaveBeenCalledWith('expected-arg');
    });

    it('should throw error when precondition fails', () => {
      // Arrange
      const invalidInput = 'invalid';

      // Act & Assert
      expect(() => functionName(invalidInput)).toThrow('Expected error message');
    });
  });
});
\`\`\`

REGLAS:
- Organizar con describe por función/módulo
- Nombres descriptivos en inglés (should_..._when_...)
- Patrón AAA (Arrange-Act-Assert)
- Mockear dependencias externas
- Probar happy path Y edge cases
- Un assertion por concepto (pueden ser varios si verifican lo mismo)
- Tests independientes (sin estado compartido)
- Usar vi.fn() para mocks, vi.mock() para módulos
- beforeEach para limpiar mocks

Genera tests completos siguiendo estas convenciones.
`
};
