import { CHATBOT_API_URL } from '../../../config/api';
import type { ApiResponse, UploadDocumentResult } from '../types';

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}

async function documentApiClient<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${CHATBOT_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(json?.message || `Request failed: ${response.status}`);
  }

  if (!json || json.code !== 0) {
    throw new Error(json?.message || 'Thao tác tài liệu thất bại');
  }

  return json as ApiResponse<T>;
}

export async function uploadDocuments(files: File[]): Promise<UploadDocumentResult> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await documentApiClient<UploadDocumentResult>('/upload', {
    method: 'POST',
    body: formData,
  });

  return response.data;
}

export async function deleteDocuments(sources: string[]): Promise<void> {
  await documentApiClient<{ message: string }>('/delete-document', {
    method: 'POST',
    body: JSON.stringify({ source: sources }),
  });
}
