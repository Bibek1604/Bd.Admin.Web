import { useState } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);

      // Normalize various backend shapes and persist token-based session
      const payload = data?.data ?? data ?? {};
      const token = data?.token ?? payload.token ?? payload.accessToken ?? payload.access_token ?? payload.tokens?.accessToken ?? payload.tokens?.access_token ?? '';
      const refresh = data?.refreshToken ?? payload.refreshToken ?? payload.refresh ?? payload.tokens?.refreshToken ?? payload.tokens?.refresh_token ?? '';
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
  // component reading it (e.g. Login.tsx) re-renders to the logged-out state
  // without forcing a full page reload.
  const logout = () => {
    useAuthStore.getState().logout();
  };

  return { login, logout, loading, error };
};
