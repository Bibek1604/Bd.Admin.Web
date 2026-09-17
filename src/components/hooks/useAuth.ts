/**
 * DEAD CODE — not imported by anything in the active module architecture.
 * The active API layer is src/api/ (axiosInstance, adminRoutes, baseUrl);
 * the active hooks live under src/modules/. Safe to delete
 * src/components/api/, src/components/hooks/ and src/components/store/.
 *
 * NOTE: do not write a glob like modules/<star>/use<star>.ts in this header —
 * the slash after a star closes the comment, which is what broke this file.
 */
import { useState } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../../store/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);

      const payload = data?.data ?? data ?? {};
      const token = data?.token ?? payload.token ?? payload.accessToken ?? payload.access_token ?? payload.tokens?.accessToken ?? '';
      const refresh = data?.refreshToken ?? payload.refreshToken ?? payload.refresh ?? payload.tokens?.refreshToken ?? '';
      const user = payload.user ?? payload.data ?? payload.admin ?? payload.profile ?? {};

      if (token) {
        const userProfile = {
          id: user?.id ?? 0,
          username: user?.email ?? user?.username ?? '',
          role: String(user?.role ?? 'ADMIN').toUpperCase(),
        };
        useAuthStore.getState().setAuth(token, userProfile, { refreshToken: refresh || undefined, rawResponse: data });
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Something went wrong during login.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reuse the store's own logout — it clears every auth key (not just the two
  // this hook knew about) and flips `isAuthenticated`, which is reactive: any
  // component reading it re-renders to the logged-out state without forcing
  // a full page reload.
  const logout = () => {
    useAuthStore.getState().logout();
  };

  return { login, logout, loading, error };
};
