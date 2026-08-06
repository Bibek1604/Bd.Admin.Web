import { useState, useEffect, useCallback, useMemo } from 'react';
import { bulkNotificationsService, type BulkNotification } from './bulkNotificationsService';

export const useBulkNotifications = (searchTerm: string = '', statusFilter: string = 'ALL') => {
  const [notifications, setNotifications] = useState<BulkNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bulkNotificationsService.getBulkNotifications();
      // Sort by newest first
      const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(sortedData);
    } catch (err: any) {
      setError(err.message || 'Error fetching bulk notifications');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = notif.title.toLowerCase().includes(lowerSearch) || 
                            notif.content.toLowerCase().includes(lowerSearch);
      const matchesStatus = statusFilter === 'ALL' || notif.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [notifications, searchTerm, statusFilter]);

  return { notifications: filteredNotifications, loading, error, refetch: fetchNotifications };
};
