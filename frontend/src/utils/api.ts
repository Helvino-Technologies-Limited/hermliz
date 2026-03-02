import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hermliz.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('hermliz_token') ||
    sessionStorage.getItem('hermliz_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hermliz_token');
      sessionStorage.removeItem('hermliz_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
