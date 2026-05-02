import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';

// Helper to convert relative URLs to absolute URLs
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If already absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If relative URL, prepend backend URL
  if (url.startsWith('/')) {
    return `${BACKEND_URL}${url}`;
  }
  
  return `${BACKEND_URL}/${url}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.post('/profile/password', data),
};

// Admin APIs
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/dashboard/stats'),
  getSystemHealth: () => api.get('/admin/health'),
  
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  searchUsers: (params) => api.get('/admin/search/users', { params }),
  exportUsers: () => api.get('/admin/export/users', { responseType: 'blob' }),
  
  // Reports & Analytics
  getRevenue: (params) => api.get('/admin/reports/revenue', { params }),
  getTemplateAnalytics: () => api.get('/admin/analytics/templates'),
  getUserGrowth: () => api.get('/admin/analytics/growth'),
  
  // Templates
  createTemplate: (data) => api.post('/admin/templates', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateTemplate: (id, data) => api.put(`/admin/templates/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTemplate: (id) => api.delete(`/admin/templates/${id}`),
  getAllTemplates: (params) => api.get('/admin/templates', { params }),
  toggleTemplateStatus: (id) => api.post(`/admin/templates/${id}/toggle-status`),
  toggleTemplateFeatured: (id) => api.post(`/admin/templates/${id}/toggle-featured`),
  duplicateTemplate: (id) => api.post(`/admin/templates/${id}/duplicate`),
  getTemplateCategories: () => api.get('/admin/templates/categories'),
  getTemplateAnalytics: () => api.get('/admin/templates/analytics'),
  uploadTemplateAsset: (data) => api.post('/admin/templates/upload-asset', data),
  
  // Promo Codes
  getPromoCodes: (params) => api.get('/admin/promo', { params }),
  getPromoCode: (id) => api.get(`/admin/promo/${id}`),
  createPromoCode: (data) => api.post('/admin/promo', data),
  updatePromoCode: (id, data) => api.put(`/admin/promo/${id}`, data),
  deletePromoCode: (id) => api.delete(`/admin/promo/${id}`),
  getPromoUsage: (id) => api.get(`/admin/promo/${id}/usage`),
  togglePromoStatus: (id) => api.post(`/admin/promo/${id}/toggle`),
};

// Photo APIs
export const photoAPI = {
  getPhotos: (params) => api.get('/photos', { params }),
  getPhoto: (id) => api.get(`/photos/${id}`),
  deletePhoto: (id) => api.delete(`/photos/${id}`),
};

// Template APIs
export const templatesAPI = {
  getTemplates: (params) => api.get('/templates', { params }),
  getTemplate: (id) => api.get(`/templates/${id}`),
  getCategories: () => api.get('/templates/categories'),
  incrementUsage: (id) => api.post(`/templates/${id}/usage`),
};

// Promo APIs (User)
export const promoAPI = {
  validatePromoCode: (data) => api.post('/promo/validate', data),
};

// Payment APIs
export const paymentAPI = {
  getPayments: (params) => api.get('/payments', { params }),
  getPayment: (id) => api.get(`/payments/${id}`),
};

// Session APIs
export const sessionAPI = {
  createSession: (data) => api.post('/sessions', data),
  getSessions: (params) => api.get('/sessions', { params }),
  getSession: (id) => api.get(`/sessions/${id}`),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data),
  endSession: (id) => api.post(`/sessions/${id}/end`),
  extendSession: (id, data) => api.post(`/sessions/${id}/extend`, data),
  getSessionPhotos: (id) => api.get(`/sessions/${id}/photos`),
  deleteSession: (id) => api.delete(`/sessions/${id}`),
};

// Search APIs
export const searchAPI = {
  globalSearch: (params) => api.get('/search', { params }),
  searchTemplates: (params) => api.get('/search/templates', { params }),
  searchPhotos: (params) => api.get('/search/photos', { params }),
  getSuggestions: (params) => api.get('/search/suggestions', { params }),
  getPopularSearches: () => api.get('/search/popular'),
};

// Audit APIs
export const auditAPI = {
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export default api;
