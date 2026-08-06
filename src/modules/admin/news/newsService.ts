import api from '../../../api/axiosInstance';

export type AgentNews = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  created_at: string;
};

export type CreateNewsData = {
  title: string;
  description: string;
  image?: File | null;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const BASE = '/api/admin/news/';

export const newsService = {
  getAll: async (params?: any): Promise<AgentNews[]> => {
    const response = await api.get<PaginatedResponse<AgentNews> | AgentNews[]>(BASE, { params });
    const data = response.data as any;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },

  getPage: async (params?: any): Promise<PaginatedResponse<AgentNews>> => {
    const response = await api.get<PaginatedResponse<AgentNews>>(BASE, { params });
    return response.data;
  },

  getById: async (id: number): Promise<AgentNews> => {
    const response = await api.get<AgentNews>(`${BASE}${id}/`);
    return response.data;
  },

  create: async (data: CreateNewsData): Promise<AgentNews> => {
    if (data.image instanceof File) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('image', data.image);
      const response = await api.post<AgentNews>(BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.post<AgentNews>(BASE, data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateNewsData>): Promise<AgentNews> => {
    if (data.image instanceof File) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('image', data.image);
      const response = await api.patch<AgentNews>(`${BASE}${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.patch<AgentNews>(`${BASE}${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}${id}/`);
  },
};
