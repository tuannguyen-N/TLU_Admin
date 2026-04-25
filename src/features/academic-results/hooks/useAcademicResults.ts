import { useState, useCallback, useEffect } from 'react';
import { fetchAcademicResults, addAcademicResult, importAcademicResultsFromExcel, updateAcademicResultAPI } from '../services';
import type { AcademicResult, UpdateAcademicResultPayload } from '../types';
import { fetchFaculties } from '../../subjects/services';
import type { FacultyOption } from '../../subjects/types';

export function useAcademicResults(khoa: string = '') {
  const [academicResults, setAcademicResults] = useState<AcademicResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);

  useEffect(() => {
    fetchFaculties()
      .then((data) => setFaculties(data))
      .catch((err) => console.error('[useAcademicResults] fetch faculties error:', err));
  }, []);

  const loadAcademicResults = useCallback(async (khoaCode: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAcademicResults({ khoa: khoaCode, page: pageNum, size: 10 });
      setAcademicResults(result.academicResults);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useAcademicResults] fetch error:', err);
      setError('Không thể tải danh sách kết quả học tập');
      setAcademicResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAcademicResults(khoa, page);
  }, [khoa, page, loadAcademicResults]);

  const handleAddResult = useCallback(
    async (payload: Parameters<typeof addAcademicResult>[0]) => {
      await addAcademicResult(payload);
      loadAcademicResults(khoa, page);
    },
    [khoa, page, loadAcademicResults]
  );

  const handleImportExcel = useCallback(
    async (file: File) => {
      await importAcademicResultsFromExcel(file);
      loadAcademicResults(khoa, page);
    },
    [khoa, page, loadAcademicResults]
  );

  const handleUpdateResult = useCallback(
    async (subjectResultId: number, payload: UpdateAcademicResultPayload) => {
      await updateAcademicResultAPI(subjectResultId, payload);
      loadAcademicResults(khoa, page);
    },
    [khoa, page, loadAcademicResults]
  );

  const reload = useCallback(() => {
    loadAcademicResults(khoa, page);
  }, [khoa, page, loadAcademicResults]);

  return {
    academicResults,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalElements,
    faculties,
    reload,
    handleAddResult,
    handleImportExcel,
    handleUpdateResult,
  };
}
