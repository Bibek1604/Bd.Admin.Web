/**
 * NOT ROUTED — App.tsx renders modules/admin/companies/CompaniesPage, not this
 * module's CompaniesList. Nothing here reaches a user today.
 *
 * Two things about it were wrong and are fixed rather than left as a trap for
 * whoever wires it up:
 *   - the paths were missing the `/api` segment (the axios baseURL does not
 *     include it), so both calls 404'd;
 *   - despite the name, it reads the AGENTS endpoint, not companies. That is
 *     preserved — the CompanyAgent shape below matches an agent record — but it
 *     is why "companies" here does not mean what it means elsewhere.
 */
import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

const BASE = ADMIN_ROUTES.agents.replace(/\/$/, '');

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
    const response = await api.get<CompanyAgent[]>(BASE);
    return response.data;
  },
  getCompanyById: async (id: number): Promise<CompanyAgent> => {
    const response = await api.get<CompanyAgent>(`${BASE}/${id}`);
    return response.data;
  }
};
