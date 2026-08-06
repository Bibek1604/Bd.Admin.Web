import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  image: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at?: string;
}

export interface CreateCompanyData {
  name: string;
  email?: string;
  phone_number?: string;
  image?: File | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | '';
  sortBy?: 'name' | 'created_at' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCompaniesResponse {
  results: Company[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  count: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Strip trailing slash so we never produce double-slash URLs
const BASE = ADMIN_ROUTES.companies.replace(/\/$/, '');

/** Unwrap backend { success, data } envelope */
const unwrap = <T>(responseData: any): T => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T;
  }
  return responseData as T;
};

// ── Service ───────────────────────────────────────────────────────────────────

const companyService = {
  /**
   * GET /api/admin/companies
   * Supports server-side pagination, search, status filter, sort.
   */
  getCompanies: async (params?: CompanyListParams): Promise<PaginatedCompaniesResponse> => {
    const response = await api.get<any>(BASE, { params });
    const data = unwrap<PaginatedCompaniesResponse>(response.data);
    // Backend returns { results, page, limit, total, totalPages, count }
    if (data && Array.isArray(data.results)) return data;
    // Fallback for plain array (legacy compat)
    const arr: Company[] = Array.isArray(data) ? data : [];
    return { results: arr, page: 1, limit: arr.length || 20, total: arr.length, totalPages: 1, count: arr.length };
  },

  getCompanyById: async (id: string): Promise<Company> => {
    const response = await api.get<any>(`${BASE}/${id}`);
    return unwrap<Company>(response.data);
  },

  createCompany: async (data: CreateCompanyData): Promise<Company> => {
    const formData = new FormData();
    formData.append('name', data.name.trim());
    if (data.email)        formData.append('email',        data.email.trim());
    if (data.phone_number) formData.append('phone_number', data.phone_number.trim());
    if (data.status)       formData.append('status',       data.status);
    if (data.image instanceof File) formData.append('image', data.image);

    const response = await api.post<any>(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap<Company>(response.data);
  },

  updateCompany: async (id: string, data: Partial<CreateCompanyData>): Promise<Company> => {
    const formData = new FormData();
    if (data.name         !== undefined) formData.append('name',         data.name.trim());
    if (data.email        !== undefined) formData.append('email',        data.email.trim());
    if (data.phone_number !== undefined) formData.append('phone_number', data.phone_number.trim());
    if (data.status       !== undefined) formData.append('status',       data.status);
    if (data.image instanceof File)      formData.append('image',        data.image);

    const response = await api.patch<any>(`${BASE}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap<Company>(response.data);
  },

  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};

export default companyService;
