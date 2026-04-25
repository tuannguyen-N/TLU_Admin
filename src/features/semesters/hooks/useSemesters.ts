import { useState, useCallback, useEffect } from 'react';
import { fetchSemesters, createSemester, updateSemester, deleteSemester } from '../services';
import type { Semester, SemesterFormData } from '../types';

export function useSemesters() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadSemesters = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSemesters({ page: pageNum, size: 10 });
      setSemesters(result.semesters);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useSemesters] fetch error:', err);
      setError('Không thể tải danh sách học kỳ');
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSemesters(page);
  }, [page, loadSemesters]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteSemester(id);
      loadSemesters(page);
    } catch (err) {
      console.error('[useSemesters] delete error:', err);
      throw err;
    }
  }, [page, loadSemesters]);

  const handleCreate = useCallback(async (payload: SemesterFormData) => {
    try {
      await createSemester(payload);
      loadSemesters(page);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [page, loadSemesters]);

  const handleUpdate = useCallback(async (id: number, payload: SemesterFormData) => {
    try {
      await updateSemester(id, payload);
      loadSemesters(page);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [page, loadSemesters]);

  const reload = useCallback(() => {
    loadSemesters(page);
  }, [page, loadSemesters]);

  return {
    semesters,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
    handleDelete,
    handleCreate,
    handleUpdate,
  };
}