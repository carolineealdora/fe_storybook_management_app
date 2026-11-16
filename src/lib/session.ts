// Admin session in localStorage (chosen so admins stay signed in across reloads and tabs).
// Every access is wrapped: storage can throw in private mode or when blocked.
const KEY = "ms_admin_session";

export interface Session {
  accessToken: string;
  refreshToken: string;
  email: string;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable: the session lasts until reload.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing stored.
  }
}
