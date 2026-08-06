import api from '../../../api/axiosInstance';

export interface AuditLog {
  id: number;
  admin_user: number | null;
  admin_username: string;
  action: string;
  details: string;
  timestamp: string;
  ip_address?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = '/api/admin/audit-logs/';

export const auditLogsService = {
  getAuditLogs: async (params?: any): Promise<AuditLog[]> => {
    const response = await api.get<PaginatedResponse<AuditLog> | AuditLog[]>(BASE, { params });
    const data = response.data as any;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },

  getPage: async (params?: any): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get<PaginatedResponse<AuditLog>>(BASE, { params });
    return response.data;
  },
};
