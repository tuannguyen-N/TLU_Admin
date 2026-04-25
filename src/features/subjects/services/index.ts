import { apiClient } from '../../../lib/api-client';
import type { Subject, SubjectFormData, FacultyOption, DepartmentOption } from '../types';

interface FacultyApiResponse {
  id: number;
  facultyCode: string;
  facultyName: string;
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

interface SubjectApiResponse {
  id: number;
  facultyId: number;
  departmentId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  coefficient: number;
  lectureHours: number;
  practiceHours: number;
  isActive: boolean | null;
}

interface SubjectApiListResponse {
  code: number;
  message: string;
  data: {
    content: SubjectApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

interface SubjectDetailApiResponse {
  code: number;
  message: string;
  data: {
    id: number;
    subjectCode: string;
    subjectName: string;
    credits: number;
    coefficient: number;
    lectureHours: number;
    practiceHours: number;
    facultyId: number;
    departmentId: number | null;
    prerequisiteGroups: Array<{
      prerequisiteSubjectIds: any;
      id: number;
      minSubjectsRequired: number;
      description: string;
      items: Array<{          x
        subjectCode: string;
        subjectName: string;
      }>;
    }>;
    enrollmentConditions: Array<{
      id: number;
      conditionType: string;
      conditionValue: number;
      conditionOperator: string;
      description: string;
    }>;
  };
}

export type SubjectDetail = SubjectDetailApiResponse['data'];

export async function fetchSubjectDetail(subjectId: number): Promise<SubjectDetail> {
  const response = await apiClient<SubjectDetailApiResponse>(
    `/subjects/${subjectId}`,
    { method: 'GET' }
  );
  return response.data;
}

function mapApiToSubject(apiSubject: SubjectApiResponse): Subject {
  return {
    id: apiSubject.id,
    subjectCode: apiSubject.subjectCode,
    subjectName: apiSubject.subjectName,
    credits: apiSubject.credits,
    coefficient: apiSubject.coefficient,
    lectureHours: apiSubject.lectureHours,
    practiceHours: apiSubject.practiceHours,
    facultyId: apiSubject.facultyId,
    departmentId: apiSubject.departmentId,
    isActive: apiSubject.isActive ?? false,
  };
}

export interface FetchSubjectsParams {
  facultyId?: number;
  page?: number;
  size?: number;
}

export interface FetchSubjectsResponse {
  subjects: Subject[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchSubjectsAPI(params: FetchSubjectsParams): Promise<FetchSubjectsResponse> {
  const { facultyId, page = 0, size = 50 } = params;

  try {
    const response = await apiClient<SubjectApiListResponse>(
      '/subjects/all',
      {
        method: 'GET',
        params: { page, size },
      }
    );

    // Filter by facultyId if provided, and only active subjects (isActive !== false)
    let filteredSubjects = response.data.content.filter(s => s.isActive !== false);
    if (facultyId) {
      filteredSubjects = filteredSubjects.filter(s => s.facultyId === facultyId);
    }

    const mappedSubjects = filteredSubjects.map(mapApiToSubject);

    console.log('[DEBUG] All subjects from API:', mappedSubjects);

    return {
      subjects: mappedSubjects,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.page,
      size: response.data.size,
    };
  } catch (err) {
    console.error('[fetchSubjectsAPI] error:', err);
    throw err;
  }
}

export async function fetchFacultiesAPI(): Promise<FacultyOption[]> {
  try {
    const response = await apiClient<FacultyApiListResponse>('/faculty/all', { method: 'GET' });
    return response.data.content.map(f => ({
      value: f.facultyCode,
      label: f.facultyName,
      id: f.id,
    }));
  } catch (err) {
    console.error('[fetchFacultiesAPI] error:', err);
    return [];
  }
}

interface DepartmentApiResponse {
  id: number;
  departmentCode: string;
  departmentName: string;
  facultyCode: string;
  isActive: boolean;
}

interface DepartmentApiListResponse {
  code: number;
  message: string;
  data: {
    content: DepartmentApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export async function fetchDepartmentsAPI(): Promise<DepartmentOption[]> {
  try {
    const response = await apiClient<DepartmentApiListResponse>('/department/all', { method: 'GET' });
    return response.data.content.map(d => ({
      value: d.departmentCode,
      label: d.departmentName,
      id: d.id,
      facultyCode: d.facultyCode,
    }));
  } catch (err) {
    console.error('[fetchDepartmentsAPI] error:', err);
    return [];
  }
}

interface CreateSubjectResponse {
  code: number;
  message: string;
  data: SubjectApiResponse;
}

export async function createSubject(payload: SubjectFormData): Promise<Subject> {
  const response = await apiClient<CreateSubjectResponse>(
    '/subjects/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return mapApiToSubject(response.data);
}

interface UpdateResponse {
  code: number;
  message: string;
  data: null;
}

export async function updateSubject(subjectId: number, payload: any): Promise<void> {
  await apiClient<UpdateResponse>(
    `/subjects/update/${subjectId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteSubject(subjectId: number): Promise<void> {
  console.log('[DEBUG] Deleting subject with ID:', subjectId);
  const response = await apiClient<UpdateResponse>(
    `/subjects/delete/${subjectId}`,
    {
      method: 'POST',
    }
  );
  console.log('[DEBUG] Delete response:', response);
}

// Alias for backward compatibility
export const fetchSubjects = fetchSubjectsAPI;
export const fetchFaculties = fetchFacultiesAPI;
export const fetchDepartments = fetchDepartmentsAPI;