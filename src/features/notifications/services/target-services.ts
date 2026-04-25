import { apiClient } from '../../../lib/api-client';

interface StudentResponse {
  id: number;
  studentCode: string;
  fullName: string;
}

interface StudentListResponse {
  code: number;
  message: string;
  data: {
    content: StudentResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export async function fetchStudents(page = 0, size = 50): Promise<StudentResponse[]> {
  const response = await apiClient<StudentListResponse>('/students/all', {
    method: 'GET',
    params: { page, size },
  });
  return response.data.content;
}

interface FacultyResponse {
  id: number;
  facultyCode: string;
  facultyName: string;
}

interface FacultyListResponse {
  code: number;
  message: string;
  data: {
    content: FacultyResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export async function fetchFaculties(page = 0, size = 100): Promise<FacultyResponse[]> {
  const response = await apiClient<FacultyListResponse>('/faculty/all', {
    method: 'GET',
    params: { page, size },
  });
  return response.data.content;
}

interface StudentClassResponse {
  id: number;
  classCode: string;
  majorName: string;
  startYear: number;
}

interface StudentClassListResponse {
  code: number;
  message: string;
  data: {
    content: StudentClassResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export async function fetchStudentClasses(page = 0, size = 100): Promise<StudentClassResponse[]> {
  const response = await apiClient<StudentClassListResponse>('/student-class/all', {
    method: 'GET',
    params: { page, size },
  });
  return response.data.content;
}

interface CourseClassResponse {
  id: number;
  classCode: string;
  className: string;
  capacity: number;
  lecturerCode: string;
  subjectCode: string;
  semesterCode: string;
}

interface CourseClassListResponse {
  code: number;
  message: string;
  data: {
    content: CourseClassResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export async function fetchCourseClasses(page = 0, size = 100): Promise<CourseClassResponse[]> {
  const response = await apiClient<CourseClassListResponse>('/course-classes/all', {
    method: 'GET',
    params: { page, size },
  });
  return response.data.content;
}