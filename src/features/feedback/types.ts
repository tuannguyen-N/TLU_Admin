export type FeedbackStatus = 'PENDING' | 'RESOLVED' | 'REJECTED' | 'IN_PROGRESS';

export interface Feedback {
  id: number;
  email: string;
  title: string;
  content: string;
  categoryName: string;
  appVersion: string;
  deviceInfo: string;
  feedbackImages: string[];
  status: FeedbackStatus;
  createdAt: string;
}

export interface FeedbackCategory {
  id: number;
  name: string;
  description: string;
}
