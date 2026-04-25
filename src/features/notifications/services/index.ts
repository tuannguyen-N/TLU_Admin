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
  const notifications: Notification[] = response.data.content.map((item): Notification => ({
    id: item.id,
    title: item.title,
    content: item.content,
    createdBy: item.createdBy,
    targetType: item.targetType as Notification['targetType'],
    targetIds: item.targetIds || [],
    deadLine: item.deadLine,
    isImportant: item.isImportant,
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

export async function createNotification(payload: NotificationFormData): Promise<Notification> {
  const response = await apiClient<CreateResponse>('/notification/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const item = response.data;
  if (!item) {
    // API returns success but no data - treat as success
    return {
      id: 0,
      title: payload.title,
      content: payload.content,
      createdBy: '',
      targetType: payload.targetType,
      targetIds: payload.targetIds,
      deadLine: payload.deadLine || null,
      isImportant: payload.isImportant,
    };
  }
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    createdBy: item.createdBy,
    targetType: item.targetType as Notification['targetType'],
    targetIds: item.targetIds || [],
    deadLine: item.deadLine,
    isImportant: item.isImportant,
  };
}

export async function updateNotification(id: number, payload: NotificationFormData): Promise<void> {
  await apiClient(`/notification/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient(`/notification/delete/${id}`, {
    method: 'POST',
  });
}