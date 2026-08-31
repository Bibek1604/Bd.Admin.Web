import { create } from 'zustand';

interface AdminState {
  users: any[];
  companies: any[];
  agents: any[];
  bulkNotifications: any[];
  dashboardStats: any | null;
  userDashboard: any | null;

  loading: boolean;
  error: string | null;

  setEntity: (key: keyof AdminState, data: any) => void;
  removeEntity: (key: keyof AdminState, id: string | number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  companies: [],
  agents: [],
  bulkNotifications: [],
  dashboardStats: null,
  userDashboard: null,

  loading: false,
  error: null,

  setEntity: (key, data) => set((state) => ({ ...state, [key]: data })),
  removeEntity: (key, id) => set((state) => {
    const list = (state as any)[key];
    if (Array.isArray(list)) {
      return { ...state, [key]: list.filter((item: any) => item.id !== id) };
    }
    return state;
  }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
