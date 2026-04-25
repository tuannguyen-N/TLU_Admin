import { apiClient } from '../../../lib/api-client';
import type { NotificationTemplate, NotificationTemplateFormData } from '../types';

interface NotificationTemplateApiListResponse {
  code: number;
  message: string;
  data: {
    content: NotificationTemplate[];
    page: number;
    size: number;
    total_elements: number;
    total_pages: number;
    first: boolean;
    last: boolean;
  };
}

interface CreateResponse {
  code: number;
  message: string;
  data: number | null;
}

interface UpdateResponse {
  code: number;
  message: string;
  data: null;
}

interface DeleteResponse {
  code: number;
  message: string;
  data: null;
}

export async function fetchNotificationTemplates(params: { page?: number; size?: number }): Promise<{
  templates: NotificationTemplate[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> {
  const { page = 0, size = 10 } = params;
  const response = await apiClient<NotificationTemplateApiListResponse>('/notification-templates/all', {
    method: 'GET',
    params: { page, size },
  });
  return {
    templates: response.data.content,
    totalElements: response.data.total_elements,
    totalPages: response.data.total_pages,
    page: response.data.page,
    size: response.data.size,
  };
}

export async function createNotificationTemplate(payload: NotificationTemplateFormData): Promise<number> {
  const response = await apiClient<CreateResponse>('/notification-templates/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data ?? 0;
}

export async function updateNotificationTemplate(id: number, payload: NotificationTemplateFormData): Promise<void> {
  await apiClient<UpdateResponse>(`/notification-templates/update/${id}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteNotificationTemplate(id: number): Promise<void> {
  await apiClient<DeleteResponse>(`/notification-templates/delete/${id}`, {
    method: 'POST',
  });
}