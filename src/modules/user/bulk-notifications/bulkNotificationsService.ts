import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

export interface BulkNotification {
  id: number;
  title: string;
  content: string;
  target_audience: 'ALL' | 'AGENTS' | 'CLIENTS' | 'SELECTED';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  scheduled_time: string | null;
  created_at: string;
  sent_at?: string | null;
  selected_users?: number[];
}

export interface CreateBulkNotificationRequest {
  title: string;
  content: string;
  target_type: 'all' | 'single';
  target_agent_id?: string;
}

export const bulkNotificationsService = {
  getBulkNotifications: async (): Promise<BulkNotification[]> => {
    const response = await api.get<any>(ADMIN_ROUTES.bulkNotifications);
    const data = response.data;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },
  getBulkNotificationById: async (id: number): Promise<BulkNotification> => {
    const response = await api.get<BulkNotification>(`${ADMIN_ROUTES.bulkNotifications}${id}/`);
    return response.data;
  },
  createBulkNotification: async (data: CreateBulkNotificationRequest): Promise<BulkNotification> => {
    const response = await api.post<BulkNotification>(ADMIN_ROUTES.bulkNotifications, data);
    return response.data;
  }
};
