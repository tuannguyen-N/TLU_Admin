export interface NotificationTemplate {
  id: number;
  code: string;
  name: string;
  content: string;
}

export interface NotificationTemplateFormData {
  code: string;
  name: string;
  content: string;
}

export interface FetchNotificationTemplatesResponse {
  templates: NotificationTemplate[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}