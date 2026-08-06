import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { rateLimiter } from '../utils/rateLimiter';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required');
}

const BASE = BASE_URL.replace(/\/$/, '');

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: false, // tokens are in Authorization header, no cookies needed
});

/** JWT → "Bearer <token>" */
const buildAuthHeader = (token: string): string => `Bearer ${token}`;

// Token refresh queue — prevents multiple concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// ---------------------------------------------------------------------------
// Request interceptor — attach JWT from localStorage
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Client-side rate limiting
    const method = (config.method || '').toUpperCase();
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (!rateLimiter.isAllowed('api-admin-write', { maxRequests: 20 })) {
        return Promise.reject(new Error('Too many requests. Please wait before retrying.'));
      }
    } else if (method === 'GET') {
      if (!rateLimiter.isAllowed('api-admin-read', { maxRequests: 60 })) {
        return Promise.reject(new Error('Too many requests. Please wait before retrying.'));
      }
    }

    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = buildAuthHeader(token);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — unwrap backend envelope + auto-refresh on 401
// Backend wraps all responses as: { status, message, data, code }
// We unwrap so callers get response.data = the actual payload directly.
// Exception: auth endpoints return tokens at top level — those are called
// via plain axios (not this instance) so they're unaffected.
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    const d = response.data;
    if (
      d &&
      typeof d === 'object' &&
      !Array.isArray(d) &&
      ('data' in d) &&
      ('message' in d || 'status' in d || 'success' in d)
    ) {
      return { ...response, data: d.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Attach backend error message to error object for catch blocks
    if (error.response?.data) {
      const d = error.response.data as any;
      (error as any).errorMessage =
        d.message ?? d.errors?.[0] ?? d.detail ?? error.message ?? 'An error occurred';
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const storedRefresh = localStorage.getItem('adminRefreshToken');

      if (!storedRefresh) {
        // No refresh token — don't logout if we still have an access token
        // (could be a 401 for wrong role, not expiry)
        if (!localStorage.getItem('adminToken')) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue until in-flight refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = buildAuthHeader(newToken);
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        // POST /api/auth/refresh  →  { status, message, accessToken, refreshToken }
        const { data } = await axios.post(
          `${BASE}/api/auth/refresh`,
          { refreshToken: storedRefresh },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken: string  = data.accessToken  ?? data.token  ?? '';
        const newRefreshToken: string = data.refreshToken ?? storedRefresh;

        if (!newAccessToken) throw new Error('Empty access token from refresh endpoint');

        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().setAuth(newAccessToken, currentUser, {
          refreshToken: newRefreshToken,
        });

        originalRequest.headers.Authorization = buildAuthHeader(newAccessToken);
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const status = (refreshError as any)?.response?.status;
        if (status === 401 || status === 403) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
