import { useState, useCallback } from 'react';
import type { AcademicAdvisorDetail, ClassInfo } from '../types';
import {
  fetchAcademicAdvisorDetailAPI,
  deleteAcademicAdvisorClassAPI,
  createAcademicAdvisorAPI,
} from '../services';

export function useAcademicAdvisors() {
  const [advisorDetail, setAdvisorDetail] = useState<AcademicAdvisorDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvisorDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAcademicAdvisorDetailAPI(id);
      setAdvisorDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch advisor detail');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClass = useCallback(async (academicAdvisorId: number): Promise<boolean> => {
    try {
      await deleteAcademicAdvisorClassAPI(academicAdvisorId);
      if (advisorDetail) {
        setAdvisorDetail({
          ...advisorDetail,
          classInfo: advisorDetail.classInfo.filter(
            c => c.academicAdvisorId !== academicAdvisorId
          ),
        });
      }
      return true;
    } catch {
      return false;
    }
  }, [advisorDetail]);

  const removeClassFromList = useCallback((academicAdvisorId: number) => {
    if (advisorDetail) {
      setAdvisorDetail({
        ...advisorDetail,
        classInfo: advisorDetail.classInfo.filter(
          c => c.academicAdvisorId !== academicAdvisorId
        ),
      });
    }
  }, [advisorDetail]);

  const createAcademicAdvisor = useCallback(async (lecturerId: number, studentClassId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await createAcademicAdvisorAPI(lecturerId, studentClassId);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bổ nhiệm cố vấn học tập thất bại';
      return { success: false, error: message };
    }
  }, []);

  return {
    advisorDetail,
    loading,
    error,
    fetchAdvisorDetail,
    deleteClass,
    removeClassFromList,
    createAcademicAdvisor,
  };
}