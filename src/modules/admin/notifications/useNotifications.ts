import { useState, useEffect, useCallback } from 'react';
import notificationsService, { type Notification } from './notificationsService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const data = await notificationsService.getNotifications(filters);
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    refresh: fetchNotifications
  };
};
