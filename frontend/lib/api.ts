const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  async post(path: string, body: any) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }
    return data;
  },

  async patch(path: string, body: any) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }
    return data;
  },

  async get(path: string) {
    const response = await fetch(`${API_URL}${path}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }
    return data;
  },

  async delete(path: string) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error en la petición');
    }
    return true;
  }
};
