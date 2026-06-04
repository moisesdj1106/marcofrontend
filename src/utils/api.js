const defaultApiUrl = import.meta.env.MODE === 'development'
  ? 'http://localhost:4000'
  : 'https://marcobackend.onrender.com';

export const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

export const getApiUrl = (path) => {
  if (!path) return API_URL;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
