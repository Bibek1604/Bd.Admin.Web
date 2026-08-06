import { useState } from 'react';
import { achievementApi } from '../api/achievementApi';
import { useAdminStore } from '../store/adminStore';

export const useAchievements = () => {
  const store = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await achievementApi.getAchievements();
      store.setEntity('achievements', data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch achievements.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await achievementApi.getUserAchievements();
      store.setEntity('userAchievements', data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user achievements.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unlockAchievement = async (userId: number | string, achievementId: number | string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await achievementApi.unlockAchievement({ user_id: userId, achievement_id: achievementId });
      // Refresh user achievements after unlocking
      await fetchUserAchievements();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to unlock achievement.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    achievements: store.achievements,
    userAchievements: store.userAchievements,
    loading,
    error,
    fetchAchievements,
    fetchUserAchievements,
    unlockAchievement
  };
};
