import { useState, useMemo, useEffect, useCallback } from 'react';
import { fetchFaculties, fetchStudentsByFaculty } from '../services/index';
import type { Faculty, Student } from '../types';

export interface StudentStats {
  total: number;
  male: number;
  female: number;
  femaleRatio: string;
}

export function useStudents() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchFaculties()
      .then((data) => {
        setFaculties(data);
      })
      .catch((err) => {
        console.error('[useStudents] fetch faculties error:', err);
      });
  }, []);

  const loadStudents = useCallback(async (faculty: Faculty, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStudentsByFaculty({
        khoa: faculty.facultyCode,
        page: pageNum,
        size: 50,
      });
      setStudents(result.students);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('[useStudents] fetch students error:', err);
      setError('Không thể tải danh sách sinh viên');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      loadStudents(selectedFaculty, page);
    } else {
      setStudents([]);
      setTotalPages(0);
      setTotalElements(0);
    }
  }, [selectedFaculty, page, loadStudents]);

  const stats: StudentStats = useMemo(() => {
    const total = students.length;
    const male = students.filter((s) => s.gender === 'Nam').length;
    const female = students.filter((s) => s.gender === 'Nữ').length;
    const femaleRatio = total > 0 ? ((female / total) * 100).toFixed(1) : '0.0';
    return { total, male, female, femaleRatio };
  }, [students]);

  const filtered = useMemo(() => {
    const activeStudents = students.filter((s) => s.status !== 'DELETED');
    if (!search.trim()) return activeStudents;
    const q = search.toLowerCase();
    return activeStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.contact.email.toLowerCase().includes(q)
    );
  }, [students, search]);

  const setSelectedFacultyAndReset = useCallback((f: Faculty | null) => {
    setSelectedFaculty(f);
    setPage(0);
    setSearch('');
  }, []);

  return {
    faculties,
    selectedFaculty,
    setSelectedFaculty: setSelectedFacultyAndReset,
    students: filtered,
    loading,
    error,
    stats,
    totalElements,
    search,
    setSearch: (v: string) => { setSearch(v); setPage(0); },
    page,
    setPage,
    totalPages,
    reload: () => selectedFaculty && loadStudents(selectedFaculty, page),
  };
}
