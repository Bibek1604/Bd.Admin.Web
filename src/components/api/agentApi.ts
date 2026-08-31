import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const agentApi = {
  getAgents: async () => {
    const response = await fetch(`${BASE_URL}api/admin/agents/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createAgent: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/agents/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updateAgent: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/agents/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteAgent: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/agents/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  }
};
