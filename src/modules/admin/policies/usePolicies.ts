import { useState, useEffect, useCallback } from 'react';
import policiesService, { type Policy, type CreatePolicyData } from './policiesService';

/** Extracts a human-readable error message from an Axios/network error */
const extractErrorMessage = (err: any): string => {
  // Backend sends { success: false, message: "...", errors: [...] }
  const responseData = err?.response?.data;
  if (responseData) {
    if (typeof responseData.message === 'string' && responseData.message) {
      return responseData.message;
    }
  }
  return err?.message || 'An unexpected error occurred';
};

/** Extract field-level errors from backend response */
export const extractFieldErrors = (err: any): Record<string, string> => {
  const errors = err?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};
  const map: Record<string, string> = {};
  for (const e of errors) {
    if (e?.field && e?.message) map[e.field] = e.message;
  }
  return map;
};

export const usePolicies = () => {
  const [policies, setPolicies]       = useState<Policy[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [opLoading, setOpLoading]     = useState(false);
  const [opError, setOpError]         = useState<string | null>(null);
  const [opSuccess, setOpSuccess]     = useState<string | null>(null);

  /** Clear transient op feedback after a delay */
  const clearFeedback = (delay = 4000) => {
    setTimeout(() => {
      setOpError(null);
      setOpSuccess(null);
    }, delay);
  };

  const fetchPolicies = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    try {
      const data = await policiesService.getPolicies(params);
      setPolicies(data);
      setError(null);
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = async (data: CreatePolicyData): Promise<Policy> => {
    setOpLoading(true);
    setOpError(null);
    setOpSuccess(null);
    try {
      const newPolicy = await policiesService.createPolicy(data);
      setPolicies(prev => [newPolicy, ...prev]);
      fetchPolicies();
      setOpSuccess('Policy created successfully');
      clearFeedback();
      return newPolicy;
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      setOpError(msg);
      clearFeedback();
      throw err; // re-throw so modal can handle field errors
    } finally {
      setOpLoading(false);
    }
  };

  const updatePolicy = async (id: string, data: Partial<CreatePolicyData>): Promise<Policy> => {
    setOpLoading(true);
    setOpError(null);
    setOpSuccess(null);
    try {
      const updated = await policiesService.updatePolicy(id, data);
      setPolicies(prev => prev.map(p => p.id === id ? updated : p));
      fetchPolicies();
      setOpSuccess('Policy updated successfully');
      clearFeedback();
      return updated;
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      setOpError(msg);
      clearFeedback();
      throw err;
    } finally {
      setOpLoading(false);
    }
  };

  const deletePolicy = async (id: string): Promise<void> => {
    setOpLoading(true);
    setOpError(null);
    setOpSuccess(null);
    try {
      await policiesService.deletePolicy(id);
      setPolicies(prev => prev.filter(p => p.id !== id));
      setOpSuccess('Policy deleted successfully');
      clearFeedback();
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      setOpError(msg);
      clearFeedback();
      throw err;
    } finally {
      setOpLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    loading,
    error,
    opLoading,
    opError,
    opSuccess,
    refresh: fetchPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
  };
};
