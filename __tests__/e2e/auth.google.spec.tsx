import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/convex/client', () => ({
  getConvexClient: () => null,
}));

import { AuthService } from '../../src/services/auth';

const buildGoogleCredential = (payload: Record<string, unknown>) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `header.${encoded}.signature`;
};

describe('Google auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('rejects an incomplete Google response with a clear error', async () => {
    const result = await AuthService.handleGoogleSignIn({});

    expect(result.user).toBeNull();
    expect(result.error).toMatch(/Google/i);
  });

  it('creates a local session for a valid Google credential when Convex is unavailable', async () => {
    const result = await AuthService.handleGoogleSignIn({
      credential: buildGoogleCredential({
        email: 'GoogleUser@Example.com',
        name: 'Google User',
        picture: 'https://example.com/avatar.png',
        sub: 'google-sub-123',
      }),
    });

    expect(result.user).not.toBeNull();
    expect(result.user?.email).toBe('googleuser@example.com');
    expect(result.user?.password).toBeUndefined();

    const storedUsers = JSON.parse(localStorage.getItem('local_users_db') || '[]');
    expect(storedUsers.some((user: any) => user.email === 'googleuser@example.com')).toBe(true);

    const storedSessionUser = JSON.parse(localStorage.getItem('local_session_user') || 'null');
    expect(storedSessionUser?.email).toBe('googleuser@example.com');
  });
});
