/**
 * SUPERSEDED — prefer modules/admin/companies/companyService.ts.
 *
 * That module is what the routed Companies page uses, and it covers create,
 * update and delete as well as reads. This file is kept only because
 * components/admin/CompaniesSection.tsx still imports it.
 *
 * The paths below were missing the `/api` segment, so BOTH calls 404'd: the
 * axios baseURL is VITE_API_BASE_URL WITHOUT `/api`, and every other admin
 * service supplies it (see api/adminRoutes.ts). Fixed rather than left broken,
 * but new code should use ADMIN_ROUTES / companyService instead of adding a
 * fourth place that spells these URLs out by hand.
 */
import api from './axiosInstance';
import { ADMIN_ROUTES } from './adminRoutes';

export interface Company {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
}

const BASE = ADMIN_ROUTES.companies.replace(/\/$/, '');

export const companyApi = {
  getCompanies: async () => {
    const response = await api.get<Company[]>(BASE);
    return response.data;
  },

  getCompanyDetails: async (id: number) => {
    const response = await api.get<Company>(`${BASE}/${id}`);
    return response.data;
  },
};