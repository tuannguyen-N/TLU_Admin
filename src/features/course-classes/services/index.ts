import { apiClient } from '../../../lib/api-client';
import type { CourseClassFormData } from '../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface CourseClassApiResponse {
  id: number;
  classCode: string;
  className: string;
  capacity: number;
  lecturerCode: string;
  subjectCode: string;
  semesterCode: string;
  isActive: boolean;
}

interface CourseClassApiListResponse {
  code: number;
  message: string;
  data: {
    content: CourseClassApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export const fetchCourseClassesAPI = async (params: {
  khoa?: string;
  page?: number;
  size?: number;
}) => {
  const { khoa, page = 0, size = 10 } = params;
  const response = await apiClient<CourseClassApiListResponse>(
    '/course-classes/all',
    {
      method: 'GET',
      params: { khoa, page, size },
    }
  );
  return response.data;
};

export const createCourseClassAPI = async (payload: CourseClassFormData) => {
  const response = await apiClient<ApiResponse<CourseClassApiResponse>>(
    '/course-classes/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
};

export const updateCourseClassAPI = async (id: number, payload: CourseClassFormData) => {
  const response = await apiClient<ApiResponse<CourseClassApiResponse>>(
    `/course-classes/update/${id}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
};

export const deleteCourseClassAPI = async (id: number) => {
  const response = await apiClient<ApiResponse<null>>(
    `/course-classes/delete/${id}`,
    {
      method: 'POST',
    }
  );
  return response.data;
};

interface SemesterDetail {
  id: number | null;
  semesterName: string;
  semesterCode: string;
  academicYears: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  isActive: boolean | null;
}

interface CourseClassDetailApiResponse {
  id: number;
  lecturerCode: string;
  lecturerName: string;
  subjectCode: string;
  subjectName: string;
  semester: SemesterDetail;
  classCode: string;
  className: string;
  capacity: number;
  isActive: boolean;
}

export const fetchCourseClassDetailAPI = async (id: number) => {
  const response = await apiClient<ApiResponse<CourseClassDetailApiResponse>>(
    `/course-classes/${id}`,
    {
      method: 'GET',
    }
  );
  return response.data;
};

interface ScheduleApiResponse {
  id: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  startTime: string;
  endTime: string;
  room: string;
}

export const fetchSchedulesAPI = async (courseClassId: number) => {
  const response = await apiClient<ApiResponse<ScheduleApiResponse[]>>(
    `/schedules/${courseClassId}`,
    {
      method: 'GET',
    }
  );
  return response.data;
};

export interface UpdateSchedulePayload {
  id?: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  startTime: string;
  endTime: string;
  room: string;
}

export const updateScheduleAPI = async (scheduleId: number, payload: UpdateSchedulePayload) => {
  const response = await apiClient<ApiResponse<null>>(
    `/schedules/update/${scheduleId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
};

export const deleteScheduleAPI = async (scheduleId: number) => {
  const response = await apiClient<ApiResponse<null>>(
    `/schedules/delete/${scheduleId}`,
    {
      method: 'POST',
    }
  );
  return response.data;
};

export const createSchedulesAPI = async (courseClassId: number, payload: UpdateSchedulePayload[]) => {
  const response = await apiClient<ApiResponse<null>>(
    `/schedules/create/${courseClassId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return response.data;
};
