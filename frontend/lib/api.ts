export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Gets the JWT token directly from localStorage to avoid race conditions.
 * This synchronous access prevents authentication issues during page refresh.
 */
function getTokenFromStorage(): string | null {
  try {
    const saved = localStorage.getItem('local_session');
    if (!saved) return null;
    const { session } = JSON.parse(saved);
    return session?.access_token || null;
  } catch {
    return null;
  }
}

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  const token = getTokenFromStorage();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response: Response) {
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Error parsing JSON response', e);
    }
  }

  if (!response.ok) {
    throw new ApiError((data as any).message || 'Error en la petición', response.status);
  }
  return data;
}

export const api = {
  async post(path: string, body: any) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async patch(path: string, body: any) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: getHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async get(path: string) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async delete(path: string) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      const text = await response.text();
      let data = { message: '' };
      try {
        data = text ? JSON.parse(text) : { message: '' };
      } catch (e) {}
      throw new ApiError(data.message || 'Error en la petición', response.status);
    }
    return true;
  },

  async upload(path: string, formData: FormData) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },

  async ping(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}${path}`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
