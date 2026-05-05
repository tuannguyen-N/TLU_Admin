import { useCallback, useEffect, useState } from 'react';
import { fetchStudentEnrollments } from '../services';
import type { StudentEnrollment, StudentEnrollmentFilter } from '../types';

export function useStudentEnrollments(filter: StudentEnrollmentFilter) {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnrollments = useCallback(async (currentFilter: StudentEnrollmentFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStudentEnrollments(currentFilter);
      setEnrollments(result);
    } catch (err) {
      console.error('[useStudentEnrollments] fetch error:', err);
      setError('Không thể tải danh sách đăng ký của sinh viên');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollments(filter);
  }, [filter, loadEnrollments]);

  const reload = useCallback(() => {
    loadEnrollments(filter);
  }, [filter, loadEnrollments]);

  return {
    enrollments,
    loading,
    error,
    reload,
  };
}
