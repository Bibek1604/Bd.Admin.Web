import api from '../../../api/axiosInstance';

export interface AgentProfile {
  id?: number;
  agent_id: string;
  dob?: string | null;
  docs_image?: string | null;
  performance_score: number;
  license_number: string;
  specialization: string;
  branch_division?: string;
  qualification?: string;
  short_bio?: string;
}

export interface Agent {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'AGENT';
  is_active: boolean;
  phone_number: string;
  company: number | null;
  company_name?: string | null;
  assigned_agent: number | null;
  agent_profile?: AgentProfile;
  num_clients: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = '/api/admin/agents/';

export const getAgents = async (params?: any): Promise<Agent[]> => {
  const response = await api.get<PaginatedResponse<Agent> | Agent[]>(BASE, { params });
  const data = response.data as any;
  return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
};

export const getAgentById = async (id: number): Promise<Agent> => {
  const response = await api.get<Agent>(`${BASE}${id}/`);
  return response.data;
};

export const createAgent = async (data: Partial<Agent>): Promise<Agent> => {
  const response = await api.post<Agent>(BASE, data);
  return response.data;
};

export const updateAgent = async (id: number, data: Partial<Agent>): Promise<Agent> => {
  const response = await api.put<Agent>(`${BASE}${id}/`, data);
  return response.data;
};

export const patchAgent = async (id: number, data: Partial<Agent>): Promise<Agent> => {
  const response = await api.patch<Agent>(`${BASE}${id}/`, data);
  return response.data;
};

export const deleteAgent = async (id: number): Promise<void> => {
  await api.delete(`${BASE}${id}/`);
};

export const agentsService = {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  patchAgent,
  deleteAgent,
  getAll: getAgents, // Alias for consistency if needed
};

export default agentsService;
