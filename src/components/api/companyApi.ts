import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const companyApi = {
  getCompanies: async () => {
    const response = await fetch(`${BASE_URL}api/admin/companies/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createCompany: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/companies/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updateCompany: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/companies/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteCompany: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/companies/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  }
};
