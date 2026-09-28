// Goes through the shared instance so an expired access token is refreshed
// like everywhere else. This used plain axios and swallowed every error into
// zeros, so an expired session or an outage showed a dashboard of fake 0s.
import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

export interface DashboardStats {
  summary: {
    total_members: number;
    active_members: number;
    inactive_members: number;
    lapsed_policies: number;
    overdue_premiums: number;
    unread_alerts: number;
  };
  birthdays?: any;
  recent_alerts?: any[];
  recent_notifications?: any[];
  achievements?: any[];
  payments_due?: any[];
  targets?: any[];
  visualizations?: any;
  total_users?: number;
  total_agents?: number;
  total_companies?: number;
  total_policies?: number;
  total_admins?: number;
  notification_breakdown?: { status: string; count: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<any>(ADMIN_ROUTES.dashboardOverview, { timeout: 15000 });
  // The instance unwraps the { status, data } envelope; tolerate either shape.
  const raw = response.data;
  const data: DashboardStats = raw?.data ?? raw;
  if (!data || typeof data !== 'object') throw new Error('Unexpected dashboard response');
  data.total_users = data.total_users ?? data.summary?.total_members ?? 0;
  data.total_agents = data.total_agents ?? 0;
  data.total_companies = data.total_companies ?? 0;
  data.total_policies = data.total_policies ?? 0;
  data.total_admins = data.total_admins ?? 0;
  data.notification_breakdown = data.notification_breakdown ?? [];
  return data;
};
