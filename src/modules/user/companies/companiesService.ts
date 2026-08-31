import api from '../../../api/axiosInstance';

export interface CompanyAgent {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  created_at: string;
  updated_at: string;
  image?: string;
}

export const companiesService = {
  getCompanies: async (): Promise<CompanyAgent[]> => {
    const response = await api.get<CompanyAgent[]>('/admin/agents/');
    return response.data;
  },
  getCompanyById: async (id: number): Promise<CompanyAgent> => {
    const response = await api.get<CompanyAgent>(`/admin/agents/${id}/`);
    return response.data;
  }
};
