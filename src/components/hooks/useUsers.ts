import { useState } from 'react';
import { userApi } from '../api/userApi';
import { useAdminStore } from '../store/adminStore';

export const useUsers = () => {
  const store = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getUsers();
      store.setEntity('users', data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userApi.createUser(data);
      store.setEntity('users', [...store.users, newUser]);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number | string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userApi.updateUser(id, data);
      store.setEntity('users', store.users.map((u: any) => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to update user.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number | string) => {
    setLoading(true);
    setError(null);
    try {
      await userApi.deleteUser(id);
      store.removeEntity('users', id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users: store.users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};
