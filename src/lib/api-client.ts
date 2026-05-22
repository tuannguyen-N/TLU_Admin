import { ADMIN_API_URL } from '../config/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  let url = `${ADMIN_API_URL}${endpoint}`;
  if (params) {
    const search = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    url += `?${search}`;
  }
  return url;
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const token = getAuthToken();

  const isFormData = fetchOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    "Accept": "application/json",
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Merge custom headers
  if (fetchOptions.headers) {
    const customHeaders = fetchOptions.headers as Record<string, string>;
    Object.entries(customHeaders).forEach(([key, value]) => {
      headers[key] = value;
    });
  }

  const response = await fetch(buildUrl(endpoint, params), {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Failed: ${response.status}`;
    try {
      const text = await response.text();
      console.error("[API] error body:", text);
      if (text) {
        const errorJson = JSON.parse(text);
        errorMessage = errorJson?.message || errorMessage;
      }
    } catch (e) {
      console.error("[API] failed to parse error body:", e);
    }
    throw new Error(errorMessage);
  }

  const json = await response.json();

  return json as T;
}