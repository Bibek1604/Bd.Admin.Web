import { handleResponse } from './apiHelpers';
import { BASE_URL, getHeaders } from '../baseUrl';
import { ADMIN_ROUTES } from '../../api/adminRoutes';

const getAuthToken = () => localStorage.getItem('adminToken') || undefined;

export const dashboardApi = {
  getStats: async () => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.dashboardOverview.replace(/^\//, '')}`, {
      method: 'GET',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },

  // ❌ REMOVED: getAuditLogs - /api/admin/audit-logs does NOT exist in backend
  // This endpoint has been removed from the backend
  // Do not use this method

  // ✅ CORRECTED: Renamed and corrected endpoint
  getUserDashboard: async () => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.dashboardOverview.replace(/^\//, '')}`, {
      method: 'GET',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  },

  // ✅ Added alias for clarity
  getDashboardOverview: async () => {
    const response = await fetch(`${BASE_URL}${ADMIN_ROUTES.dashboardOverview.replace(/^\//, '')}`, {
      method: 'GET',
      headers: getHeaders(getAuthToken()),
    });
    return handleResponse(response);
  }
};
