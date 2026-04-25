export interface Notification {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  targetType: 'GLOBAL' | 'FACULTY' | 'STUDENT_CLASS' | 'COURSE_CLASS' | 'STUDENT';
  targetIds: number[];
  deadLine: string | null;
  isImportant: boolean;
}

export interface NotificationFormData {
  templateId?: number;
  title: string;
  content: string;
  targetType: 'GLOBAL' | 'FACULTY' | 'STUDENT_CLASS' | 'COURSE_CLASS' | 'STUDENT';
  targetIds: number[];
  createdBy?: string;
  deadLine: string | null;
  isImportant: boolean;
}

export interface FetchNotificationsParams {
  page?: number;
  size?: number;
}

export interface FetchNotificationsResponse {
  notifications: Notification[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}