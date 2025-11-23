const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
  // Get user from localStorage to send user ID in header
  const storedUser =
    typeof window !== 'undefined' ? localStorage.getItem('user') : null;

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

  // Add the x-user-id header if the user is logged in
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.id) {
        (config.headers as Headers).append('x-user-id', user.id);
      }
    } catch (e) {
      console.error(
        'Failed to parse user from localStorage for API request',
        e,
      );
    }
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
  try {
    const response = await fetch(fullUrl, config);
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
    return result;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
}

export default request;
