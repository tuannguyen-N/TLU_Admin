import { useState, useCallback, useEffect } from 'react';
import { fetchTrainingPrograms, deleteTrainingProgram } from '../services/index';
import type { TrainingProgram } from '../types';
import type { Faculty } from '../../students/types';
import { fetchFaculties } from '../../students/services';

export function useTrainingPrograms(selectedYear: number, facultyCode?: string) {
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchFaculties()
      .then((data) => setFaculties(data))
      .catch((err) => console.error('[useTrainingPrograms] fetch faculties error:', err));
  }, []);

  const loadTrainingPrograms = useCallback(async (year: number, pageNum: number, khoa?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTrainingPrograms({
        startYear: year,
        khoa,
        page: pageNum,
        size: 50,
      });
      setTrainingPrograms(result.trainingPrograms);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useTrainingPrograms] fetch error:', err);
      setError('Không thể tải danh sách chương trình đào tạo');
      setTrainingPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrainingPrograms(selectedYear, page, facultyCode);
  }, [selectedYear, page, facultyCode, loadTrainingPrograms]);

  const handleDelete = useCallback(async (programId: number) => {
    try {
      await deleteTrainingProgram(programId);
      loadTrainingPrograms(selectedYear, page, facultyCode);
    } catch (err) {
      console.error('[useTrainingPrograms] delete error:', err);
      throw err;
    }
  }, [selectedYear, page, facultyCode, loadTrainingPrograms]);

  const reload = useCallback(() => {
    loadTrainingPrograms(selectedYear, page, facultyCode);
  }, [selectedYear, page, facultyCode, loadTrainingPrograms]);

  return {
    trainingPrograms,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    reload,
    handleDelete,
    faculties,
  };
}
