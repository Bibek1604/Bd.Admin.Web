import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const newsApi = {
  getNews: async () => {
    const response = await fetch(`${BASE_URL}api/admin/news/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createNews: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/news/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updateNews: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/news/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteNews: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/news/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  }
};

export const resourceApi = {
  getResources: async () => {
    const response = await fetch(`${BASE_URL}api/admin/resources/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createResource: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/resources/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updateResource: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/resources/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteResource: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/resources/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  }
};
