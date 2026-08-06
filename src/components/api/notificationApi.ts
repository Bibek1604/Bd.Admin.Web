import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const notificationApi = {
  getNotifications: async () => {
    const response = await fetch(`${BASE_URL}api/admin/notifications/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  getSpecificNotification: async (id: string | number) => {
    const response = await fetch(`${BASE_URL}api/admin/notifications/${id}/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  
  // Bulk Notifications
  getBulkNotifications: async () => {
    const response = await fetch(`${BASE_URL}api/admin/bulk-notifications/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createBulkNotification: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/bulk-notifications/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updateBulkNotification: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/bulk-notifications/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteBulkNotification: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/bulk-notifications/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  }
};
