const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async patch(path: string, body: any) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  async get(path: string) {
    const response = await fetch(`${API_URL}${path}`);
    return handleResponse(response);
  },

  async delete(path: string) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
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
  }
};
