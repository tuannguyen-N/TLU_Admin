import { apiClient } from '../../../lib/api-client';
import type { LecturerFormData, StudentClass, AdvisedClass } from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface LecturerApiResponse {
  id: number;
  lecturerCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  departmentName: string;
  status: 'ACTIVE' | 'INACTIVE';
  isAcademicAdvisor: boolean;
}

interface LecturerApiListResponse {
  code: number;
  message: string;
  data: {
    content: LecturerApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export const fetchLecturersAPI = async (params: {
  khoa?: string;
  page?: number;
  size?: number;
}) => {
  const { khoa = '', page = 0, size = 10 } = params;
  const response = await apiClient<LecturerApiListResponse>(
    '/lecturers/all',
    {
      method: 'GET',
      params: { khoa, page, size },
    }
  );
  return response.data;
};

export const createLecturerAPI = async (payload: LecturerFormData) => {
  const response = await apiClient<ApiResponse<LecturerApiResponse>>(
    '/lecturers/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
};

export const fetchDepartmentsAPI = async () => {
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
  const response = await apiClient<DepartmentApiListResponse>(
    '/department/all',
    { method: 'GET' }
  );
  return response.data.content.map(d => ({
    value: d.departmentCode,
    label: d.departmentName,
    id: d.id,
    facultyCode: d.facultyCode,
  }));
};

export const updateLecturerAPI = async (id: number, payload: LecturerFormData) => {
  const response = await apiClient<ApiResponse<LecturerApiResponse>>(
    `/lecturers/update/${id}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
};

export const deleteLecturerAPI = async (id: number) => {
  const response = await apiClient<ApiResponse<null>>(
    `/lecturers/delete/${id}`,
    {
      method: 'POST',
    }
  );
  return response.data;
};

interface StudentClassApiResponse {
  code: number;
  message: string;
  data: {
    content: StudentClass[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export const fetchStudentClassesAPI = async (khoa: string) => {
  const response = await apiClient<StudentClassApiResponse>(
    '/student-class/all',
    {
      method: 'GET',
      params: { khoa },
    }
  );
  return response.data.content;
};

interface AdvisedClassApiResponse {
  code: number;
  message: string;
  data: {
    content: AdvisedClass[];
  };
}

export const fetchAdvisedClassesAPI = async (lecturerId: number) => {
  const response = await apiClient<AdvisedClassApiResponse>(
    `/lecturers/${lecturerId}/advised-classes`,
    {
      method: 'GET',
    }
  );
  return response.data.content;
};

export const assignAdvisorAPI = async (lecturerId: number, classId: number) => {
  const response = await apiClient<ApiResponse<null>>(
    `/lecturers/${lecturerId}/assign-advisor`,
    {
      method: 'POST',
      body: JSON.stringify({ classId }),
    }
  );
  return response.data;
};

export const removeAdvisorAPI = async (lecturerId: number, classId: number) => {
  const response = await apiClient<ApiResponse<null>>(
    `/lecturers/${lecturerId}/remove-advisor`,
    {
      method: 'POST',
      body: JSON.stringify({ classId }),
    }
  );
  return response.data;
};
