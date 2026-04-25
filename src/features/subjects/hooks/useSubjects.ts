import { useState, useCallback, useEffect } from 'react';
import { fetchSubjects, deleteSubject, fetchFaculties } from '../services';
import type { Subject } from '../types';
import type { FacultyOption } from '../types';

export function useSubjects(khoa: string) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFaculties()
      .then((data) => setFaculties(data))
      .catch((err) => console.error('[useSubjects] fetch faculties error:', err));
  }, []);

  const loadSubjects = useCallback(async (facultyCode: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      // Find facultyId from facultyCode
      const selectedFaculty = faculties.find(f => f.value === facultyCode);
      const facultyId = selectedFaculty?.id;

      const result = await fetchSubjects({
        facultyId: facultyId,
        page: pageNum,
        size: 50,
      });
      console.log('[DEBUG] All subjects from API:', result.subjects);
      setSubjects(result.subjects);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('[useSubjects] fetch error:', err);
      setError('Không thể tải danh sách môn học');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [faculties]);

  useEffect(() => {
    loadSubjects(khoa, page);
  }, [khoa, page, loadSubjects]);

  const handleDelete = useCallback(async (subjectId: number) => {
    try {
      await deleteSubject(subjectId);
      loadSubjects(khoa, page);
    } catch (err) {
      console.error('[useSubjects] delete error:', err);
      throw err;
    }
  }, [khoa, page, loadSubjects]);

  const reload = useCallback(() => {
    loadSubjects(khoa, page);
  }, [khoa, page, loadSubjects]);

  return {
    subjects,
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