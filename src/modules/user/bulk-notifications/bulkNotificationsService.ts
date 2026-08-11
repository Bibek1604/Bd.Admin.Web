import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

/**
 * Shape mirrors what the backend actually stores (see
 * repositories/bulkNotification.repository.js). The old interface carried
 * `status`, `scheduled_time` and `selected_users`, none of which exist on the
 * server — the status filter built on them could never match anything.
 */
export interface BulkNotification {
  id: string;
  title: string;
  content: string;
  target_type: 'ALL' | 'SINGLE';
  target_agent_id: string | null;
  target_agent?: { id: string; full_name: string; email: string } | null;
  creator?: { id: string; username: string; email: string } | null;
  created_at: string;
}

export interface CreateBulkNotificationRequest {
  title: string;
  content: string;
  target_type: 'all' | 'single';
  target_agent_id?: string;
}

export const bulkNotificationsService = {
  getBulkNotifications: async (params?: { page?: number; limit?: number; search?: string }): Promise<BulkNotification[]> => {
    // limit is capped at 100 server-side; the page filters and paginates locally.
    const response = await api.get<any>(ADMIN_ROUTES.bulkNotifications, {
      params: { limit: 100, ...params },
    });
    const data = response.data;
    return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  },

  getBulkNotificationById: async (id: string): Promise<BulkNotification> => {
    const response = await api.get<BulkNotification>(`${ADMIN_ROUTES.bulkNotifications}${id}/`);
    return response.data;
  },

  createBulkNotification: async (data: CreateBulkNotificationRequest): Promise<BulkNotification> => {
    const response = await api.post<BulkNotification>(ADMIN_ROUTES.bulkNotifications, data);
    return response.data;
  },

  deleteBulkNotification: async (id: string): Promise<void> => {
    await api.delete(`${ADMIN_ROUTES.bulkNotifications}${id}/`);
  },
};

export default bulkNotificationsService;
