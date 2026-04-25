import { apiClient } from '../../../lib/api-client';
import type { Exam, ExamFormData } from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface ExamApiResponse {
  id: number;
  subjectCode: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  examRoom: string;
  examLocation: string;
  examFormat: string;
  examType: string;
  note: string;
}

interface ExamApiListResponse {
  code: number;
  message: string;
  data: {
    content: ExamApiResponse[];
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
    first: boolean;
    last: boolean;
  };
}

export interface FetchExamsParams {
  semesterId: number;
  facultyId?: number;
  page?: number;
  size?: number;
}

export interface FetchExamsResponse {
  exams: Exam[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchExamsAPI(params: FetchExamsParams): Promise<FetchExamsResponse> {
  const { semesterId, facultyId, page = 0, size = 10 } = params;

  const queryParams: Record<string, string | number> = { semesterId, page, size };
  if (facultyId) {
    queryParams.facultyId = facultyId;
  }

  const response = await apiClient<ExamApiListResponse>('/exam', {
    method: 'GET',
    params: queryParams,
  });

  return {
    exams: response.data.content.map(e => ({
      id: e.id,
      subjectCode: e.subjectCode,
      subjectName: e.subjectName,
      examDate: e.examDate,
      startTime: e.startTime,
      endTime: e.endTime,
      examRoom: e.examRoom,
      examLocation: e.examLocation,
      examFormat: e.examFormat,
      examType: e.examType,
      note: e.note,
    })),
    totalElements: response.data.total_elements,
    totalPages: response.data.total_pages,
    page: response.data.page,
    size: response.data.size,
  };
}

export async function createExamAPI(payload: ExamFormData): Promise<number> {
  const response = await apiClient<ApiResponse<number>>('/exam/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateExamAPI(id: number, payload: Partial<ExamFormData>): Promise<void> {
  await apiClient<ApiResponse<null>>(`/exam/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteExamAPI(id: number): Promise<void> {
  await apiClient<ApiResponse<null>>(`/exam/delete/${id}`, {
    method: 'POST',
  });
}
