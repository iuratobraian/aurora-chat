const SESSION_KEY = 'local_session';
const SESSION_USER_KEY = 'local_session_user';

interface SessionData {
  token: string;
  userId: string;
  expiresAt: number;
}

export const saveSession = (token: string, userId: string, expiresIn = 7 * 24 * 60 * 60 * 1000) => {
  const session: SessionData = {
    token,
    userId,
    expiresAt: Date.now() + expiresIn,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = (): { token: string; userId: string } | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session: SessionData = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_USER_KEY);
      return null;
    }
    return { token: session.token, userId: session.userId };
  } catch {
    return null;
  }
};

export const saveSessionUser = (user: any) => {
  const { password, ...safeUser } = user;
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safeUser));
};

export const getSessionUser = (): any | null => {
  const raw = localStorage.getItem(SESSION_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
};

export const isSessionExpired = (): boolean => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return true;

  try {
    const session: SessionData = JSON.parse(raw);
    return Date.now() > session.expiresAt;
  } catch {
    return true;
  }
};

export const extendSession = (additionalMs = 7 * 24 * 60 * 60 * 1000) => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;

  try {
    const session: SessionData = JSON.parse(raw);
    session.expiresAt = Date.now() + additionalMs;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
};
