import { useState, useEffect, useCallback } from 'react';
import { usersService } from './usersService';
import type { User } from './usersService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401 || err.name === 'CanceledError' || err.message === 'canceled') {
        // Silent fail for expected auth errors or cancellations
        return;
      }
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (id: number) => {
    try {
      await usersService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleBulkAction = async (ids: number[], action: 'activate' | 'deactivate') => {
    try {
      await usersService.bulkAction(ids, action);
      await fetchUsers();
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
    deleteUser,
    handleBulkAction
  };
};
