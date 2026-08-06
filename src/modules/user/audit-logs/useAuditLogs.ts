import { useState, useEffect, useCallback, useMemo } from 'react';
import { auditLogsService, type AuditLog } from './auditLogsService';

export const useAuditLogs = (searchTerm: string = '') => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auditLogsService.getAuditLogs();
      // Sort by newest first
      const sortedData = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(sortedData);
    } catch (err: any) {
      setError(err.message || 'Error fetching audit logs');
      console.error('Audit log fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const lowerSearch = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.action.toLowerCase().includes(lowerSearch) ||
      log.admin_username?.toLowerCase().includes(lowerSearch) ||
      log.details?.toLowerCase().includes(lowerSearch)
    );
  }, [logs, searchTerm]);

  return { logs: filteredLogs, loading, error, refetch: fetchLogs };
};
