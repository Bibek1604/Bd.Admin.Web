import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const achievementApi = {
  getAchievements: async () => {
    const response = await fetch(`${BASE_URL}api/admin/achievements/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  createAchievement: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/achievements/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  updateAchievement: async (id: number | string, data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/achievements/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  deleteAchievement: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}api/admin/achievements/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response) ?? true;
  },
  
  // User Achievements specialized
  getUserAchievements: async () => {
    const response = await fetch(`${BASE_URL}api/admin/user-achievements/`, {
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },
  unlockAchievement: async (data: any) => {
    const response = await fetch(`${BASE_URL}api/admin/user-achievements/unlock/`, {
      method: 'POST',
      headers: getHeaders(getAuthToken()),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }
};
