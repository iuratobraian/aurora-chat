import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSession,
  getSession,
  saveSessionUser,
  getSessionUser,
  clearSession,
  isSessionExpired,
  extendSession,
} from '../../src/utils/sessionManager';

describe('SessionManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveSession', () => {
    it('should save session to localStorage', () => {
      saveSession('token123', 'user456');
      expect(localStorage.getItem('local_session')).toBeTruthy();
    });

    it('should include token, userId and expiresAt', () => {
      saveSession('token123', 'user456');
      const stored = JSON.parse(localStorage.getItem('local_session')!);
      expect(stored.token).toBe('token123');
      expect(stored.userId).toBe('user456');
      expect(stored.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should use custom expiresIn when provided', () => {
      const expiresIn = 60 * 1000;
      saveSession('token123', 'user456', expiresIn);
      const stored = JSON.parse(localStorage.getItem('local_session')!);
      expect(stored.expiresAt).toBeCloseTo(Date.now() + expiresIn, -2);
    });
  });

  describe('getSession', () => {
    it('should return session when valid', () => {
      saveSession('token123', 'user456');
      const session = getSession();
      expect(session).toEqual({ token: 'token123', userId: 'user456' });
    });

    it('should return null when no session exists', () => {
      const session = getSession();
      expect(session).toBeNull();
    });

    it('should return null when session expired', () => {
      const expiredSession = {
        token: 'token123',
        userId: 'user456',
        expiresAt: Date.now() - 1000,
      };
      localStorage.setItem('local_session', JSON.stringify(expiredSession));
      const session = getSession();
      expect(session).toBeNull();
    });
  });

  describe('saveSessionUser', () => {
    it('should save user without password', () => {
      const user = { id: '123', nombre: 'Test', password: 'secret123', email: 'test@test.com' };
      saveSessionUser(user);
      const stored = JSON.parse(localStorage.getItem('local_session_user')!);
      expect(stored.id).toBe('123');
      expect(stored.nombre).toBe('Test');
      expect(stored.password).toBeUndefined();
      expect(stored.email).toBe('test@test.com');
    });
  });

  describe('getSessionUser', () => {
    it('should return stored user', () => {
      const user = { id: '123', nombre: 'Test' };
      localStorage.setItem('local_session_user', JSON.stringify(user));
      const retrieved = getSessionUser();
      expect(retrieved).toEqual(user);
    });

    it('should return null when no user stored', () => {
      const user = getSessionUser();
      expect(user).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should clear both session and user', () => {
      saveSession('token123', 'user456');
      saveSessionUser({ id: '123', nombre: 'Test' });
      clearSession();
      expect(localStorage.getItem('local_session')).toBeNull();
      expect(localStorage.getItem('local_session_user')).toBeNull();
    });
  });

  describe('isSessionExpired', () => {
    it('should return false for valid session', () => {
      saveSession('token123', 'user456');
      expect(isSessionExpired()).toBe(false);
    });

    it('should return true when no session', () => {
      expect(isSessionExpired()).toBe(true);
    });

    it('should return true when expired', () => {
      const expiredSession = {
        token: 'token123',
        userId: 'user456',
        expiresAt: Date.now() - 1000,
      };
      localStorage.setItem('local_session', JSON.stringify(expiredSession));
      expect(isSessionExpired()).toBe(true);
    });
  });

  describe('extendSession', () => {
    it('should update session expiry when called', () => {
      const shortExpiry = 1000;
      saveSession('token123', 'user456', shortExpiry);
      
      const result = extendSession(24 * 60 * 60 * 1000);
      expect(result).toBe(true);
      
      const session = JSON.parse(localStorage.getItem('local_session')!);
      expect(session.expiresAt).toBeGreaterThan(Date.now() + 1000);
    });

    it('should return false when no session', () => {
      const result = extendSession();
      expect(result).toBe(false);
    });
  });
});
