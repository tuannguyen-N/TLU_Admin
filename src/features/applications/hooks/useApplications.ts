import { useState, useCallback, useEffect } from 'react';
import { fetchApplications } from '../services';
import type { Application } from '../types';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadApplications = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApplications(pageNum, 10);
      setApplications(result.applications);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useApplications] fetch error:', err);
      setError('Không thể tải danh sách đơn từ');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications(page);
  }, [page, loadApplications]);

  const reload = useCallback(() => {
    loadApplications(page);
  }, [page, loadApplications]);

  return {
    applications,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
  };
}