import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';
import { ADMIN_ROUTES } from '../../api/adminRoutes';

export const authApi = {
  // ✅ CORRECTED: Removed /admin prefix and trailing /
  login: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.login.replace(/^\//, '')}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
  },

  // ✅ CORRECTED: Removed /admin prefix
  register: async (email: string, password: string, first_name: string, last_name: string) => {
    const response = await fetch(`${BASE_URL}api/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, first_name, last_name }),
    });

    return handleResponse(response);
  },

  // ✅ CORRECTED: Removed /admin prefix
  logout: async (token: string) => {
    const response = await fetch(`${BASE_URL}api/auth/logout`, {
      method: 'POST',
      headers: getHeaders(token),
    });

    return handleResponse(response);
  },

  // ✅ CORRECTED: Removed /auth prefix
  refreshToken: async (refreshToken: string) => {
    const response = await fetch(`${BASE_URL}api/auth/refresh`, {
      method: 'POST',
      headers: getHeaders(undefined, {
        Authorization: `Bearer ${refreshToken}`,
      }),
    });

    return handleResponse(response);
  },

  // ✅ CORRECTED: Removed /auth prefix
  changePassword: async (token: string, current_password: string, new_password: string) => {
    const response = await fetch(`${BASE_URL}api/change-password`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ current_password, new_password }),
    });

    return handleResponse(response);
  },

  // ✅ NEW: Added forgotPassword
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}api/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });

    return handleResponse(response);
  },
};
