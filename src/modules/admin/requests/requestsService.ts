import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Mirrors what backend/src/repositories/agentRequest.repository.js returns. */
export interface AgentRequest {
  id: string;
  agent_id: string;
  name: string;
  /** Optional on the Request Access form. */
  email: string | null;
  phone: string;
  status: RequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  agent?: { id: string; full_name: string; email: string } | null;
  reviewer?: { id: string; username: string; email: string } | null;
}

export interface RequestsPage {
  results: AgentRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestsQuery {
  page: number;
  limit: number;
  status?: RequestStatus;
  search?: string;
}

export const requestsService = {
  /** Paginated server-side — the list grows without bound, so it is never fetched whole. */
  getRequests: async (params: RequestsQuery): Promise<RequestsPage> => {
    const response = await api.get<RequestsPage>(ADMIN_ROUTES.requests, { params });
    const data = response.data;
    return {
      results: Array.isArray(data?.results) ? data.results : [],
      total: data?.total ?? 0,
      page: data?.page ?? params.page,
      limit: data?.limit ?? params.limit,
      totalPages: data?.totalPages ?? 0,
    };
  },

  approveRequest: async (id: string): Promise<AgentRequest> => {
    const response = await api.patch<AgentRequest>(`${ADMIN_ROUTES.requests}/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: string): Promise<AgentRequest> => {
    const response = await api.patch<AgentRequest>(`${ADMIN_ROUTES.requests}/${id}/reject`);
    return response.data;
  },
};

export default requestsService;
