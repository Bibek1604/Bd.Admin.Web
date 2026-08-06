import api from '../../../api/axiosInstance';

export interface Policy {
  id: string;
  name: string;
  company: string | null;
  company_name: string | null;
  type?: string | null;
  status?: string | null;
  coverage_amount?: number | null;
  premium_amount?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePolicyData {
  name: string;
  company: string | null;
  type?: string;
  status?: string;
  coverage_amount?: number;
  premium_amount?: number;
}

export interface PaginatedPoliciesResponse {
  results: Policy[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  count: number;
}

// Validation constants mirroring backend
export const POLICY_TYPES = ['GENERAL', 'LIFE', 'HEALTH', 'VEHICLE', 'PROPERTY', 'ENDOWMENT', 'TERM'] as const;
export const POLICY_STATUSES = ['ACTIVE', 'PENDING', 'LAPSED', 'EXPIRED'] as const;
export type PolicyType = typeof POLICY_TYPES[number];
export type PolicyStatusEnum = typeof POLICY_STATUSES[number];

const BASE = '/api/admin/policies';

/** Extract the nested `data` wrapper that backend wraps responses in */
const unwrap = <T>(responseData: any): T => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T;
  }
  return responseData as T;
};

const policiesService = {
  getPolicies: async (params?: { page?: number; limit?: number }): Promise<Policy[]> => {
    const response = await api.get<any>(BASE, { params });
    const payload = unwrap<PaginatedPoliciesResponse | Policy[]>(response.data);
    if (Array.isArray(payload)) return payload;
    if (Array.isArray((payload as PaginatedPoliciesResponse).results)) {
      return (payload as PaginatedPoliciesResponse).results;
    }
    return [];
  },

  getPage: async (params?: { page?: number; limit?: number }): Promise<PaginatedPoliciesResponse> => {
    const response = await api.get<any>(BASE, { params });
    return unwrap<PaginatedPoliciesResponse>(response.data);
  },

  getPolicyById: async (id: string): Promise<Policy> => {
    const response = await api.get<any>(`${BASE}/${id}`);
    return unwrap<Policy>(response.data);
  },

  createPolicy: async (data: CreatePolicyData): Promise<Policy> => {
    const response = await api.post<any>(BASE, data);
    return unwrap<Policy>(response.data);
  },

  updatePolicy: async (id: string, data: Partial<CreatePolicyData>): Promise<Policy> => {
    const response = await api.patch<any>(`${BASE}/${id}`, data);
    return unwrap<Policy>(response.data);
  },

  deletePolicy: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};

export default policiesService;
