import { useState, useEffect, useCallback } from 'react';
import { companiesService, type CompanyAgent } from './companiesService';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<CompanyAgent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companiesService.getCompanies();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching companies');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { companies, loading, error, refetch: fetchCompanies };
};
