import { useState, useEffect, useCallback, useMemo } from 'react';
import { bulkNotificationsService, type BulkNotification } from './bulkNotificationsService';

export const useBulkNotifications = (searchTerm: string = '', audienceFilter: string = 'ALL') => {
  const [notifications, setNotifications] = useState<BulkNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bulkNotificationsService.getBulkNotifications();
      setNotifications(
        [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      );
    } catch (err: any) {
      setError(err.errorMessage || err.message || 'Error fetching notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const remove = useCallback(async (id: string) => {
    await bulkNotificationsService.deleteBulkNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      const matchesAudience = audienceFilter === 'ALL' || n.target_type === audienceFilter;
      return matchesSearch && matchesAudience;
    });
  }, [notifications, searchTerm, audienceFilter]);

  return { notifications: filtered, allCount: notifications.length, loading, error, refetch: fetchNotifications, remove };
};
