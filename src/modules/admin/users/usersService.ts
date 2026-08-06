import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: 'ADMIN' | 'AGENT' | 'CLIENT';
  is_active: boolean;
  phone_number: string;
  company: number | null;
  assigned_agent: number | null;
  password?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = ADMIN_ROUTES.users;

export const usersService = {
  getAll: async (params?: any): Promise<User[]> => {
    const response = await api.get<PaginatedResponse<User> | User[]>(BASE, { params });
    const data = response.data as any;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },

  getPage: async (params?: any): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(BASE, { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`${BASE}${id}/`);
    return response.data;
  },

  create: async (data: Partial<User>): Promise<User> => {
    const payload = { ...data };
    if (payload.role === 'AGENT' && payload.first_name && payload.last_name) {
      payload.full_name = `${payload.first_name} ${payload.last_name}`.trim();
      delete payload.first_name;
      delete payload.last_name;
    }
    const response = await api.post<User>(BASE, payload);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const payload = { ...data };
    if (payload.role === 'AGENT' && payload.first_name && payload.last_name) {
      payload.full_name = `${payload.first_name} ${payload.last_name}`.trim();
      delete payload.first_name;
      delete payload.last_name;
    }
    const response = await api.patch<User>(`${BASE}${id}/`, payload);
    return response.data;
  },

  patch: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`${BASE}${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}${id}/`);
  },

  // Backend expects { user_ids: number[], is_active: boolean }
  bulkAction: async (userIds: number[], action: 'activate' | 'deactivate'): Promise<any> => {
    const response = await api.post(`${BASE}bulk_activate_deactivate/`, {
      user_ids: userIds,
      is_active: action === 'activate',
    });
    return response.data;
  },
};
