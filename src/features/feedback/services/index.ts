import { apiClient } from '../../../lib/api-client';
import type { Feedback, FeedbackStatus } from '../types';

interface FeedbackListResponse {
  code: number;
  message: string;
  data: Feedback[];
}

interface FeedbackStatusUpdatePayload {
  status: FeedbackStatus;
}

interface FeedbackStatusUpdateResponse {
  code: number;
  message: string;
  data: null;
}

export async function fetchAllFeedback(): Promise<Feedback[]> {
  const response = await apiClient<FeedbackListResponse>(
    '/feedback/all',
    { method: 'GET' }
  );
  
  if (response.code === 0) {
    return response.data || [];
  }
  
  throw new Error(response.message || 'Failed to fetch feedback');
}

export async function updateFeedbackStatus(
  id: number,
  status: FeedbackStatus
): Promise<void> {
  const payload: FeedbackStatusUpdatePayload = { status };
  
  const response = await apiClient<FeedbackStatusUpdateResponse>(
    `/feedback/update-status/${id}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  
  if (response.code !== 0) {
    throw new Error(response.message || 'Failed to update feedback status');
  }
}
