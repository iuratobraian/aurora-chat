/**
 * JWT Session Manager
 * Handles JWT access and refresh tokens for authentication
 */

interface JwtTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface JwtSession {
  tokens: JwtTokens;
  userId: string;
  expiresAt: number;
}

const JWT_SESSION_KEY = 'jwt_session';
const JWT_USER_KEY = 'jwt_user';

/**
 * Save JWT tokens and user session
 */
export const saveJwtSession = (tokens: JwtTokens, userId: string, user: any): void => {
  try {
    const session: JwtSession = {
      tokens,
      userId,
      expiresAt: Date.now() + (tokens.expiresIn * 1000),
    };
    
    localStorage.setItem(JWT_SESSION_KEY, JSON.stringify(session));
    
    // Save user data separately (without sensitive info)
    const { password, ...safeUser } = user;
    localStorage.setItem(JWT_USER_KEY, JSON.stringify(safeUser));
  } catch (error) {
    console.error('[JWT Session] Error saving session:', error);
  }
};

/**
 * Get current JWT session
 */
export const getJwtSession = (): JwtSession | null => {
  try {
    const raw = localStorage.getItem(JWT_SESSION_KEY);
    if (!raw) return null;

    const session: JwtSession = JSON.parse(raw);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      // Session expired, try to refresh
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('[JWT Session] Error reading session:', error);
    return null;
  }
};

/**
 * Get access token from current session
 */
export const getAccessToken = (): string | null => {
  const session = getJwtSession();
  return session?.tokens.accessToken || null;
};

/**
 * Get refresh token from current session
 */
export const getRefreshToken = (): string | null => {
  const session = getJwtSession();
  return session?.tokens.refreshToken || null;
};

/**
 * Get user from session
 */
export const getJwtUser = (): any | null => {
  try {
    const raw = localStorage.getItem(JWT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('[JWT Session] Error reading user:', error);
    return null;
  }
};

/**
 * Check if access token is expired
 */
export const isAccessTokenExpired = (): boolean => {
  const session = getJwtSession();
  if (!session) return true;
  return Date.now() > session.expiresAt;
};

/**
 * Check if refresh token is expired (7 days from session start)
 */
export const isRefreshTokenExpired = (): boolean => {
  const session = getJwtSession();
  if (!session) return true;
  
  // Refresh token expires in 7 days from session creation
  const refreshTokenExpiresAt = session.expiresAt + (6 * 24 * 60 * 60 * 1000); // 6 more days
  return Date.now() > refreshTokenExpiresAt;
};

/**
 * Clear JWT session (logout)
 */
export const clearJwtSession = (): void => {
  localStorage.removeItem(JWT_SESSION_KEY);
  localStorage.removeItem(JWT_USER_KEY);
};

/**
 * Update access token in session (after refresh)
 */
export const updateAccessToken = (newAccessToken: string, expiresIn: number): void => {
  const session = getJwtSession();
  if (!session) return;
  
  session.tokens.accessToken = newAccessToken;
  session.tokens.expiresIn = expiresIn;
  session.expiresAt = Date.now() + (expiresIn * 1000);
  
  localStorage.setItem(JWT_SESSION_KEY, JSON.stringify(session));
};

/**
 * Get token type (Bearer)
 */
export const getTokenType = (): string => {
  const session = getJwtSession();
  return session?.tokens.tokenType || 'Bearer';
};

/**
 * Get authorization header value
 */
export const getAuthHeader = (): string => {
  const token = getAccessToken();
  const type = getTokenType();
  return token ? `${type} ${token}` : '';
};

/**
 * Decode JWT token payload (without verification - for client-side info only)
 */
export const decodeJwtToken = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[JWT Session] Error decoding token:', error);
    return null;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (): number | null => {
  const session = getJwtSession();
  return session?.expiresAt || null;
};

/**
 * Check if user is authenticated with valid JWT
 */
export const isAuthenticated = (): boolean => {
  const session = getJwtSession();
  if (!session) return false;
  
  // Check if access token is still valid
  return !isAccessTokenExpired();
};

/**
 * Extend session lifetime (called on user activity)
 */
export const extendSession = (additionalMs: number = 30 * 60 * 1000): boolean => {
  const session = getJwtSession();
  if (!session) return false;
  
  // Only extend if session is still valid
  if (Date.now() > session.expiresAt) {
    return false;
  }
  
  session.expiresAt = Date.now() + additionalMs;
  localStorage.setItem(JWT_SESSION_KEY, JSON.stringify(session));
  
  return true;
};
