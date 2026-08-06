/**
 * Shared API response handler for the admin panel.
 * Uses JWT Bearer token authentication — no CSRF needed.
 */
import { BASE_URL, getHeaders } from '../baseUrl';
import { rateLimiter } from '../../utils/rateLimiter';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const extractApiErrorMessage = (payload: any): string => {
  const visited = new Set<any>();

  const walk = (value: any): string | null => {
    if (!value || visited.has(value)) return null;
    if (typeof value === 'string') return value.trim() || null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const message = walk(item);
        if (message) return message;
      }
      return null;
    }
    if (typeof value === 'object') {
      visited.add(value);
      for (const field of ['message', 'detail', 'error']) {
        const message = walk(value[field]);
        if (message) return message;
      }
      if (value.errors) {
        const errorMessage = walk(value.errors);
        if (errorMessage) return errorMessage;
      }
      for (const nestedValue of Object.values(value)) {
        const message = walk(nestedValue);
        if (message) return message;
      }
    }
    return null;
  };

  return walk(payload) || 'An unexpected error occurred.';
};

/**
 * Safely parse a fetch response.
 * Throws a typed Error whose `.message` comes from the backend envelope.
 */
export const handleResponse = async (response: Response) => {
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({ message: 'Something went wrong.' }));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=session-expired';
      }
    }
    const error: any = new Error(extractApiErrorMessage(data));
    error.statusCode = data?.statusCode || response.status;
    error.errors = data?.errors || null;
    throw error;
  }

  if (data && typeof data === 'object' && data.status === true && 'data' in data) {
    return data.data;
  }
  return data;
};

/**
 * Convenience wrappers for common CRUD patterns.
 * All requests send Authorization: Bearer <adminToken>.
 */
export const apiFetch = {
  get: async (endpoint: string) => {
    if (!rateLimiter.isAllowed('fetch-admin-read', { maxRequests: 60 })) {
      throw new Error('Too many requests. Please wait before retrying.');
    }
    const response = await fetch(`${BASE_URL}api/admin/${endpoint}`, {
      method: 'GET',
      headers: getHeaders(getAuthToken()),
      signal: AbortSignal.timeout(30000),
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, body?: any) => {
    if (!rateLimiter.isAllowed('fetch-admin-write', { maxRequests: 20 })) {
      throw new Error('Too many requests. Please wait before retrying.');
    }
    const response = await fetch(`${BASE_URL}api/admin/${endpoint}`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });
    return handleResponse(response);
  },

  patch: async (endpoint: string, body?: any) => {
    if (!rateLimiter.isAllowed('fetch-admin-write', { maxRequests: 20 })) {
      throw new Error('Too many requests. Please wait before retrying.');
    }
    const response = await fetch(`${BASE_URL}api/admin/${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string) => {
    if (!rateLimiter.isAllowed('fetch-admin-write', { maxRequests: 20 })) {
      throw new Error('Too many requests. Please wait before retrying.');
    }
    const response = await fetch(`${BASE_URL}api/admin/${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
      signal: AbortSignal.timeout(30000),
    });
    return handleResponse(response);
  },
};
