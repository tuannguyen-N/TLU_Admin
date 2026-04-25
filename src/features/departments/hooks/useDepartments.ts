import { useState, useEffect } from 'react';
import { fetchFaculties } from '../../students/services';
import type { Faculty } from '../../students/types';

export function useDepartments() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchFaculties()
      .then((data) => {
        setFaculties(data);
        setError(null);
      })
      .catch((err) => {
        console.error('[useDepartments] fetch faculties error:', err);
        setError('Không thể tải danh sách khoa/bộ môn');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    faculties,
    loading,
    error,
    reload: () => {
      setLoading(true);
      fetchFaculties()
        .then((data) => {
          setFaculties(data);
          setError(null);
        })
        .catch((err) => {
          console.error('[useDepartments] fetch faculties error:', err);
          setError('Không thể tải danh sách khoa/bộ môn');
        })
        .finally(() => {
          setLoading(false);
        });
    },
  };
}