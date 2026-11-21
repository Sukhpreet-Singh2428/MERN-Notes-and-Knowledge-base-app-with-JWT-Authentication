import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach Authorization header when JWT exists
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('hearth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error extraction and 401 handling
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Only clear token and dispatch auth:logout for authenticated requests, not login attempts
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('hearth_token');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const notesApi = {
  /**
   * Authentication endpoints
   */
  login: (data) => client.post('/auth/login', data),
  register: (data) => client.post('/auth/register', data),

  /**
   * Fetch notes with optional filtering
   * @param {Object} params - { view, search, tag, color, dateFrom, dateTo, sort }
   */
  getNotes: (params = {}) => client.get('/notes', { params }),

  /**
   * Fetch single note by ID
   */
  getNoteById: (id) => client.get(`/notes/${id}`),

  /**
   * Create a new note
   */
  createNote: (data) => client.post('/notes', data),

  /**
   * Update existing note
   */
  updateNote: (id, data) => client.put(`/notes/${id}`, data),

  /**
   * Toggle pinned state
   */
  togglePin: (id) => client.patch(`/notes/${id}/pin`),

  /**
   * Toggle archive state
   */
  toggleArchive: (id) => client.patch(`/notes/${id}/archive`),

  /**
   * Soft delete note (moves to trash)
   */
  softDelete: (id) => client.delete(`/notes/${id}`),

  /**
   * Restore note from trash
   */
  restoreNote: (id) => client.patch(`/notes/${id}/restore`),

  /**
   * Permanently delete note
   */
  permanentDelete: (id) => client.delete(`/notes/${id}/permanent`),

  /**
   * Fetch author profile
   */
  getProfile: () => client.get('/profile'),

  /**
   * Update author profile
   */
  updateProfile: (data) => client.put('/profile', data),

  /**
   * Backend health check
   */
  getHealth: () => client.get('/health'),
};

export default notesApi;
