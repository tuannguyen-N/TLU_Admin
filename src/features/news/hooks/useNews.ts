import { useState, useCallback, useEffect } from 'react';
import { fetchNews } from '../services';
import type { News } from '../types';

export function useNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadNews = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNews(pageNum, 10);
      setNews(result.news);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useNews] fetch error:', err);
      setError('Không thể tải danh sách tin tức');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews(page);
  }, [page, loadNews]);

  const reload = useCallback(() => {
    loadNews(page);
  }, [page, loadNews]);

  return {
    news,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
  };
}