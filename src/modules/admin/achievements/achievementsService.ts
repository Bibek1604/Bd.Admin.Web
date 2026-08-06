import api from '../../../api/axiosInstance';

export type Achievement = {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  required_xp: number;
  created_at: string;
};

export type UserAchievement = {
  id: number;
  user: number;
  username: string;
  achievement: number;
  achievement_title: string;
  achievement_icon: string | null;
  unlocked_at: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const BASE = '/api/admin/achievements/';
const USER_ACHIEVEMENTS_BASE = '/api/admin/user-achievements/';

export const achievementsService = {
  // Achievements
  getAll: async (params?: any): Promise<Achievement[]> => {
    const response = await api.get<PaginatedResponse<Achievement> | Achievement[]>(BASE, { params });
    const data = response.data as any;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },

  getById: async (id: number): Promise<Achievement> => {
    const response = await api.get<Achievement>(`${BASE}${id}/`);
    return response.data;
  },

  create: async (data: Partial<Achievement>): Promise<Achievement> => {
    const response = await api.post<Achievement>(BASE, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Achievement>): Promise<Achievement> => {
    const response = await api.patch<Achievement>(`${BASE}${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}${id}/`);
  },

  // User Achievements tracking
  getUserAchievements: async (params?: any): Promise<UserAchievement[]> => {
    const response = await api.get<PaginatedResponse<UserAchievement> | UserAchievement[]>(USER_ACHIEVEMENTS_BASE, { params });
    const data = response.data as any;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },

  unlock: async (userId: number, achievementId: number): Promise<any> => {
    const response = await api.post(`${USER_ACHIEVEMENTS_BASE}unlock/`, {
      user_id: userId,
      achievement_id: achievementId,
    });
    return response.data;
  }
};
