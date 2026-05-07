import { useEffect, useState, useMemo } from 'react';
import { fetchFaculties } from '../services';
import type { Faculty } from '../types';

interface SelectOption {
  value: string;
  label: string;
}

export function useFacultiesSelect() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllFaculties = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFaculties();

        setFaculties(result);
      } catch (err) {
        console.error('[useFacultiesSelect] fetch faculties error:', err);
        setError('Không thể tải danh sách khoa');
        setFaculties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFaculties();
  }, []);

  const options = useMemo<SelectOption[]>(() => {
    return faculties.map((faculty) => ({
      value: String(faculty.id),
      label: `${faculty.facultyCode} - ${faculty.name}`,
    }));
  }, [faculties]);

  return {
    options,
    faculties,
    loading,
    error,
  };
}
