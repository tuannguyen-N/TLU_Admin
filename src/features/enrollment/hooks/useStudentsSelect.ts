import { useEffect, useState, useMemo } from 'react';
import { fetchStudentsByFaculty } from '../../students/services';
import type { Student } from '../../students/types';

interface SelectOption {
  value: string;
  label: string;
}

export function useStudentsSelect(facultyCode?: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchStudentsByFaculty({
          ...(facultyCode && { khoa: facultyCode }),
          page: 0,
          size: 1000,
        });
        setStudents(result.students);
      } catch (err) {
        console.error('[useStudentsSelect] fetch students error:', err);
        setError('Không thể tải danh sách sinh viên');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, [facultyCode]);

  const options = useMemo<SelectOption[]>(() => {
    return students.map((student) => ({
      value: String(student.id),
      label: `${student.studentCode} - ${student.fullName}`,
    }));
  }, [students]);

  return {
    options,
    loading,
    error,
  };
}
