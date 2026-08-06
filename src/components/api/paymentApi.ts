import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const reportApi = {
  getReports: async () => {
    const response = await fetch(`${BASE_URL}api/admin/reports/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createReport: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/reports/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updateReport: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/reports/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteReport: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/reports/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  }
};
