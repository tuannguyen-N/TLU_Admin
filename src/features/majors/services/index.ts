import { apiClient } from '../../../lib/api-client';
import type { Major, MajorFormData } from '../types';

interface MajorApiResponse {
  id: number;
  majorName: string;
  majorCode: string;
  facultyId: number;
  isActive: boolean;
}

interface MajorApiListResponse {
  code: number;
  message: string;
  data: {
    content: MajorApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

function mapApiToMajor(apiMajor: MajorApiResponse): Major {
  return {
    id: apiMajor.id,
    majorCode: apiMajor.majorCode,
    majorName: apiMajor.majorName,
    facultyCode: String(apiMajor.facultyId),
    isActive: apiMajor.isActive,
  };
}

export interface FetchMajorsParams {
  khoa: string;
  page?: number;
  size?: number;
}

export interface FetchMajorsResponse {
  majors: Major[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchMajors(params: FetchMajorsParams): Promise<FetchMajorsResponse> {
  const { khoa, page = 0, size = 50 } = params;

  const response = await apiClient<MajorApiListResponse>(
    '/majors/all',
    {
      method: 'GET',
      params: { khoa, page, size },
    }
  );

  return {
    majors: response.data.content
      .filter(major => major.isActive)
      .map(mapApiToMajor),
    totalElements: response.data.content.filter(major => major.isActive).length,
    totalPages: response.data.totalPages,
    page: response.data.page,
    size: response.data.size,
  };
}

interface CreateMajorResponse {
  code: number;
  message: string;
  data: MajorApiResponse;
}

export async function createMajor(payload: MajorFormData): Promise<Major> {
  const response = await apiClient<CreateMajorResponse>(
    '/majors/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return mapApiToMajor(response.data);
}

interface UpdateResponse {
  code: number;
  message: string;
  data: null;
}

export async function updateMajor(majorId: number, payload: Partial<MajorFormData>): Promise<void> {
  const response = await apiClient<UpdateResponse>(
    `/majors/update/${majorId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteMajor(majorId: number): Promise<void> {
  const response = await apiClient<UpdateResponse>(
    `/majors/delete/${majorId}`,
    {
      method: 'POST',
    }
  );
}
