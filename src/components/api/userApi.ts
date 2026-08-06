import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const userApi = {
  getUsers: async () => {
    const response = await fetch(`${BASE_URL}api/admin/users/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createUser: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/users/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updateUser: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/users/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteUser: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/users/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  },
  bulkActivateDeactivate: async (data: { user_ids: number[], is_active: boolean }) => {
    const response = await fetch(`${BASE_URL}api/admin/users/bulk_activate_deactivate/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }
};
