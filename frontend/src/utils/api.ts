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

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. It's a 401 error
    // 2. It's NOT the /auth/me endpoint (that's handled by AuthContext)
    // 3. We're not already redirecting
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/me') &&
      !error.config?.url?.includes('/auth/login') &&
      !isRedirecting
    ) {
      isRedirecting = true;
      localStorage.removeItem('hermliz_token');
      sessionStorage.removeItem('hermliz_token');
      window.location.href = '/login';
      setTimeout(() => { isRedirecting = false; }, 3000);
    }
    return Promise.reject(error);
  }
);

export default api;
