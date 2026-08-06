import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const policyApi = {
  getPolicies: async () => {
    const response = await fetch(`${BASE_URL}api/admin/policies/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createPolicy: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/policies/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updatePolicy: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/policies/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deletePolicy: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/policies/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  }
};
