import { useState, useCallback, useEffect } from 'react';
import { fetchCourseClassesAPI, createCourseClassAPI, deleteCourseClassAPI, updateCourseClassAPI } from '../services';
import type{ CourseClass, CourseClassFormData } from '../types';
import { fetchFaculties, fetchDepartments, fetchSubjectsAPI } from '../../subjects/services';
import type { FacultyOption, Subject } from '../../subjects/types';
import { fetchLecturersAPI } from '../../lecturers/services';
import type { Lecturer } from '../../lecturers/types';
import type { DepartmentOption } from '../../subjects/types';
import { fetchSemesters } from '../../semesters/services';
import type { SemesterOption } from '../../exams/types';
import type { Semester } from '../../semesters/types';

export function useCourseClasses(khoa: string = '', hocKy: string = '') {
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    fetchFaculties()
      .then((data) => setFaculties(data))
      .catch((err) => console.error('[useCourseClasses] fetch faculties error:', err));
    fetchDepartments()
      .then((data) => setDepartments(data))
      .catch((err) => console.error('[useCourseClasses] fetch departments error:', err));
    fetchLecturersAPI({ page: 0, size: 200 })
      .then((data) => {
        const activeLecturers = (data.content || []).filter((l: Lecturer) => l.status !== 'INACTIVE');
        setLecturers(activeLecturers);
      })
      .catch((err) => console.error('[useCourseClasses] fetch lecturers error:', err));
    fetchSubjectsAPI({ page: 0, size: 200 })
      .then((data) => {
        setSubjects(data.subjects);
      })
      .catch((err) => console.error('[useCourseClasses] fetch subjects error:', err));
    fetchSemesters({ page: 0, size: 20 })
        .then((data) => setSemesters(data.semesters))
        .catch((err) => console.error(err));
  }, []);

const loadCourseClasses = useCallback(
  async (
    facultyCode: string,
    semesterCode: string,
    pageNum: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchCourseClassesAPI({
        khoa: facultyCode,
        hocKy: semesterCode,
        page: pageNum,
        size: 10,
      });

      const activeClasses = (result.content || []).filter(
        (c: CourseClass) => c.isActive !== false
      );

      setCourseClasses(activeClasses);
      setTotalPages(result.totalPages || 0);
    } catch (err) {
      console.error('[useCourseClasses] fetch error:', err);
      setError('Không thể tải danh sách lớp học phần');
      setCourseClasses([]);
    } finally {
      setLoading(false);
    }
  },
  []
);

useEffect(() => {
  loadCourseClasses(khoa, hocKy, page);
}, [khoa, hocKy, page, loadCourseClasses]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteCourseClassAPI(id);
      loadCourseClasses(khoa, hocKy, page);
    } catch (err) {
      console.error('[useCourseClasses] delete error:', err);
      throw err;
    }
  }, [khoa, hocKy, page, loadCourseClasses]);

  const handleCreate = useCallback(
    async (payload: CourseClassFormData) => {
      try {
        await createCourseClassAPI(payload);
        loadCourseClasses(khoa, hocKy, page);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    [khoa, hocKy, page, loadCourseClasses]
  );

  const handleUpdate = useCallback(
    async (id: number, payload: CourseClassFormData) => {
      try {
        await updateCourseClassAPI(id, payload);
        loadCourseClasses(khoa, hocKy, page);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    [khoa, hocKy, page, loadCourseClasses]
  );

  const reload = useCallback(() => {
    loadCourseClasses(khoa, hocKy, page);
  }, [khoa, hocKy, page, loadCourseClasses]);

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
    semesters,
    reload,
    handleDelete,
    handleCreate,
    handleUpdate,
  };
}
