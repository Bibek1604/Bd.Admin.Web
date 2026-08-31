import { BASE_URL, getHeaders } from './baseUrl';
import { ADMIN_ROUTES } from './adminRoutes';

export const authApi = {
  // ✅ CORRECTED: Removed /admin prefix, removed trailing /
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.login.replace(/^\//, '')}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  },

  // ✅ CORRECTED: Removed /admin prefix
  register: async (email: string, password: string, first_name: string, last_name: string) => {
    try {
      const response = await fetch(`${BASE_URL}api/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password, first_name, last_name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  },

  // ✅ CORRECTED: Removed /admin prefix
  logout: async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}api/auth/logout`, {
        method: 'POST',
        headers: getHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  },

  // ✅ CORRECTED: Removed /auth prefix, removed trailing /
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await fetch(`${BASE_URL}api/auth/refresh`, {
        method: 'POST',
        headers: getHeaders(undefined),
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Token refresh failed');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  },

  // ✅ CORRECTED: Removed /auth prefix
  changePassword: async (token: string, current_password: string, new_password: string) => {
    try {
      const response = await fetch(`${BASE_URL}api/change-password`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ current_password, new_password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  },

  // ✅ NEW: Added missing forgotPassword
  forgotPassword: async (email: string) => {
    try {
      const response = await fetch(`${BASE_URL}api/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request password reset');
      }

      return await response.json();
    } catch (error: any) {
      throw error;
    }
  },
};
