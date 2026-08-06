import { useState } from 'react';
import { adminApi } from '../api/adminApi';
import { useAdminStore } from '../store/adminStore';

export const useAdmin = () => {
  const store = useAdminStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const performAction = async (action: () => Promise<any>) => {
    setLocalLoading(true);
    setLocalError(null);
    store.setLoading(true);
    store.setError(null);
    try {
      const result = await action();
      return result;
    } catch (err: any) {
      setLocalError(err.message || 'Action failed.');
      store.setError(err.message || 'Action failed.');
      throw err;
    } finally {
      setLocalLoading(false);
      store.setLoading(false);
    }
  };

  // Generic fetch for any admin entity
  const fetchEntities = async (entityKey: string, storeKey: any) => {
    return performAction(async () => {
      const data = await adminApi.fetchEntity(entityKey);
      store.setEntity(storeKey, data);
      return data;
    });
  };

  // CRUD wrappers
  const createEntity = async (entityKey: string, storeKey: any, data: any) => {
    return performAction(async () => {
      const newItem = await adminApi.createEntity(entityKey, data);
      const list = (store as any)[storeKey];
      if (Array.isArray(list)) {
        store.setEntity(storeKey, [...list, newItem]);
      }
      return newItem;
    });
  };

  const updateEntity = async (entityKey: string, storeKey: any, id: string | number, data: any) => {
    return performAction(async () => {
      const updatedItem = await adminApi.updateEntity(entityKey, id, data);
      const list = (store as any)[storeKey];
      if (Array.isArray(list)) {
        store.setEntity(storeKey, list.map((item: any) => item.id === id ? updatedItem : item));
      }
      return updatedItem;
    });
  };

  const deleteEntity = async (entityKey: string, storeKey: any, id: string | number) => {
    return performAction(async () => {
      await adminApi.deleteEntity(entityKey, id);
      store.removeEntity(storeKey, id);
    });
  };

  // Specific helpers for all admin entities
  return {
    ...store,
    loading: localLoading || store.loading,
    error: localError || store.error,
    
    // Entity specific hooks
    fetchUsers: () => fetchEntities('users', 'users'),
    fetchCompanies: () => fetchEntities('companies', 'companies'),
    fetchAgents: () => fetchEntities('agents', 'agents'),
    fetchBulkNotifications: () => fetchEntities('bulk-notifications', 'bulkNotifications'),
    fetchNotifications: () => fetchEntities('notifications', 'notifications'),
    fetchPolicies: () => fetchEntities('policies', 'policies'),
    fetchReports: () => fetchEntities('reports', 'reports'),
    fetchNews: () => fetchEntities('news', 'news'),
    fetchResources: () => fetchEntities('resources', 'resources'),
    fetchAchievements: () => fetchEntities('achievements', 'achievements'),
    fetchUserAchievements: () => fetchEntities('user-achievements', 'userAchievements'),
    
    // CRUD wrappers
    createUser: (data: any) => createEntity('users', 'users', data),
    updateUser: (id: string | number, data: any) => updateEntity('users', 'users', id, data),
    deleteUser: (id: string | number) => deleteEntity('users', 'users', id),
    
    createCompany: (data: any) => createEntity('companies', 'companies', data),
    updateCompany: (id: string|number, data: any) => updateEntity('companies', 'companies', id, data),
    deleteCompany: (id: string|number) => deleteEntity('companies', 'companies', id),
    
    // ... similarly others can be added as needed, but let's add basic ones.
    
    fetchDashboardStats: async () => {
      return performAction(async () => {
        const stats = await adminApi.getDashboardStats();
        store.setEntity('dashboardStats', stats);
        return stats;
      });
    },

    // ❌ REMOVED: fetchAuditLogs - /api/admin/audit-logs endpoint does NOT exist in backend
  };
};
