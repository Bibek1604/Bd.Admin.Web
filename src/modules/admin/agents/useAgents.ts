import { useState, useEffect, useCallback } from 'react';
import { agentsService, type Agent } from './agentsService';

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const data = await agentsService.getAll(params);
      setAgents(data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401 || err.name === 'CanceledError') {
        // Silent fail for expected auth errors or cancellations
        return;
      }
      setError(err.message || 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data: any) => {
    try {
      const newAgent = await agentsService.createAgent(data);
      setAgents(prev => [newAgent, ...prev]);
      fetchAgents();
      return newAgent;
    } catch (err: any) {
      throw err;
    }
  };

  const update = async (id: number, data: any) => {
    try {
      const updated = await agentsService.patchAgent(id, data);
      setAgents(prev => prev.map(a => a.id === id ? updated : a));
      fetchAgents();
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  const remove = async (id: number) => {
    try {
      await agentsService.deleteAgent(id);
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    loading,
    error,
    refresh: fetchAgents,
    create,
    update,
    remove
  };
};
