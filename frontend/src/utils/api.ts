import axios from 'axios';

const BASE_URL = typeof window !== 'undefined'
  ? ((window as any).__VITE_API_URL__ || import.meta.env.VITE_API_URL || 'https://hermliz.onrender.com/api')
  : 'https://hermliz.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hermliz_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hermliz_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
