import { apiClient } from '../../../lib/api-client';
import type { AcademicResult, UpdateAcademicResultPayload } from '../types';
import type { Subject } from '../../subjects/types';
import type { Semester } from '../../semesters/types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Calculate letter grade and pass status from score10
export function calculateLetterGrade(score10: number): { letterGrade: string; isPass: boolean } {
  if (score10 >= 8.5) return { letterGrade: 'A', isPass: true };
  if (score10 >= 7.0) return { letterGrade: 'B', isPass: true };
  if (score10 >= 5.5) return { letterGrade: 'C', isPass: true };
  if (score10 >= 4.0) return { letterGrade: 'D', isPass: true };
  return { letterGrade: 'F', isPass: false };
}

// Calculate GPA (score4) from score10
export function calculateScore4(score10: number): number {
  if (score10 >= 8.5) return 4.0;
  if (score10 >= 7.0) return 3.0;
  if (score10 >= 5.5) return 2.0;
  if (score10 >= 4.0) return 1.0;
  return 0.0;
}

interface AcademicResultApiResponse {
  studentId: number;
  studentCode: string;
  studentName: string;
  startYear: number;
  studyPrograms: {
    majorName: string;
    studyProgramCode: string;
    studyProgramName: string;
    semesterResults: {
      semester: string;
      semesterId?: number;
      subjectResults: {
        id: number;
        subjectCode: string;
        subjectName: string;
        credits: number;
        attendanceScore: number;
        midtermScore: number;
        finalScore: number;
        score10: number;
        score4: number;
        letterGrade: string;
        isPass: boolean;
      }[];
      semesterSummary: {
        creditsRegistered: number;
        creditsPassed: number;
        semesterGpa: number;
        conductScore?: number;
        cumulativeGpa?: number;
      } | null;
    }[];
  }[];
}

interface AcademicResultsApiListResponse {
  code: number;
  message: string;
  data: {
    content: AcademicResultApiResponse[];
    page: number;
    size: number;
    totalElements?: number;
    totalPages?: number;
    total_elements?: number;
    total_pages?: number;
    first: boolean;
    last: boolean;
  };
}

function mapApiToAcademicResult(apiResult: AcademicResultApiResponse): AcademicResult {
  return {
    studentId: apiResult.studentId,
    studentCode: apiResult.studentCode,
    studentName: apiResult.studentName,
    startYear: apiResult.startYear,
    studyPrograms: (apiResult.studyPrograms ?? []).map(sp => ({
      majorName: sp.majorName,
      studyProgramCode: sp.studyProgramCode,
      studyProgramName: sp.studyProgramName,
      semesterResults: (sp.semesterResults ?? []).map(sr => ({
        semester: sr.semester,
        semesterId: sr.semesterId,
        subjectResults: (sr.subjectResults ?? []).map(sub => ({
          ...sub,
          semesterId: sr.semesterId,
        })),
        semesterSummary: sr.semesterSummary,
      })),
    })),
  };
}

export interface FetchAcademicResultsParams {
  khoa: string;
  page?: number;
  size?: number;
}

