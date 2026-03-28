import { browser } from '$app/environment';

const API_URL = 'http://localhost:8000/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}, fetchFn = fetch) {
  let token = null;
  
  if (browser) {
    token = localStorage.getItem('auth_token');
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  });

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetchFn(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
    throw new Error(error.message || 'API Hatası');
  }

  return response.json();
}
