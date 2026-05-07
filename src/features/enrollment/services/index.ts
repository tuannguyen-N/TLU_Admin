import { apiClient } from '../../../lib/api-client';
import type {
  EnrollmentPeriod,
  EnrollmentPeriodFormData,
  Faculty,
  StudentEnrollment,
  StudentEnrollmentFilter,
} from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface FacultyApiResponse {
  id: number;
  facultyName: string;
  facultyCode: string;
  isActive: boolean;
}

interface FacultyApiListResponse {
  code: number;
  message: string;
  data: {
    content: FacultyApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

interface EnrollmentPeriodListResponse {
  content: EnrollmentPeriod[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function fetchEnrollmentPeriods(params: {
  hocKy?: string;
  page?: number;
  size?: number;
}): Promise<{
  periods: EnrollmentPeriod[];
  totalElements: number;
  totalPages: number;
  page: number;
}> {
  const { hocKy, page = 0, size = 10 } = params;
  const queryParams: Record<string, string | number> = { page, size };

  if (hocKy) {
    queryParams.HocKy = hocKy;
  }

  const response = await apiClient<ApiResponse<EnrollmentPeriodListResponse>>('/enrollment/periods', {
    method: 'GET',
    params: queryParams,
  });

  return {
    periods: response.data.content,
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
  };
}

export async function createEnrollmentPeriod(payload: EnrollmentPeriodFormData): Promise<number> {
  const response = await apiClient<ApiResponse<number>>('/enrollment/periods/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateEnrollmentPeriod(id: number, payload: EnrollmentPeriodFormData): Promise<number> {
  const response = await apiClient<ApiResponse<number>>(`/enrollment/periods/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteEnrollmentPeriod(id: number): Promise<void> {
  await apiClient<ApiResponse<null>>(`/enrollment/periods/delete/${id}`, {
    method: 'POST',
  });
}

export async function fetchStudentEnrollments(filter: StudentEnrollmentFilter): Promise<StudentEnrollment[]> {
  const params: Record<string, number> = {};
  if (filter.facultyId) params.facultyId = filter.facultyId;
  if (filter.semesterId) params.semesterId = filter.semesterId;
  if (filter.studentId) params.studentId = filter.studentId;

  const response = await apiClient<ApiResponse<{ content: StudentEnrollment[] }>>('/enrollment/all', {
    method: 'GET',
    params,
  });

  return response.data.content;
}

export async function confirmStudentEnrollments(semesterId: number): Promise<void> {
  await apiClient<ApiResponse<null>>('/enrollment/confirm', {
    method: 'POST',
    body: JSON.stringify({ semesterId }),
  });
}

export async function cancelStudentEnrollment(id: number): Promise<void> {
  await apiClient<ApiResponse<null>>(`/enrollment/cancel/${id}`, {
    method: 'POST',
  });
}

export async function fetchFaculties(): Promise<Faculty[]> {
  const response = await apiClient<FacultyApiListResponse>('/faculty/all', { method: 'GET' });
  return response.data.content
    .filter(f => f.facultyCode !== 'PDT')
    .filter(f => f.isActive)
    .map(mapApiToFaculty);
}

function mapApiToFaculty(apiData: FacultyApiResponse): Faculty {
  return {
    id: apiData.id,
    facultyCode: apiData.facultyCode,
    name: apiData.facultyName,
  };
}
