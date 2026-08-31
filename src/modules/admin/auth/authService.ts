import axios from 'axios';
import { BASE_URL } from '../../../api/baseUrl';
import { ADMIN_ROUTES, AGENT_ROUTES } from '../../../api/adminRoutes';

/**
 * Admin login response shape (POST /api/admin/login):
 * { status, message, accessToken, refreshToken, data: { id, email, role } }
 *
 * Agent login response shape (POST /api/agent/login):
 * { status, message, accessToken, refreshToken, token, data: { id, full_name, email, ... } }
 */

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  token: string;           // access token (named `token` for legacy compat)
  refreshToken?: string;
  session: {
    id: string;
    expiresAt: string;
  };
}

export interface AgentAuthResponse {
  status: boolean;
  message: string;
  token: string;           // access token
  refreshToken?: string;
  data: {
    id: string;
    full_name: string;
    email: string;
    status: string;
    company_id?: string | null;
    role: string;
  };
}

const getSafeErrorMessage = (status?: number): string => {
  if (status === 401 || status === 403) return 'Invalid credentials. Please try again.';
  if (status === 400) return 'Please check your input and try again.';
  if (status === 500) return 'Server error. Please try again later.';
  return 'An error occurred. Please try again.';
};

export const authService = {
  // ---------------------------------------------------------------------------
  // Admin login — POST /api/admin/login
  // Response: { status, message, accessToken, refreshToken, data: { id, email, role } }
  // ---------------------------------------------------------------------------
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(
        `${BASE_URL}${ADMIN_ROUTES.login.replace(/^\//, '')}`,
        { email, password }
      );

      const d = response.data;

      // Primary token fields (new shape)
      const accessToken: string = d.accessToken ?? d.token ?? '';
      const refreshToken: string = d.refreshToken ?? '';

      // User data is in d.data
      const userData = d.data ?? {};

      return {
        user: {
          id:        Number(userData.id ?? 0),
          email:     String(userData.email ?? email),
          firstName: userData.firstName ?? userData.first_name,
          lastName:  userData.lastName  ?? userData.last_name,
          role:      String(userData.role ?? userData.type ?? 'ADMIN'),
        },
        token:        accessToken,
        refreshToken: refreshToken || undefined,
        session: {
          id:        `session-${Date.now()}`,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      };
    } catch (error: any) {
      console.error('[Auth] Admin login error:', error.response?.data);
      throw new Error(getSafeErrorMessage(error.response?.status));
    }
  },

  // ---------------------------------------------------------------------------
  // Agent login — POST /api/agent/login
  // Response: { status, message, accessToken, refreshToken, token, data: { ... } }
  // ---------------------------------------------------------------------------
  agentLogin: async (email: string, password: string): Promise<AgentAuthResponse> => {
    try {
      const response = await axios.post(
        `${BASE_URL}${AGENT_ROUTES.login.replace(/^\//, '')}`,
        { email, password }
      );

      const d = response.data;
      return {
        status:       d.status       ?? true,
        message:      d.message      ?? 'Login successful',
        token:        d.accessToken  ?? d.token ?? '',
        refreshToken: d.refreshToken ?? undefined,
        data:         d.data         ?? {},
      };
    } catch (error: any) {
      console.error('[Auth] Agent login error:', error.response?.data);
      throw new Error(getSafeErrorMessage(error.response?.status));
    }
  },

  // ---------------------------------------------------------------------------
  // Refresh — POST /api/auth/refresh
  // Response: { status, message, accessToken, refreshToken }
  // ---------------------------------------------------------------------------
  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
      const response = await axios.post(
        `${BASE_URL}${ADMIN_ROUTES.refresh.replace(/^\//, '')}`,
        { refreshToken }
      );

      const d = response.data;
      return {
        accessToken:  d.accessToken  ?? d.token ?? '',
        refreshToken: d.refreshToken ?? refreshToken,
      };
    } catch (error: any) {
      console.error('[Auth] Token refresh error:', error.response?.data);
      throw new Error('Session expired. Please login again.');
    }
  },
};
