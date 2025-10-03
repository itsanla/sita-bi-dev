import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log('API_URL configured:', API_URL);

// Definisikan tipe kustom untuk error agar bisa menyertakan detail
export class FetchError extends Error {
  response: Response;
  data: unknown;

  constructor(response: Response, data: unknown) {
    const message =
      (data as { message: string })?.message ||
      `Request failed with status ${response.status}`;
    super(message);
    this.response = response;
    this.data = data;
  }
}

interface CustomRequestInit extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
}

async function request<T>(
  endpoint: string,
  options: CustomRequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Bangun konfigurasi secara manual untuk menghindari masalah dengan spread operator
  const config: RequestInit = {
    method: options.method || 'GET',
    headers: new Headers(options.headers),
    cache: options.cache,
    credentials: options.credentials,
    mode: options.mode,
    redirect: options.redirect,
    referrer: options.referrer,
    referrerPolicy: options.referrerPolicy,
    integrity: options.integrity,
  };

  // Tambahkan token otorisasi jika ada
  if (token) {
    (config.headers as Headers).append('Authorization', `Bearer ${token}`);
  }

  // Logika cerdas untuk body
  if (options.body) {
    if (options.body instanceof FormData) {
      // Untuk FormData, jangan set Content-Type header
      // Browser akan otomatis set multipart/form-data dengan boundary
      config.body = options.body;
    } else if (typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
      (config.headers as Headers).set('Content-Type', 'application/json');
    } else {
      config.body = options.body;
    }
  }

  const fullUrl = `${API_URL}/api${endpoint}`;
  console.log('Making request to:', fullUrl);

  try {
    const response = await fetch(fullUrl, config);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'An unexpected error occurred' }));
      console.error('Request failed:', errorData);
      throw new FetchError(response, errorData);
    }

    // Handle kasus 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    const result = await response.json();
    console.log('Request successful:', result);
    return result;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
}

export default request;
