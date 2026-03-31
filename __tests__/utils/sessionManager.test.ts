import { describe, it, expect, beforeEach, vi } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    __reset: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const { saveSession, getSession, clearSession, isSessionExpired, extendSession, saveSessionUser, getSessionUser } = await import('../../src/utils/sessionManager');

describe('sessionManager', () => {
  beforeEach(() => {
    localStorageMock.__reset();
    vi.clearAllMocks();
  });

  describe('saveSession / getSession', () => {
    it('guarda y recupera sesión válida', () => {
      saveSession('token123', 'user456');
      const session = getSession();
      expect(session).toEqual({ token: 'token123', userId: 'user456' });
    });

    it('retorna null si no hay sesión', () => {
      expect(getSession()).toBeNull();
    });

    it('retorna null si la sesión expiró', () => {
      const expired = {
        token: 'token123',
        userId: 'user456',
        expiresAt: Date.now() - 1000,
      };
      localStorage.setItem('local_session', JSON.stringify(expired));
      expect(getSession()).toBeNull();
    });

    it('ignora JSON inválido', () => {
      localStorage.setItem('local_session', 'not-json');
      expect(getSession()).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('elimina sesión y usuario', () => {
      saveSession('token', 'user');
      saveSessionUser({ name: 'test', password: 'secret' });
      clearSession();
      expect(localStorage.removeItem).toHaveBeenCalledWith('local_session');
      expect(localStorage.removeItem).toHaveBeenCalledWith('local_session_user');
    });
  });

  describe('isSessionExpired', () => {
    it('retorna true si no hay sesión', () => {
      expect(isSessionExpired()).toBe(true);
    });

    it('retorna false si la sesión es válida', () => {
      saveSession('token', 'user', 10000);
      expect(isSessionExpired()).toBe(false);
    });

    it('retorna true si expiró', () => {
      const expired = { token: 'x', userId: 'y', expiresAt: Date.now() - 1000 };
      localStorage.setItem('local_session', JSON.stringify(expired));
      expect(isSessionExpired()).toBe(true);
    });
  });

  describe('extendSession', () => {
    it('extiende la sesión existente', () => {
      saveSession('token', 'user', 1000);
      const original = getSession();
      const extended = extendSession(5000);
      expect(extended).toBe(true);
      expect(getSession()).toEqual(original);
    });

    it('retorna false si no hay sesión', () => {
      expect(extendSession()).toBe(false);
    });
  });

  describe('saveSessionUser / getSessionUser', () => {
    it('guarda usuario sin password', () => {
      saveSessionUser({ name: 'test', password: 'secret', role: 'admin' });
      const user = getSessionUser();
      expect(user).toEqual({ name: 'test', role: 'admin' });
      expect(user).not.toHaveProperty('password');
    });

    it('retorna null si no hay usuario', () => {
      expect(getSessionUser()).toBeNull();
    });
  });
});
