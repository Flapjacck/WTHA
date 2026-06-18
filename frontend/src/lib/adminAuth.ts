const SESSION_KEY = 'wtha_admin_session';

interface AdminSession {
  username: string;
  password: string;
}

const expectedUsername = import.meta.env.VITE_ADMIN_USERNAME;
const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD;

export function login(username: string, password: string): boolean {
  if (!expectedUsername || !expectedPassword) {
    throw new Error('Admin credentials are not configured');
  }

  if (username === expectedUsername && password === expectedPassword) {
    const session: AdminSession = { username, password };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  }

  return false;
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function getAdminPassword(): string | null {
  return getSession()?.password ?? null;
}

function getSession(): AdminSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}
