import { useCallback, useEffect, useState } from 'react';
import { fetchTuitionFeeConfigs } from '../services';
import type { TuitionFeeConfig } from '../types';

export function useTuitionFeeConfigs() {
  const [configs, setConfigs] = useState<TuitionFeeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadConfigs = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTuitionFeeConfigs({ page: pageNum, size: 10 });
      setConfigs(result.configs);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useTuitionFeeConfigs] fetch error:', err);
      setError('Không thể tải danh sách cấu hình học phí');
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs(page);
  }, [page, loadConfigs]);

  const reload = useCallback(() => {
    loadConfigs(page);
  }, [page, loadConfigs]);

  return {
    configs,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
  };
}
