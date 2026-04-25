import type { TrainingProgram, TrainingProgramFormData } from '../types';
import { apiClient } from '../../../lib/api-client';

interface TrainingProgramApiResponse {
  id: number;
  studyProgramCode: string;
  studyProgramName: string;
  majorCode: string;
  startYear: number;
  totalCredits: number;
  trainingType: string;
}

interface TrainingProgramApiListResponse {
  code: number;
  message: string;
  data: {
    content: TrainingProgramApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

function mapApiToTrainingProgram(apiProgram: TrainingProgramApiResponse): TrainingProgram {
  return {
    id: apiProgram.id,
    studyProgramCode: apiProgram.studyProgramCode,
    studyProgramName: apiProgram.studyProgramName,
    majorCode: apiProgram.majorCode,
    startYear: apiProgram.startYear,
    totalCredits: apiProgram.totalCredits,
    trainingType: apiProgram.trainingType as TrainingProgram['trainingType'],
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: '',
  };
}

export interface FetchTrainingProgramsParams {
  startYear: number;
  khoa?: string;
  page?: number;
  size?: number;
}

export interface FetchTrainingProgramsResponse {
  trainingPrograms: TrainingProgram[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchTrainingPrograms(params: FetchTrainingProgramsParams): Promise<FetchTrainingProgramsResponse> {
  const { startYear, khoa, page = 0, size = 50 } = params;

  const response = await apiClient<TrainingProgramApiListResponse>(
    '/study-programs/all',
    {
      method: 'GET',
      params: { startYear, khoa, page, size },
    }
  );

  return {
    trainingPrograms: response.data.content.map(mapApiToTrainingProgram),
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
    size: response.data.size,
  };
}

interface CreateTrainingProgramResponse {
  code: number;
  message: string;
  data: TrainingProgramApiResponse;
}

export async function createTrainingProgram(payload: TrainingProgramFormData): Promise<TrainingProgram> {
  const response = await apiClient<CreateTrainingProgramResponse>(
    '/study-programs/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return mapApiToTrainingProgram(response.data);
}

interface UpdateResponse {
  code: number;
  message: string;
  data: null;
}

export async function updateTrainingProgram(programId: number, payload: Partial<TrainingProgramFormData>): Promise<void> {
  const snakeCasePayload: Record<string, any> = {};

  if (payload.studyProgramCode !== undefined) {
    snakeCasePayload.studyProgramCode = payload.studyProgramCode;
  }
  if (payload.studyProgramName !== undefined) {
    snakeCasePayload.studyProgramName = payload.studyProgramName;
  }
  if (payload.majorId !== undefined) {
    snakeCasePayload.majorId = payload.majorId;
  }
  if (payload.startYear !== undefined) {
    snakeCasePayload.startYear = payload.startYear;
  }
  if (payload.totalCredits !== undefined) {
    snakeCasePayload.totalCredits = payload.totalCredits;
  }
  if (payload.trainingType !== undefined) {
    snakeCasePayload.trainingType = payload.trainingType;
  }

  const response = await apiClient<UpdateResponse>(
    `/study-programs/update/${programId}`,
    {
      method: 'POST',
      body: JSON.stringify(snakeCasePayload),
    }
  );
}

export async function deleteTrainingProgram(programId: number): Promise<void> {
  console.log('Deleting program with ID:', programId);
  const response = await apiClient<UpdateResponse>(
    `/study-programs/delete/${programId}`,
    {
      method: 'POST',
    }
  );
}

interface Major {
  id: number;
  majorName: string;
  majorCode: string;
  facultyCode: string;
  isActive: boolean;
}

interface MajorsApiResponse {
  code: number;
  message: string;
  data: {
    content: Major[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export interface MajorOption {
  value: string;
  label: string;
  id: number;
}

export async function fetchMajors(khoa: string = 'CNTT'): Promise<MajorOption[]> {
  const response = await apiClient<MajorsApiResponse>(
    '/majors/all',
    {
      method: 'GET',
      params: { khoa },
    }
  );

  return response.data.content.map(major => ({
    value: major.majorCode,
    label: `${major.majorCode} - ${major.majorName}`,
    id: major.id,
  }));
}

interface StudyProgramDetailResponse {
  code: number;
  message: string;
  data: {
    studyProgramName: string;
    studyProgramCode: string;
    yearStart: number;
    totalCredits: number;
    major: {
      majorName: string;
      majorCode: string;
      faculty: string;
    };
    semesters: Array<{
      semesterId: number;
      semesterName: string;
      semesterStartDate: string;
      semesterEndDate: string;
      subjects: Array<{
        id: number;
        subjectCode: string;
        subjectName: string;
        credits: number;
        isRequired: boolean;
        electiveGroup: string | null;
        lectureHours: number;
        practiceHours: number;
        subjectPrerequisite: Array<{
          minSubjectsRequired: number;
          description: string;
          items: Array<{
            subjectCode: string;
            subjectName: string;
          }>;
        }>;
        faculty: string;
        department: string;
      }>;
    }>;
  };
}

export async function fetchStudyProgramDetail(programId: number): Promise<StudyProgramDetailResponse['data']> {
  const response = await apiClient<StudyProgramDetailResponse>(
    `/study-programs/${programId}`,
    {
      method: 'GET',
    }
  );
  return response.data;
}

interface UpdateSubjectPayload {
  semesterId: number;
  isRequired: boolean;
  electiveGroup: string | null;
}

interface ApiResponse {
  code: number;
  message: string;
  data: unknown;
}

export async function updateSubject(subjectId: number, payload: UpdateSubjectPayload): Promise<void> {
  const response = await apiClient<ApiResponse>(
    `/study-programs/subjects/update/${subjectId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  if (response.code !== 0) {
    throw new Error(response.message || 'Cập nhật môn học thất bại');
  }
}

export async function deleteSubject(subjectId: number): Promise<void> {
  const response = await apiClient<ApiResponse>(
    `/study-programs/subjects/delete/${subjectId}`,
    {
      method: 'POST',
    }
  );
  if (response.code !== 0) {
    throw new Error(response.message || 'Xóa môn học thất bại');
  }
}

interface AddSubjectToProgramPayload {
  subjectId: number;
  semesterId: number;
  electiveGroup: string;
  isRequired: boolean;
}

export async function addSubjectToProgram(
  studyProgramId: number,
  payload: AddSubjectToProgramPayload
): Promise<void> {
  console.log('Adding subject to program with payload:', payload);
  const response = await apiClient<ApiResponse>(
    `/study-programs/${studyProgramId}/subjects/create`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  if (response.code !== 0) {
    throw new Error(response.message || 'Thêm môn học thất bại');
  }
}