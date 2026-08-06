import api from './axiosInstance';

export interface Company {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
}

export const companyApi = {
  getCompanies: async () => {
    const response = await api.get<Company[]>('/admin/companies/');
    return response.data;
  },
  
  getCompanyDetails: async (id: number) => {
    const response = await api.get<Company>(`/admin/companies/${id}/`);
    return response.data;
  },
};