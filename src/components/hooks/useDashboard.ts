import { useState } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { useAdminStore } from '../store/adminStore';

export const useDashboard = () => {
  const store = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await dashboardApi.getStats();
      store.setEntity('dashboardStats', stats);
      return stats;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ❌ REMOVED: fetchAuditLogs - /api/admin/audit-logs endpoint does NOT exist in backend

  return {
    dashboardStats: store.dashboardStats,
    loading,
    error,
    fetchStats
  };
};
