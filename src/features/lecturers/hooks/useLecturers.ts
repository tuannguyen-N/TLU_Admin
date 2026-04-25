import { useState, useCallback, useEffect } from 'react';
import { fetchLecturersAPI, createLecturerAPI, deleteLecturerAPI, updateLecturerAPI, fetchDepartmentsAPI } from '../services';
import type { Lecturer, LecturerFormData, DepartmentOption } from '../types';
import { fetchFaculties } from '../../subjects/services';
import type { FacultyOption } from '../../subjects/types';

export function useLecturers(khoa: string = '') {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  useEffect(() => {
    fetchFaculties()
      .then((data) => setFaculties(data))
      .catch((err) => console.error('[useLecturers] fetch faculties error:', err));
    fetchDepartmentsAPI()
      .then((data) => setDepartments(data))
      .catch((err) => console.error('[useLecturers] fetch departments error:', err));
  }, []);

  const loadLecturers = useCallback(async (facultyCode: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLecturersAPI({ khoa: facultyCode, page: pageNum, size: 10 });
      const activeLecturers = (result.content || []).filter((l) => l.status !== 'INACTIVE') as Lecturer[];
      setLecturers(activeLecturers);
      setTotalPages(result.total_pages || 0);
    } catch (err) {
      console.error('[useLecturers] fetch error:', err);
      setError('Không thể tải danh sách giảng viên');
      setLecturers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLecturers(khoa, page);
  }, [khoa, page, loadLecturers]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteLecturerAPI(id);
      loadLecturers(khoa, page);
    } catch (err) {
      console.error('[useLecturers] delete error:', err);
      throw err;
    }
  }, [khoa, page, loadLecturers]);

  const handleCreate = useCallback(
    async (payload: LecturerFormData) => {
      await createLecturerAPI(payload);
      loadLecturers(khoa, page);
    },
    [khoa, page, loadLecturers]
  );

  const handleUpdate = useCallback(
    async (id: number, payload: LecturerFormData) => {
      try {
        await updateLecturerAPI(id, payload);
        loadLecturers(khoa, page);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    [khoa, page, loadLecturers]
  );

  const reload = useCallback(() => {
    loadLecturers(khoa, page);
  }, [khoa, page, loadLecturers]);

  return {
    lecturers,
    loading,
    error,
    page,
    setPage,
    totalPages,
    faculties,
    departments,
    reload,
    handleDelete,
    handleCreate,
    handleUpdate,
  };
}
