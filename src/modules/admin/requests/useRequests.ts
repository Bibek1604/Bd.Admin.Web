import { useCallback, useEffect, useState } from 'react';
import { requestsService, type AgentRequest, type RequestStatus } from './requestsService';

interface Options {
  page: number;
  pageSize: number;
  status: RequestStatus | 'ALL';
  search: string;
}

export const useRequests = ({ page, pageSize, status, search }: Options) => {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Id of the row whose approve/reject is in flight. */
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestsService.getRequests({
        page,
        limit: pageSize,
        status: status === 'ALL' ? undefined : status,
        search: search.trim() || undefined,
      });
      setRequests(data.results);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.errorMessage || err.message || 'Error fetching requests');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, search]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  /**
   * Approve or reject, then patch that one row from the server's answer. On
   * failure (e.g. 409, another admin decided it first) the list is refetched so
   * the row shows its real status, and the error is rethrown for the page.
   */
  const decide = useCallback(async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      const updated = action === 'approve'
        ? await requestsService.approveRequest(id)
        : await requestsService.rejectRequest(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      return updated;
    } catch (err) {
      fetchRequests();
      throw err;
    } finally {
      setBusyId(null);
    }
  }, [fetchRequests]);

  return { requests, total, loading, error, busyId, refetch: fetchRequests, decide };
};
