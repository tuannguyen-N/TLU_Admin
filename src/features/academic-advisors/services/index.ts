import { apiClient } from '../../../lib/api-client';
import type { AcademicAdvisorDetail } from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const fetchAcademicAdvisorDetailAPI = async (id: number): Promise<AcademicAdvisorDetail> => {
  const response = await apiClient<ApiResponse<AcademicAdvisorDetail>>(
    `/academic-advisors/${id}`,
    { method: 'GET' }
  );
  return response.data;
};

export const deleteAcademicAdvisorClassAPI = async (academicAdvisorId: number): Promise<void> => {
  const response = await apiClient<ApiResponse<null>>(
    `/academic-advisors/delete/${academicAdvisorId}`,
    { method: 'POST' }
  );
  if (response.code !== 0) {
    throw new Error(response.message || 'Xóa cố vấn học tập thất bại');
  }
};

export const createAcademicAdvisorAPI = async (lecturerId: number, studentClassId: number): Promise<void> => {
  const response = await apiClient<ApiResponse<null>>(
    '/academic-advisors/create',
    {
      method: 'POST',
      body: JSON.stringify({ lecturerId, studentClassId }),
    }
  );
  if (response.code !== 0) {
    throw new Error(response.message || 'Bổ nhiệm cố vấn học tập thất bại');
  }
};