export interface FetchAcademicResultsResponse {
  academicResults: AcademicResult[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchAcademicResults(params: FetchAcademicResultsParams): Promise<FetchAcademicResultsResponse> {
  const { khoa, page = 0, size = 10 } = params;

  const response = await apiClient<AcademicResultsApiListResponse>(
    '/academic-results/all',
    {
      method: 'GET',
      params: { khoa, page, size },
    }
  );

  return {
    academicResults: response.data.content.map(mapApiToAcademicResult),
    totalElements: response.data.totalElements ?? response.data.total_elements ?? 0,
    totalPages: response.data.totalPages ?? response.data.total_pages ?? 0,
    page: response.data.page,
    size: response.data.size,
  };
}

interface ImportAcademicResultSummary {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export async function importAcademicResultsFromExcel(file: File): Promise<ImportAcademicResultSummary> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_DOMAIN || ''}/api/v1/admin/academic-results/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGVzIjpudWxsLCJzaWduIjpudWxsLCJpYXQiOjE3NzU3OTMxNTc1NzksImV4cCI6MTc3NTc5Njc1NzU3OX0.OcuqDvFuHymaB9AB9bHgaAGY04DlYL6pUjKqJWMb328`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[API] import academic results error:', text);
    throw new Error(`Import failed: ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}

export interface AddAcademicResultPayload {
  studentId: number;
  subjectId: number;
  semesterId: number;
  credits: number;
  attendanceScore: number;
  midtermScore: number;
  finalScore: number;
  score10: number;
  score4: number;
  letterGrade: string;
  isPass: boolean;
}

interface AddAcademicResultResponse {
  code: number;
  message: string;
  data: number;
}

export async function addAcademicResult(payload: AddAcademicResultPayload): Promise<number> {
  const response = await apiClient<AddAcademicResultResponse>(
    '/academic-results/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

// Subject API (from subjects feature, filtered by facultyId)
interface SubjectApiResponse {
  id: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  coefficient: number;
  lectureHours: number;
  practiceHours: number;
  facultyId: number;
  departmentId: number;
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

export async function fetchSubjectsByFaculty(facultyId: number): Promise<Subject[]> {
  const response = await apiClient<SubjectApiListResponse>(
    '/subjects/all',
    { method: 'GET', params: { page: 0, size: 500 } }
  );
  return response.data.content
    .filter(s => s.isActive !== false && s.facultyId === facultyId)
    .map(mapApiToSubject);
}

// Semester API
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
}

export async function fetchSemesters(): Promise<Semester[]> {
  const response = await apiClient<{ code: number; message: string; data: SemesterApiListResponse }>(
    '/semesters/all',
    { method: 'GET', params: { page: 0, size: 100 } }
  );
  return response.data.content.map(s => ({
    id: s.id,
    semesterCode: s.semesterCode,
    semesterName: s.semesterName,
    academicYears: s.academicYears,
    semesterNumber: s.semesterNumber,
    startDate: s.startDate,
    endDate: s.endDate,
    isActive: s.isActive,
  }));
}

// Student by code API
interface StudentApiResponse {
  id: number;
  studentCode: string;
  fullName: string;
}

interface StudentApiFindResponse {
  code: number;
  message: string;
  data: StudentApiResponse;
}

export async function fetchStudentByCode(studentCode: string): Promise<{ id: number; studentCode: string; fullName: string } | null> {
  try {
    const response = await apiClient<StudentApiFindResponse>(
      `/students/find?studentCode=${encodeURIComponent(studentCode)}`,
      { method: 'GET' }
    );
    return response.data;
  } catch {
    return null;
  }
}

interface StudentListApiResponse {
  code: number;
  message: string;
  data: {
    content: StudentApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export interface StudentOption {
  id: number;
  studentCode: string;
  fullName: string;
}

export async function fetchStudentsByKhoa(khoa: string): Promise<StudentOption[]> {
  const size = 200;
  let page = 0;
  let totalPages = 1;
  const allStudents: StudentOption[] = [];

  while (page < totalPages) {
    const response = await apiClient<StudentListApiResponse>(
      '/students/all',
      {
        method: 'GET',
        params: { khoa, page, size },
      }
    );

    allStudents.push(
      ...response.data.content.map((student) => ({
        id: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
      }))
    );

    totalPages = response.data.totalPages;
    page += 1;
  }

  return allStudents;
}

// Update academic result API
export async function updateAcademicResultAPI(subjectResultId: number, payload: UpdateAcademicResultPayload): Promise<void> {
  const response = await apiClient<ApiResponse<null>>(
    `/academic-results/update/${subjectResultId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  if (response.code !== 0) {
    throw new Error(response.message || 'Update academic result failed');
  }
}

export async function deleteAcademicResultAPI(subjectResultId: number): Promise<void> {
  const response = await apiClient<ApiResponse<null>>(
    `/academic-results/delete/${subjectResultId}`,
    {
      method: 'POST',
    }
  );
  if (response.code !== 0) {
    throw new Error(response.message || 'Delete academic result failed');
  }
}
