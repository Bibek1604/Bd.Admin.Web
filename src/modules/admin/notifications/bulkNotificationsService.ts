import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

export interface BulkNotification {
  id: number;
  admin_user: number | null;
  admin_username: string;
  title: string;
  content: string;
  target_audience: 'ALL' | 'AGENTS' | 'CLIENTS' | 'SELECTED';
  selected_users: number[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  scheduled_time: string | null;
  created_at: string;
}

export interface CreateBulkNotificationData {
  title: string;
  content: string;
  target_audience: 'ALL' | 'AGENTS' | 'CLIENTS' | 'SELECTED';
  selected_users?: number[];
  scheduled_time?: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = ADMIN_ROUTES.bulkNotifications;

const bulkNotificationsService = {
  getBulkNotifications: async (params?: any): Promise<BulkNotification[]> => {
    const response = await api.get<PaginatedResponse<BulkNotification> | BulkNotification[]>(BASE, { params });
    const data = response.data as any;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },

  getPage: async (params?: any): Promise<PaginatedResponse<BulkNotification>> => {
    const response = await api.get<PaginatedResponse<BulkNotification>>(BASE, { params });
    return response.data;
  },

  getById: async (id: number): Promise<BulkNotification> => {
    const response = await api.get<BulkNotification>(`${BASE}${id}/`);
    return response.data;
  },

  // Creating triggers background task via Django-Q
  create: async (data: CreateBulkNotificationData): Promise<BulkNotification> => {
    const response = await api.post<BulkNotification>(BASE, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}${id}/`);
  },
};

export default bulkNotificationsService;
