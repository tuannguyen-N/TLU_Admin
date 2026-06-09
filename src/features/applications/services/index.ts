import { apiClient } from '../../../lib/api-client';
import type { Application, ApplicationDetail, ApplicationType, ApplicationStatus } from '../types';

interface ApplicationApiResponse {
  id: number;
  studentCode: string;
  studentName: string;
  applicationTypeName: string;
  status: string;
  content?: string;
  attachments?: {
    id: number;
    fileKey: string;
    originalFilename: string;
    fileSize: number;
    resourceType: string;
  }[];
}

interface ApplicationApiListResponse {
  code: number;
  message: string;
  data: {
    content: ApplicationApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

interface ApplicationApiDetailResponse {
  code: number;
  message: string;
  data: ApplicationApiResponse;
}

function mapApiToApplication(apiApp: ApplicationApiResponse): Application {
  return {
    id: apiApp.id,
    studentCode: apiApp.studentCode,
    studentName: apiApp.studentName,
    applicationTypeName: apiApp.applicationTypeName,
    status: apiApp.status as Application['status'],
    content: apiApp.content,
    attachments: apiApp.attachments,
  };
}

function mapApiToDetail(apiApp: ApplicationApiResponse): ApplicationDetail {
  return {
    id: apiApp.id,
    studentCode: apiApp.studentCode,
    studentName: apiApp.studentName,
    applicationTypeName: apiApp.applicationTypeName,
    status: apiApp.status as Application['status'],
    content: apiApp.content || '',
    attachments: apiApp.attachments || [],
  };
}

export interface FetchApplicationsResponse {
  applications: Application[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchApplications(page: number = 0, size: number = 10): Promise<FetchApplicationsResponse> {
  const response = await apiClient<ApplicationApiListResponse>(
    '/application/all',
    {
      method: 'GET',
      params: { page, size },
    }
  );
  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi lấy danh sách đơn');
  }
  return {
    applications: response.data.content.map(mapApiToApplication),
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
    size: response.data.size,
  };
}

export async function fetchApplicationDetail(applicationId: number): Promise<ApplicationDetail> {
  const response = await apiClient<ApplicationApiDetailResponse>(
    `/application/${applicationId}`,
    {
      method: 'GET',
    }
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi lấy chi tiết đơn');
  }

  return mapApiToDetail(response.data);
}

// Application Types
interface ApplicationTypesResponse {
  code: number;
  message: string;
  data: ApplicationType[];
}

export async function fetchApplicationTypes(): Promise<ApplicationType[]> {
  const response = await apiClient<ApplicationTypesResponse>(
    '/application-types/all',
    {
      method: 'GET',
    }
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi lấy danh sách loại đơn');
  }

  return response.data;
}

interface CreateApplicationTypeResponse {
  code: number;
  message: string;
  data: ApplicationType;
}

export interface CreateApplicationTypePayload {
  code: string;
  name: string;
}

export async function createApplicationType(payload: CreateApplicationTypePayload): Promise<ApplicationType> {
  const response = await apiClient<CreateApplicationTypeResponse>(
    '/application-types/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi tạo loại đơn');
  }

  return response.data;
}

interface UpdateApplicationTypeResponse {
  code: number;
  message: string;
  data: ApplicationType;
}

export interface UpdateApplicationTypePayload {
  code?: string;
  name?: string;
}

export async function updateApplicationType(typeId: number, payload: UpdateApplicationTypePayload): Promise<ApplicationType> {
  const response = await apiClient<UpdateApplicationTypeResponse>(
    `/application-types/update/${typeId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi cập nhật loại đơn');
  }

  return response.data;
}

interface DeleteApplicationTypeResponse {
  code: number;
  message: string;
  data: null;
}

export async function deleteApplicationType(typeId: number): Promise<void> {
  const response = await apiClient<DeleteApplicationTypeResponse>(
    `/application-types/delete/${typeId}`,
    {
      method: 'POST',
    }
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi xóa loại đơn');
  }
}

// Update status only
interface UpdateStatusResponse {
  code: number;
  message: string;
  data: null;
}

export async function updateApplicationStatus(applicationId: number, status: ApplicationStatus): Promise<void> {
  const response = await apiClient<UpdateStatusResponse>(
    `/application/update-status/${applicationId}`,
    {
      method: 'POST',
      body: JSON.stringify({ status }),
    }
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi cập nhật trạng thái đơn');
  }
}



// Update application (full update)
export interface UpdateApplicationPayload {
  studentCode?: string;
  applicationTypeName?: string;
  content?: string;
  status?: string;
}

interface UpdateApplicationResponse {
  code: number;
  message: string;
  data: ApplicationApiResponse;
}

export async function updateApplication(applicationId: number, payload: UpdateApplicationPayload): Promise<Application> {
  const response = await apiClient<UpdateApplicationResponse>(
    `/application/update/${applicationId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi cập nhật đơn');
  }

  return mapApiToApplication(response.data);
}

// Delete application
interface DeleteApplicationResponse {
  code: number;
  message: string;
  data: null;
}

export async function deleteApplication(applicationId: number): Promise<void> {
  const response = await apiClient<DeleteApplicationResponse>(
    `/application/delete/${applicationId}`,
    {
      method: 'POST',
    }
  );

  if (response.code !== 0) {
    throw new Error(response.message || 'Đã xảy ra lỗi khi xóa đơn');
  }
}