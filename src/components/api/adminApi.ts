import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';
import { ADMIN_ROUTES } from '../../api/adminRoutes';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;
const adminBase = () => `${BASE_URL}${ADMIN_ROUTES.adminBase.replace(/^\//, '')}`;

export const adminApi = {
  fetchEntity: async (endpoint: string) => {
    const response = await fetch(`${adminBase()}${endpoint}/`, {
      method: 'GET',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },

  createEntity: async (endpoint: string, data: any) => {
    const response = await fetch(`${adminBase()}${endpoint}/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateEntity: async (endpoint: string, id: string | number, data: any) => {
    const response = await fetch(`${adminBase()}${endpoint}/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteEntity: async (endpoint: string, id: string | number) => {
    const response = await fetch(`${adminBase()}${endpoint}/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  },

  getDashboardStats: async () => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.dashboardOverview.replace(/^\//, '')}`, {
      method: 'GET',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
};
