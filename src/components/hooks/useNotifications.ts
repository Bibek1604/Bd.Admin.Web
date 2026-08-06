import { useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useAdminStore } from '../store/adminStore';

export const useNotifications = () => {
  const store = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications();
      store.setEntity('notifications', data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getBulkNotifications();
      store.setEntity('bulkNotifications', data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bulk notifications.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBulkNotification = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await notificationApi.createBulkNotification(data);
      store.setEntity('bulkNotifications', [...store.bulkNotifications, newItem]);
      return newItem;
    } catch (err: any) {
      setError(err.message || 'Failed to create bulk notification.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications: store.notifications,
    bulkNotifications: store.bulkNotifications,
    loading,
    error,
    fetchNotifications,
    fetchBulkNotifications,
    createBulkNotification
  };
};
