import { useState } from 'react';
import { newsApi, resourceApi } from '../api/resourceApi';
import { useAdminStore } from '../store/adminStore';

export const useNews = () => {
  const store = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsApi.getNews();
      store.setEntity('news', data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch news.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createNews = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await newsApi.createNews(data);
      store.setEntity('news', [...store.news, newItem]);
      return newItem;
    } catch (err: any) {
      setError(err.message || 'Failed to create news.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { news: store.news, loading, error, fetchNews, createNews };
};

export const useResources = () => {
  const store = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourceApi.getResources();
      store.setEntity('resources', data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resources.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createResource = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await resourceApi.createResource(data);
      store.setEntity('resources', [...store.resources, newItem]);
      return newItem;
    } catch (err: any) {
      setError(err.message || 'Failed to create resource.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resources: store.resources, loading, error, fetchResources, createResource };
};
