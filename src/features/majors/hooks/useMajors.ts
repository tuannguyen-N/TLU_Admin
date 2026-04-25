import { useState, useCallback, useEffect } from 'react';
import { fetchMajors, deleteMajor } from '../services';
import type { Major } from '../types';
import type { Faculty } from '../../students/types';
import { fetchFaculties } from '../../students/services';

export function useMajors(khoa: string) {
  const [majors, setMajors] = useState<Major[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFaculties()
      .then((data) => setFaculties(data))
      .catch((err) => console.error('[useMajors] fetch faculties error:', err));
  }, []);

  const loadMajors = useCallback(async (khoaParam: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMajors({
        khoa: khoaParam,
        page: pageNum,
        size: 50,
      });
      setMajors(result.majors);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('[useMajors] fetch error:', err);
      setError('Không thể tải danh sách ngành');
      setMajors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMajors(khoa, page);
  }, [khoa, page, loadMajors]);

  const handleDelete = useCallback(async (majorId: number) => {
    try {
      await deleteMajor(majorId);
      loadMajors(khoa, page);
    } catch (err) {
      console.error('[useMajors] delete error:', err);
      throw err;
    }
  }, [khoa, page, loadMajors]);

  const reload = useCallback(() => {
    loadMajors(khoa, page);
  }, [khoa, page, loadMajors]);

  return {
    majors,
    faculties,
    loading,
    error,
    page,
    setPage,
    totalPages,
    reload,
    handleDelete,
  };
}
