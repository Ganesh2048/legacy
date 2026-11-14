const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers = {}, ...customConfig } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('legacy_token') : null;
  const authToken = token || storedToken;

  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const message = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || 'An unexpected error occurred';

    throw new ApiError(response.status, message, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
