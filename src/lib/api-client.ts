const ADMIN_API_URL = '...';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  let url = `${ADMIN_API_URL}${endpoint}`;
  if (params) {
    const search = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    url += `?${search}`;
  }
  return url;
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}

function getRefreshToken(): string {
  return localStorage.getItem('refreshToken') || '';
}

function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  window.location.href = '/login';
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${ADMIN_API_URL}/oauth2/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refreshToken),
    });

    if (!response.ok) return false;

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data.data;

    if (accessToken) localStorage.setItem('authToken', accessToken);
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

    return true;
  } catch {
    return false;
  }
}

function buildHeaders(fetchOptions: RequestInit): Record<string, string> {
  const isFormData = fetchOptions.body instanceof FormData;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (fetchOptions.headers) {
    Object.entries(fetchOptions.headers as Record<string, string>).forEach(
      ([k, v]) => (headers[k] = v)
    );
  }

  return headers;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);

  // Lần gọi đầu
  const response = await fetch(url, {
    ...fetchOptions,
    headers: buildHeaders(fetchOptions),
  });

  // Nếu 401 → thử refresh rồi gọi lại 1 lần
  if (response.status === 401) {
    const refreshed = await tryRefreshToken();

    if (!refreshed) {
      clearAuth();
      throw new Error('Phiên đăng nhập hết hạn');
    }

    // Gọi lại với token mới
    const retryResponse = await fetch(url, {
      ...fetchOptions,
      headers: buildHeaders(fetchOptions), // buildHeaders tự đọc token mới từ localStorage
    });

    if (retryResponse.status === 401) {
      clearAuth();
      throw new Error('Phiên đăng nhập hết hạn');
    }

    if (!retryResponse.ok) {
      const text = await retryResponse.text();
      const errorJson = JSON.parse(text);
      throw new Error(errorJson?.message || `Failed: ${retryResponse.status}`);
    }

    return retryResponse.json() as Promise<T>;
  }

  if (!response.ok) {
    let errorMessage = `Failed: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        const errorJson = JSON.parse(text);
        errorMessage = errorJson?.message || errorMessage;
      }
    } catch {
      // giữ nguyên errorMessage
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}