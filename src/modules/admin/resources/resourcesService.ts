import api from '../../../api/axiosInstance';

export type Resource = {
  id: number;
  title: string;
  file: string | null;
  link: string | null;
  created_at: string;
};

export type CreateResourceData = {
  title: string;
  file?: File | null;
  link?: string | null;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const BASE = '/api/admin/resources/';

export const resourcesService = {
  getAll: async (params?: any): Promise<Resource[]> => {
    const response = await api.get<PaginatedResponse<Resource> | Resource[]>(BASE, { params });
    const data = response.data as any;
    return Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  },

  getPage: async (params?: any): Promise<PaginatedResponse<Resource>> => {
    const response = await api.get<PaginatedResponse<Resource>>(BASE, { params });
    return response.data;
  },

  getById: async (id: number): Promise<Resource> => {
    const response = await api.get<Resource>(`${BASE}${id}/`);
    return response.data;
  },

  create: async (data: CreateResourceData): Promise<Resource> => {
    if (data.file instanceof File) {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.link) formData.append('link', data.link);
      formData.append('file', data.file);
      const response = await api.post<Resource>(BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.post<Resource>(BASE, data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateResourceData>): Promise<Resource> => {
    if (data.file instanceof File) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.link) formData.append('link', data.link);
      formData.append('file', data.file);
      const response = await api.patch<Resource>(`${BASE}${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.patch<Resource>(`${BASE}${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE}${id}/`);
  },
};
