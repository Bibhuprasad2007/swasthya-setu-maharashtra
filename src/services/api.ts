/**
 * Decoupled Base API client for SwasthyaSetu Maharashtra
 * Uses environment variable VITE_API_BASE_URL (defaults to '/api' or prototype mock)
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Support secure credentials / cookies
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Allows HttpOnly cookies
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMsg = 'An unexpected server error occurred';
      try {
        const errorJson = await response.json();
        errorMsg = errorJson.message || errorMsg;
      } catch {
        // Non-JSON response
      }
      throw new ApiError(errorMsg, response.status);
    }

    return await response.json() as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Mask sensitive network exception details from end users
    throw new ApiError('Unable to reach the authentication service. Please check network connection.');
  }
}
