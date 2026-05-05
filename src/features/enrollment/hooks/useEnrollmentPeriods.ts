import { useCallback, useEffect, useState } from 'react';
import { fetchEnrollmentPeriods } from '../services';
import type { EnrollmentPeriod } from '../types';

export function useEnrollmentPeriods(hocKy?: string) {
  const [periods, setPeriods] = useState<EnrollmentPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadPeriods = useCallback(async (pageNum: number, semesterCode?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEnrollmentPeriods({ hocKy: semesterCode, page: pageNum, size: 10 });
      setPeriods(result.periods);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useEnrollmentPeriods] fetch error:', err);
      setError('Không thể tải danh sách đợt đăng ký học');
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPeriods(page, hocKy);
  }, [page, hocKy, loadPeriods]);

  const reload = useCallback(() => {
    loadPeriods(page, hocKy);
  }, [page, hocKy, loadPeriods]);

  return {
    periods,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
  };
}
