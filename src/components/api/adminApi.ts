import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';
import { ADMIN_ROUTES } from '../../api/adminRoutes';

const getAuthToken = () => {
  return localStorage.getItem('adminToken') || undefined;
};

export const adminApi = {
  // Generic CRUD helper
  fetchEntity: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.users.replace('users/', '')}${endpoint}/`, {
      method: 'GET',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },

  createEntity: async (endpoint: string, data: any) => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.users.replace('users/', '')}${endpoint}/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateEntity: async (endpoint: string, id: string | number, data: any) => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.users.replace('users/', '')}${endpoint}/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteEntity: async (endpoint: string, id: string | number) => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.users.replace('users/', '')}${endpoint}/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  },

  // Specific dashboard/audit endpoints
  getDashboardStats: async () => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.dashboardOverview.replace(/^\//, '')}`, {
      method: 'GET',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },

  // ❌ REMOVED: getAuditLogs - /api/admin/audit-logs endpoint does NOT exist in backend
};
