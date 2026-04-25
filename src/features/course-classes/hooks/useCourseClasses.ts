import { useState, useCallback, useEffect } from 'react';
import { fetchCourseClassesAPI, createCourseClassAPI, deleteCourseClassAPI, updateCourseClassAPI } from '../services';
import type{ CourseClass, CourseClassFormData } from '../types';
import { fetchFaculties, fetchDepartments, fetchSubjectsAPI } from '../../subjects/services';
import type { FacultyOption, Subject } from '../../subjects/types';
import { fetchLecturersAPI } from '../../lecturers/services';
import type { Lecturer } from '../../lecturers/types';
import type { DepartmentOption } from '../../subjects/types';

export function useCourseClasses(khoa: string = '') {
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchFaculties()
      .then((data) => setFaculties(data))
      .catch((err) => console.error('[useCourseClasses] fetch faculties error:', err));
    fetchDepartments()
      .then((data) => setDepartments(data))
      .catch((err) => console.error('[useCourseClasses] fetch departments error:', err));
    fetchLecturersAPI({ page: 0, size: 100 })
      .then((data) => {
        const activeLecturers = (data.content || []).filter((l: Lecturer) => l.status !== 'INACTIVE');
        setLecturers(activeLecturers);
      })
      .catch((err) => console.error('[useCourseClasses] fetch lecturers error:', err));
    fetchSubjectsAPI({ page: 0, size: 100 })
      .then((data) => {
        setSubjects(data.subjects);
      })
      .catch((err) => console.error('[useCourseClasses] fetch subjects error:', err));
  }, []);

  const loadCourseClasses = useCallback(async (facultyCode: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCourseClassesAPI({ khoa: facultyCode, page: pageNum, size: 10 });
      // Filter out inactive course classes
      const activeClasses = (result.content || []).filter((c: CourseClass) => c.isActive !== false);
      setCourseClasses(activeClasses);
      setTotalPages(result.total_pages || 0);
    } catch (err) {
      console.error('[useCourseClasses] fetch error:', err);
      setError('Không thể tải danh sách lớp học phần');
      setCourseClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourseClasses(khoa, page);
  }, [khoa, page, loadCourseClasses]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteCourseClassAPI(id);
      loadCourseClasses(khoa, page);
    } catch (err) {
      console.error('[useCourseClasses] delete error:', err);
      throw err;
    }
  }, [khoa, page, loadCourseClasses]);

  const handleCreate = useCallback(
    async (payload: CourseClassFormData) => {
      try {
        await createCourseClassAPI(payload);
        loadCourseClasses(khoa, page);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    [khoa, page, loadCourseClasses]
  );

  const handleUpdate = useCallback(
    async (id: number, payload: CourseClassFormData) => {
      try {
        await updateCourseClassAPI(id, payload);
        loadCourseClasses(khoa, page);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    [khoa, page, loadCourseClasses]
  );

  const reload = useCallback(() => {
    loadCourseClasses(khoa, page);
  }, [khoa, page, loadCourseClasses]);

  return {
    courseClasses,
    loading,
    error,
    page,
    setPage,
    totalPages,
    faculties,
    departments,
    lecturers,
    subjects,
    reload,
    handleDelete,
    handleCreate,
    handleUpdate,
  };
}
