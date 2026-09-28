import { create } from 'zustand';
import axios from 'axios';
import { BASE_URL } from '../api/baseUrl';
import { decodeJWT, isTokenExpired } from '../utils/authUtils';
import { requestNewAccessToken } from '../api/sessionRefresh';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  /** True while a reload with an expired access token tries the refresh cookie. */
  isRestoring: boolean;
  /** Try the bd_rt cookie once; on failure fall back to the login screen. */
  restoreSession: () => Promise<void>;
  setAuth: (token: string, user: any, meta?: { refreshToken?: string; sessionId?: string | number; rawResponse?: unknown }) => void;
  /**
   * Silent local-only logout — clears client state without calling the server.
   * Used by the axios interceptor and auto-expiry logic.
   * Does NOT call /api/auth/logout so a fire-and-forget API call can never
   * race against a new login and terminate the freshly-created session.
   */
  logout: () => void;
  /**
   * Full sign-out — calls the server to terminate the session, then clears
   * local state. Use this only for explicit user-initiated "Sign Out" actions.
   */
  signOut: () => void;
}

const clearLocalAuth = () => {
  localStorage.removeItem('adminToken');
  // adminRefreshToken intentionally not stored in localStorage — httpOnly cookie only
  localStorage.removeItem('adminSessionId');
  sessionStorage.removeItem('adminLoginResponse');
  sessionStorage.removeItem('adminUser');
};

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = localStorage.getItem('adminToken');

  const readStoredUser = () => {
    const storedUser = sessionStorage.getItem('adminUser');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  // An expired access token used to be wiped here, so any reload more than one
  // access-token lifetime after sign-in landed on the login screen even though
  // the 7-day bd_rt cookie was still valid. Keep the session pending instead and
  // let restoreSession() try the cookie first.
  const expired = !!initialToken && isTokenExpired(initialToken);
  const effectiveToken = expired ? null : initialToken;

  return {
    token: effectiveToken,
    user: effectiveToken ? readStoredUser() : null,
    isAuthenticated: !!effectiveToken,
    isRestoring: expired,

    restoreSession: async () => {
      try {
        const token = await requestNewAccessToken();
        const decoded = decodeJWT(token);
        const user = readStoredUser() ?? (decoded ? { id: decoded.id, email: decoded.email, role: decoded.role } : null);
        localStorage.setItem('adminToken', token);
        if (user) sessionStorage.setItem('adminUser', JSON.stringify(user));
        set({ token, user, isAuthenticated: true, isRestoring: false });
      } catch {
        clearLocalAuth();
        set({ token: null, user: null, isAuthenticated: false, isRestoring: false });
      }
    },

    setAuth: (token: string, user: any, meta?: { refreshToken?: string; sessionId?: string | number; rawResponse?: unknown }) => {
      // Wipe any stale auth data before writing the new session so old
      // terminated sessions can never bleed into the new one.
      clearLocalAuth();
      localStorage.setItem('adminToken', token);
      sessionStorage.setItem('adminUser', JSON.stringify(user));
      // refreshToken goes only to the httpOnly bd_rt cookie (set server-side) — never localStorage
      if (meta?.sessionId !== undefined && meta?.sessionId !== null) {
        const sessionId = String(meta.sessionId).trim();
        const invalid = new Set(['nan', 'undefined', 'null', '']);
        if (!invalid.has(sessionId.toLowerCase())) {
          localStorage.setItem('adminSessionId', sessionId);
        }
      }
      if (meta?.rawResponse !== undefined) {
        sessionStorage.setItem('adminLoginResponse', JSON.stringify(meta.rawResponse));
      }
      set({ token, user, isAuthenticated: true, isRestoring: false });
    },

    // Silent local-only logout — no API call.
    logout: () => {
      clearLocalAuth();
      set({ token: null, user: null, isAuthenticated: false, isRestoring: false });
    },

    // Explicit sign-out — calls server then clears local state.
    signOut: () => {
      const sessionId = localStorage.getItem('adminSessionId');
      const accessToken = localStorage.getItem('adminToken');
      if (accessToken) {
        const scheme = /^[^.]+\.[^.]+\.[^.]+$/.test(accessToken.trim()) ? 'Bearer' : 'Token';
        void axios
          .post(
            `${BASE_URL}api/auth/logout`,
            { session_id: sessionId },
            { headers: { Authorization: `${scheme} ${accessToken}` }, withCredentials: true }
          )
          .catch(() => {});
      }
      clearLocalAuth();
      set({ token: null, user: null, isAuthenticated: false, isRestoring: false });
    },
  };
});
