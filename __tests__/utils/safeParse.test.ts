import { describe, it, expect } from 'vitest';
import { safeParseInt, safeParseIntWithMin } from '../../src/utils/safeParse';

describe('safeParseInt', () => {
  it('parsea números válidos', () => {
    expect(safeParseInt('123')).toBe(123);
    expect(safeParseInt('0')).toBe(0);
    expect(safeParseInt('-5')).toBe(-5);
  });

  it('retorna default para valores inválidos', () => {
    expect(safeParseInt('abc')).toBe(0);
    expect(safeParseInt('')).toBe(0);
    expect(safeParseInt(null as any)).toBe(0);
    expect(safeParseInt(undefined as any)).toBe(0);
  });

  it('parsea valores mixtos hasta el primer no-numérico', () => {
    expect(safeParseInt('123abc')).toBe(123);
  });

  it('acepta valor default personalizado', () => {
    expect(safeParseInt('abc', 10)).toBe(10);
    expect(safeParseInt('', 5)).toBe(5);
    expect(safeParseInt(null as any, 42)).toBe(42);
  });
});

describe('safeParseIntWithMin', () => {
  it('parsea y aplica mínimo', () => {
    expect(safeParseIntWithMin('5', 10)).toBe(10);
    expect(safeParseIntWithMin('15', 10)).toBe(15);
    expect(safeParseIntWithMin('0', 10)).toBe(10);
  });

  it('retorna mínimo cuando el valor es inválido', () => {
    expect(safeParseIntWithMin('abc', 10)).toBe(10);
    expect(safeParseIntWithMin('', 5)).toBe(5);
  });

  it('usa el mínimo como default si no se especifica', () => {
    expect(safeParseIntWithMin('abc', 7)).toBe(7);
  });
});
