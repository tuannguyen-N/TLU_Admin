import { apiClient } from '../../../lib/api-client';
import type { StudentClass, StudentClassFormData } from '../types';

interface StudentClassApiResponse {
  id: number;
  classCode: string;
  startYear: number;
  majorName: string;
  studentCount: number;
}

interface StudentClassApiListResponse {
  code: number;
  message: string;
  data: {
    content: StudentClassApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

function mapApiToStudentClass(apiClass: StudentClassApiResponse): StudentClass {
  return {
    id: apiClass.id,
    classCode: apiClass.classCode,
    startYear: apiClass.startYear,
    majorName: apiClass.majorName,
    studentCount: apiClass.studentCount,
  };
}

export interface FetchStudentClassesParams {
  khoa: string;
  page?: number;
  size?: number;
}

export interface FetchStudentClassesResponse {
  studentClasses: StudentClass[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchStudentClasses(params: FetchStudentClassesParams): Promise<FetchStudentClassesResponse> {
  const { khoa, page = 0, size = 50 } = params;

  const response = await apiClient<StudentClassApiListResponse>(
    '/student-class/all',
    {
      method: 'GET',
      params: { khoa, page, size },
    }
  );

  return {
    studentClasses: response.data.content.map(mapApiToStudentClass),
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
    size: response.data.size,
  };
}

interface CreateStudentClassResponse {
  code: number;
  message: string;
  data: StudentClassApiResponse;
}

export async function createStudentClass(payload: StudentClassFormData): Promise<StudentClass> {
  const response = await apiClient<CreateStudentClassResponse>(
    '/student-class/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return mapApiToStudentClass(response.data);
}

interface UpdateResponse {
  code: number;
  message: string;
  data: null;
}

export async function updateStudentClass(classId: number, payload: Partial<StudentClassFormData>): Promise<void> {
  const response = await apiClient<UpdateResponse>(
    `/student-class/update/${classId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteStudentClass(classId: number): Promise<void> {
  const response = await apiClient<UpdateResponse>(
    `/student-class/delete/${classId}`,
    {
      method: 'POST',
    }
  );
}