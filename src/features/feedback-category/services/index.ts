import { apiClient } from '../../../lib/api-client';
import type { FeedbackCategory } from '../types';

interface FeedbackCategoryListResponse {
  code: number;
  message: string;
  data: FeedbackCategory[];
}

interface CreateFeedbackCategoryPayload {
  name: string;
  description: string;
}

interface UpdateFeedbackCategoryPayload {
  name: string;
  description: string;
}

interface FeedbackCategoryResponse {
  code: number;
  message: string;
  data: null;
}

export async function fetchAllFeedbackCategories(): Promise<FeedbackCategory[]> {
  const response = await apiClient<FeedbackCategoryListResponse>(
    '/feedback-category/all',
    { method: 'GET' }
  );
  
  if (response.code === 0) {
    return response.data || [];
  }
  
  throw new Error(response.message || 'Failed to fetch feedback categories');
}

export async function createFeedbackCategory(
  payload: CreateFeedbackCategoryPayload
): Promise<void> {
  const response = await apiClient<FeedbackCategoryResponse>(
    '/feedback-category/create',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  
  if (response.code !== 0) {
    throw new Error(response.message || 'Failed to create feedback category');
  }
}

export async function updateFeedbackCategory(
  id: number,
  payload: UpdateFeedbackCategoryPayload
): Promise<void> {
  const response = await apiClient<FeedbackCategoryResponse>(
    `/feedback-category/update/${id}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  
  if (response.code !== 0) {
    throw new Error(response.message || 'Failed to update feedback category');
  }
}

export async function deleteFeedbackCategory(id: number): Promise<void> {
  const response = await apiClient<FeedbackCategoryResponse>(
    `/feedback-category/delete/${id}`,
    {
      method: 'POST',
    }
  );
  
  if (response.code !== 0) {
    throw new Error(response.message || 'Failed to delete feedback category');
  }
}
