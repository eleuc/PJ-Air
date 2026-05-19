export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let activeToken: string | null = null;

/**
 * Sets the active JWT bearer token for authenticating outgoing requests.
 * 
 * Called by the following client-side execution sites in AuthContext:
 * 1. Mount initialization: when restoring session from localStorage on app boot.
 * 2. updateLocalSession: immediately after user login or registration.
 * 3. signOut: on user logout to clear the active token.
 * 
 * @param token - The raw JWT access token or null to clear authentication headers.
 */
export function setApiToken(token: string | null) {
  activeToken = token;
}

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
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
    throw new Error((data as any).message || 'Error en la petición');
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
      throw new Error(data.message || 'Error en la petición');
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
