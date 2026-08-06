import { useState, useCallback } from 'react';
import { authService } from './authService';
import { useAuthStore } from '../../../store/authStore';

export const useAuth = () => {
  const { setAuth, logout, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, role: 'ADMIN' | 'AGENT' = 'ADMIN') => {
    try {
      setLoading(true);
      setError(null);

      if (role === 'AGENT') {
        const result = await authService.agentLogin(email, password);

        if (!result.token) throw new Error('Login response did not include an access token.');

        const userProfile = {
          id:          result.data.id,
          username:    result.data.email,
          role:        'AGENT',
          is_admin:    false,
          is_superuser: false,
          is_staff:    false,
          full_name:   result.data.full_name,
          company_id:  result.data.company_id,
        };

        setAuth(result.token, userProfile, { refreshToken: result.refreshToken });
        return true;
      }

      // Admin login
      const data = await authService.login(email, password);

      if (!data.token) throw new Error('Login response did not include an access token.');

      const normalizedRole = String(data.user?.role || 'ADMIN').toUpperCase();

      const userProfile = {
        id:          data.user.id,
        username:    data.user.email,
        role:        normalizedRole,
        is_admin:    true,
        is_superuser: normalizedRole === 'SUPER_ADMIN',
        is_staff:    true,
      };

      setAuth(data.token, userProfile, {
        refreshToken: data.refreshToken,
        sessionId:    data.session.id,
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshTokenFunc = useCallback(async () => {
    const storedRefresh = localStorage.getItem('adminRefreshToken');
    if (!storedRefresh) { logout(); return; }

    try {
      const { accessToken, refreshToken: newRefresh } = await authService.refresh(storedRefresh);
      if (!accessToken) throw new Error('Empty access token');

      const existingUser = useAuthStore.getState().user;
      setAuth(accessToken, existingUser, { refreshToken: newRefresh });
    } catch {
      logout();
    }
  }, [logout, setAuth]);

  return { login, logout, loading, error, refreshToken: refreshTokenFunc, token };
};
