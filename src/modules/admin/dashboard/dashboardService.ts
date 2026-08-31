// Use plain axios (no auth interceptor) so a 401/403 on this endpoint
// never triggers the global refresh → logout cycle.
import axios from 'axios';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

const BASE = (import.meta.env.VITE_API_BASE_URL as string || '').replace(/\/$/, '');

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

const EMPTY_STATS: DashboardStats = {
  summary: {
    total_members: 0,
    active_members: 0,
    inactive_members: 0,
    lapsed_policies: 0,
    overdue_premiums: 0,
    unread_alerts: 0,
  },
  total_users: 0,
  total_agents: 0,
  total_companies: 0,
  total_policies: 0,
  total_admins: 0,
  notification_breakdown: [],
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const token = localStorage.getItem('adminToken');
    const authHeader = token
      ? (/^[^.]+\.[^.]+\.[^.]+$/.test(token.trim()) ? `Bearer ${token}` : `Token ${token}`)
      : undefined;
    const response = await axios.get<any>(`${BASE}${ADMIN_ROUTES.dashboardOverview}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
      timeout: 15000,
    });
    // Unwrap UniformJSONRenderer envelope { status, data, code } if present
    const raw = response.data;
    const data: DashboardStats = (raw?.data ?? raw) ?? EMPTY_STATS;
    data.total_users = data.total_users ?? data.summary?.total_members ?? 0;
    data.total_agents = data.total_agents ?? 0;
    data.total_companies = data.total_companies ?? 0;
    data.total_policies = data.total_policies ?? 0;
    data.total_admins = data.total_admins ?? 0;
    data.notification_breakdown = data.notification_breakdown ?? [];
    return data;
  } catch {
    // Dashboard stats are non-critical — return zeros rather than throwing
    // so a missing/wrong endpoint never kills the session or crashes the UI.
    return EMPTY_STATS;
  }
};
