import { apiClient } from '../../../lib/api-client';
import type { Notification, NotificationFormData } from '../types';

interface NotificationApiResponse {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  targetType: string;
  targetIds: number[];
  deadLine: string | null;
  isImportant: boolean;
  referenceType: string | null;
}

interface NotificationApiListResponse {
  code: number;
  message: string;
  data: {
    content: NotificationApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export async function fetchNotifications(params: { page?: number; size?: number }): Promise<{
  notifications: Notification[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> {
  const { page = 0, size = 10 } = params;
  const response = await apiClient<NotificationApiListResponse>('/notification/all', {
    method: 'GET',
    params: { page, size },
  });

  if(response.code !== 0){
    throw new Error(response.message || 'Lấy danh sách thông báo thất bại');
  }
  
  const notifications: Notification[] = response.data.content.map((item): Notification => ({
    id: item.id,
    title: item.title,
    content: item.content,
    createdBy: item.createdBy,
    targetType: item.targetType as Notification['targetType'],
    targetIds: item.targetIds || [],
    deadLine: item.deadLine,
    isImportant: item.isImportant,
    referenceType: item.referenceType,
  }));
  return {
    notifications,
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
    size: response.data.size,
  };
}

interface CreateResponse {
  code: number;
  message: string;
  data: NotificationApiResponse | null;
}

export async function createNotification(payload: NotificationFormData): Promise<void> {
    const response = await apiClient<CreateResponse>('/notification/send', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (response.code !== 0) {
        throw new Error(response.message || 'Gửi thông báo thất bại');
    }
}

export async function updateNotification(id: number, payload: NotificationFormData): Promise<void> {
  const response: any = await apiClient(`/notification/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if(response.code !== 0){
    throw new Error(response.message || 'Cập nhật thông báo thất bại');
  }
}

export async function deleteNotification(id: number): Promise<void> {
  const response: any = await apiClient(`/notification/delete/${id}`, {
    method: 'POST',
  });

  if(response.code !== 0){
    throw new Error(response.message || 'Xóa thông báo thất bại');
  }
}
