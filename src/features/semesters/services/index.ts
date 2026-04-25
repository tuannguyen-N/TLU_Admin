import { apiClient } from '../../../lib/api-client';
import type { Semester, SemesterFormData } from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface SemesterApiResponse {
  id: number;
  semesterCode: string;
  semesterName: string;
  academicYears: string;
  semesterNumber: 1 | 2 | 3;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface SemesterApiListResponse {
  content: SemesterApiResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function fetchSemesters(params: { page?: number; size?: number }): Promise<{
  semesters: Semester[];
  totalElements: number;
  totalPages: number;
  page: number;
}> {
  const { page = 0, size = 10 } = params;
  const response = await apiClient<ApiResponse<SemesterApiListResponse>>('/semesters/all', {
    method: 'GET',
    params: { page, size },
  });
  return {
    semesters: response.data.content,
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
  };
}

export async function createSemester(payload: SemesterFormData): Promise<Semester> {
  const response = await apiClient<ApiResponse<SemesterApiResponse>>('/semesters/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateSemester(id: number, payload: SemesterFormData): Promise<Semester> {
  const response = await apiClient<ApiResponse<SemesterApiResponse>>(`/semesters/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteSemester(id: number): Promise<void> {
  await apiClient(`/semesters/delete/${id}`, {
    method: 'POST',
  });
}