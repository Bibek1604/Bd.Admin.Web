import api from '../../../api/axiosInstance';

export interface Notification {
  id: number;
  recipient: number;
  recipient_username: string;
  title: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'READ' | 'FAILED';
  scheduled_time: string | null;
  created_at: string;
  sent_at: string | null;
  // Optional/Computed for UI logic
  type?: 'info' | 'alert' | 'warning' | 'system' | 'success';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = '/api/admin/notifications/';

// Admin Notifications are READ-ONLY (monitoring only)
const notificationsService = {
  getNotifications: async (params?: any): Promise<Notification[]> => {
    const response = await api.get<PaginatedResponse<Notification> | Notification[]>(BASE, { params });
    const data = response.data as any;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },

  getPage: async (params?: any): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get<PaginatedResponse<Notification>>(BASE, { params });
    return response.data;
  },

  getNotificationById: async (id: number): Promise<Notification> => {
    const response = await api.get<Notification>(`${BASE}${id}/`);
    return response.data;
  },

  createNotification: async (data: Partial<Notification>): Promise<Notification> => {
    const response = await api.post<Notification>(BASE, data);
    return response.data;
  },
};

export default notificationsService;
