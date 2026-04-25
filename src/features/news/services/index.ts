import { apiClient } from '../../../lib/api-client';
import type { News } from '../types';

interface NewsApiResponse {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  imageKey: string | null;
  newsUrl: string;
  source: string;
  publishDate: string;
}

interface NewsApiListResponse {
  code: number;
  message: string;
  data: {
    content: NewsApiResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

function mapApiToNews(apiNews: NewsApiResponse): News {
  return {
    id: apiNews.id,
    title: apiNews.title,
    excerpt: apiNews.excerpt,
    imageUrl: apiNews.imageUrl,
    imageKey: apiNews.imageKey,
    newsUrl: apiNews.newsUrl,
    source: apiNews.source,
    publishDate: apiNews.publishDate,
  };
}

export interface FetchNewsResponse {
  news: News[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function fetchNews(page: number = 0, size: number = 10): Promise<FetchNewsResponse> {
  const response = await apiClient<NewsApiListResponse>(
    '/news/all',
    {
      method: 'GET',
      params: { page, size },
    }
  );

  return {
    news: response.data.content.map(mapApiToNews),
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    page: response.data.page,
    size: response.data.size,
  };
}

export interface CreateNewsPayload {
  title: string;
  excerpt?: string;
  newsUrl: string;
  source: string;
  publishDate: string;
  file?: File | null;
}

interface CreateNewsResponse {
  code: number;
  message: string;
  data: NewsApiResponse;
}

const HARD_CODED_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGVzIjpudWxsLCJzaWduIjpudWxsLCJpYXQiOjE3NzU3OTMxNTc1NzksImV4cCI6MTc3NTc5Njc1NzU3OX0.OcuqDvFuHymaB9AB9bHgaAGY04DlYL6pUjKqJWMb328";
const API_BASE_URL = "http://localhost:8080/api/v1/admin";

export async function createNews(payload: CreateNewsPayload): Promise<News> {
  const formData = new FormData();
  formData.append('title', payload.title);
  if (payload.excerpt) formData.append('excerpt', payload.excerpt);
  if (payload.newsUrl) formData.append('newsUrl', payload.newsUrl);
  if (payload.source) formData.append('source', payload.source);
  if (payload.publishDate) formData.append('publishDate', payload.publishDate);
  if (payload.file) formData.append('file', payload.file);

  const response = await fetch(`${API_BASE_URL}/news/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HARD_CODED_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`);
  }

  const json = await response.json();
  if (!json.data) {
    throw new Error('Không nhận được dữ liệu từ server');
  }
  return mapApiToNews(json.data);
}

interface DeleteNewsResponse {
  code: number;
  message: string;
  data: null;
}

export async function deleteNews(newsId: number): Promise<void> {
  await apiClient<DeleteNewsResponse>(
    `/news/delete/${newsId}`,
    {
      method: 'POST',
    }
  );
}

export interface UpdateNewsPayload {
  title?: string;
  excerpt?: string;
  newsUrl?: string;
  source?: string;
  publishDate?: string;
  file?: File | null;
}

interface UpdateNewsResponse {
  code: number;
  message: string;
  data: NewsApiResponse | null;
}

export async function updateNews(newsId: number, payload: UpdateNewsPayload): Promise<News> {
  const response = await apiClient<UpdateNewsResponse>(
    `/news/update/${newsId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  if (!response.data) {
    throw new Error('Không nhận được dữ liệu từ server');
  }
  return mapApiToNews(response.data);
}