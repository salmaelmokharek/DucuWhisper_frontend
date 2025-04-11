import axios from 'axios';

// Use environment variable for API URL or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
};

// File services
export const files = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: () => api.get('/files'),
  getById: (id) => api.get(`/files/${id}`),
  update: (id, data) => api.patch(`/files/${id}`, data),
  delete: (id) => api.delete(`/files/${id}`),
  restore: (id) => api.post(`/files/${id}/restore`),
  share: (id, expiresAt) => api.post(`/files/${id}/share`, { expiresAt }),
  download: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
};

// Folder services
export const folders = {
  create: (data) => api.post('/folders', data),
  getAll: () => api.get('/folders'),
  getById: (id) => api.get(`/folders/${id}`),
  update: (id, data) => api.patch(`/folders/${id}`, data),
  delete: (id) => api.delete(`/folders/${id}`),
  restore: (id) => api.post(`/folders/${id}/restore`),
};

export default api; 