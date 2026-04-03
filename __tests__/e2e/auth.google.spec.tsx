import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Convex client to return null (simulating offline/unavailable)
vi.mock('../../lib/convex/client', () => ({
  getConvexClient: () => ({
    query: vi.fn().mockRejectedValue(new Error('Convex unavailable')),
    mutation: vi.fn().mockRejectedValue(new Error('Convex unavailable')),
  }),
}));

const buildGoogleCredential = (payload: Record<string, unknown>) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `header.${encoded}.signature`;
};

describe('Google auth flow', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    // Reset session manager caches
    const mod = await import('../../src/utils/sessionManager');
    if (mod.__resetCachesForTesting) {
      mod.__resetCachesForTesting();
    }
  });

  it('rejects an incomplete Google response with a clear error', async () => {
    const { AuthService } = await import('../../src/services/auth');
    const result = await AuthService.handleGoogleSignIn({});

    expect(result.user).toBeNull();
    expect(result.error).toMatch(/Google/i);
  });

  it('creates a local session for a valid Google credential when Convex is unavailable', async () => {
    const { AuthService } = await import('../../src/services/auth');
    const result = await AuthService.handleGoogleSignIn({
      credential: buildGoogleCredential({
        email: 'GoogleUser@Example.com',
        name: 'Google User',
        picture: 'https://example.com/avatar.png',
        sub: 'google-sub-123',
      }),
    });

    // Should succeed with local fallback
    expect(result.user).not.toBeNull();
    expect(result.user?.email).toBe('googleuser@example.com');
    expect(result.user?.password).toBeUndefined();

    const storedUsers = JSON.parse(localStorage.getItem('local_users_db') || '[]');
    expect(storedUsers.some((user: any) => user.email === 'googleuser@example.com')).toBe(true);

    const storedSessionUser = JSON.parse(localStorage.getItem('local_session_user') || 'null');
    expect(storedSessionUser?.email).toBe('googleuser@example.com');
  });
});
