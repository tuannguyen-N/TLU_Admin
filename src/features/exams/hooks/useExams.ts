import { useState, useEffect, useCallback } from 'react';
import { fetchExamsAPI, createExamAPI, updateExamAPI, deleteExamAPI } from '../services';
import type { FetchExamsParams } from '../services';
import type { Exam, ExamFormData } from '../types';

interface UseExamsReturn {
  exams: Exam[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  setPage: (p: number) => void;
  reload: () => void;
  handleCreate: (data: ExamFormData) => Promise<void>;
  handleUpdate: (id: number, data: Partial<ExamFormData>) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}

export function useExams(params: FetchExamsParams): UseExamsReturn {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadExams = useCallback(async () => {
    if (!params.semesterId) {
      setExams([]);
      setTotalPages(0);
      setTotalElements(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchExamsAPI({ ...params, page });
      setExams(result.exams);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải lịch thi');
    } finally {
      setLoading(false);
    }
  }, [params.semesterId, params.facultyId, page, refreshKey]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const reload = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleCreate = useCallback(async (data: ExamFormData) => {
    await createExamAPI(data);
    reload();
  }, [reload]);

  const handleUpdate = useCallback(async (id: number, data: Partial<ExamFormData>) => {
    await updateExamAPI(id, data);
    reload();
  }, [reload]);

  const handleDelete = useCallback(async (id: number) => {
    await deleteExamAPI(id);
    reload();
  }, [reload]);

  return {
    exams,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    setPage,
    reload,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
