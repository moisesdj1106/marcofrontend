export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getApiUrl = (path) => {
  if (!path) return API_URL;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
