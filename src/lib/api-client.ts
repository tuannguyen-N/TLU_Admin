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
  const token = localStorage.getItem("authToken") || "";
  console.log("[API] authToken from localStorage:", token ? `${token.substring(0, 20)}...` : "empty");
  return token;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  // const token = getAuthToken();
  const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGVzIjpudWxsLCJzaWduIjpudWxsLCJpYXQiOjE3NzU3OTMxNTc1NzksImV4cCI6MTc3NTk2NzU3NTc5fQ.OcuqDvFuHymaB9AB9bHgaAGY04DlYL6pUjKqJWMb328";

  console.log("[API] calling:", buildUrl(endpoint, params));
  console.log("[API] token being used:", token ? `Bearer ${token.substring(0, 20)}...` : "NO TOKEN");
  console.log("[API] fetchOptions:", fetchOptions);

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

  console.log("[API] final headers:", headers);

  const response = await fetch(buildUrl(endpoint, params), {
    ...fetchOptions,
    headers,
  });

  console.log("[API] status:", response.status);

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
  console.log("[API] success:", json);

  return json as T;
}