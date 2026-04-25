import { useState, useCallback, useEffect } from 'react';
import { fetchStudentClasses, deleteStudentClass } from '../services';
import type { StudentClass } from '../types';
import type { Faculty } from '../../students/types';
import { fetchFaculties } from '../../students/services';
import { fetchMajors } from '../../majors/services';
import type { Major } from '../../majors/types';

export function useStudentClasses(khoa: string) {
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFaculties()
      .then((data) => setFaculties(data))
      .catch((err) => console.error('[useStudentClasses] fetch faculties error:', err));
  }, []);

  const loadMajors = useCallback(async (khoaParam: string) => {
    try {
      const result = await fetchMajors({ khoa: khoaParam, page: 0, size: 100 });
      setMajors(result.majors);
    } catch (err) {
      console.error('[useStudentClasses] fetch majors error:', err);
    }
  }, []);

  useEffect(() => {
    loadMajors(khoa);
  }, [khoa, loadMajors]);

  const loadStudentClasses = useCallback(async (khoaParam: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStudentClasses({
        khoa: khoaParam,
        page: pageNum,
        size: 50,
      });
      setStudentClasses(result.studentClasses);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('[useStudentClasses] fetch error:', err);
      setError('Không thể tải danh sách lớp sinh viên');
      setStudentClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentClasses(khoa, page);
  }, [khoa, page, loadStudentClasses]);

  const handleDelete = useCallback(async (classId: number) => {
    try {
      await deleteStudentClass(classId);
      loadStudentClasses(khoa, page);
    } catch (err) {
      console.error('[useStudentClasses] delete error:', err);
      throw err;
    }
  }, [khoa, page, loadStudentClasses]);

  const reload = useCallback(() => {
    loadStudentClasses(khoa, page);
  }, [khoa, page, loadStudentClasses]);

  return {
    studentClasses,
    faculties,
    majors,
    loading,
    error,
    page,
    setPage,
    totalPages,
    reload,
    handleDelete,
  };
}