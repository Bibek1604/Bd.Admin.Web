import { useState, useEffect, useCallback } from 'react';
import { agentsService, type Agent } from './agentsService';
import { extractMessage } from '../../../utils/formErrors';

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
      // A 401 here means the refresh already failed and the store is signing
      // out, so there is nothing useful to show; a cancellation is expected.
      if (err.response?.status === 401 || err.name === 'CanceledError') return;
      setError(extractMessage(err, 'Could not load agents.'));
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
