import api from './axiosInstance';
import type { DashboardStats } from '../modules/admin/dashboard/dashboardService';

export const userApi = {
  getCurrentUser: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/admin/dashboard-overview/');
    return response.data;
  },
};
