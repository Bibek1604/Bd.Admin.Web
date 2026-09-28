import { useState, useEffect, useCallback } from 'react';
import companyService, {
  type Company,
  type CreateCompanyData,
  type CompanyListParams,
  type PaginatedCompaniesResponse,
} from './companyService';
import { extractMessage } from '../../../utils/formErrors';

// ── Error helpers ─────────────────────────────────────────────────────────────

// Delegates to the shared helper so raw axios text ("Network Error",
// "Request failed with status code 409") never reaches the page.
const extractErrorMessage = (err: any): string => extractMessage(err, 'An unexpected error occurred');

/** Maps backend errors array → { fieldName: message } */
export const extractFieldErrors = (err: any): Record<string, string> => {
  const errors = err?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};
  const map: Record<string, string> = {};
  for (const e of errors) {
    if (e?.field && e?.message) map[e.field] = e.message;
  }
  return map;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useCompanies = () => {
  const [companies, setCompanies]     = useState<Company[]>([]);
  const [pagination, setPagination]   = useState<Omit<PaginatedCompaniesResponse, 'results'> | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [opLoading, setOpLoading]     = useState(false);
  const [opError, setOpError]         = useState<string | null>(null);
  const [opSuccess, setOpSuccess]     = useState<string | null>(null);

  const clearFeedback = useCallback((delay = 4000) => {
    setTimeout(() => { setOpError(null); setOpSuccess(null); }, delay);
  }, []);

  const fetchCompanies = useCallback(async (params?: CompanyListParams) => {
    setLoading(true);
    try {
      const res = await companyService.getCompanies(params);
      setCompanies(res.results);
      setPagination({ page: res.page, limit: res.limit, total: res.total, totalPages: res.totalPages, count: res.count });
      setError(null);
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = async (data: CreateCompanyData): Promise<Company> => {
    setOpLoading(true);
    try {
      const newCompany = await companyService.createCompany(data);
      setCompanies(prev => [newCompany, ...prev]);
      fetchCompanies();
      setOpSuccess('Company registered successfully.');
      clearFeedback();
      return newCompany;
    } catch (err: any) {
      setOpError(extractErrorMessage(err));
      clearFeedback();
      throw err;
    } finally {
      setOpLoading(false);
    }
  };

  const updateCompany = async (id: string, data: Partial<CreateCompanyData>): Promise<Company> => {
    setOpLoading(true);
    try {
      const updated = await companyService.updateCompany(id, data);
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
      fetchCompanies();
      setOpSuccess('Company updated successfully.');
      clearFeedback();
      return updated;
    } catch (err: any) {
      setOpError(extractErrorMessage(err));
      clearFeedback();
      throw err;
    } finally {
      setOpLoading(false);
    }
  };

  const deleteCompany = async (id: string): Promise<void> => {
    setOpLoading(true);
    try {
      await companyService.deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      setOpSuccess('Company deleted successfully.');
      clearFeedback();
    } catch (err: any) {
      setOpError(extractErrorMessage(err));
      clearFeedback();
      throw err;
    } finally {
      setOpLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  return {
    companies,
    pagination,
    loading,
    error,
    opLoading,
    opError,
    opSuccess,
    refresh: fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
