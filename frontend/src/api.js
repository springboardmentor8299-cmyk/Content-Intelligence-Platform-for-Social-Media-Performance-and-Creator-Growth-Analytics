import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('creatoriq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle session expiration / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired or invalid token
      localStorage.removeItem('creatoriq_token');
      // Dispatch custom event for App to re-route to login
      window.dispatchEvent(new Event('creatoriq:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth Methods
export const loginUser = (credentials) =>
  api.post('/auth/login', credentials);

export const registerUser = (userData) =>
  api.post('/auth/register', userData);

// API Methods
export const fetchOverview = (platform = 'all') =>
  api.get(`/analytics/overview?platform=${platform}`);

export const fetchTrends = (days = 30, platform = 'all') =>
  api.get(`/analytics/trends?days=${days}&platform=${platform}`);

export const fetchContent = (params = {}) =>
  api.get('/content', { params });

export const fetchTopContent = (metric = 'views', limit = 5) =>
  api.get(`/content/top?metric=${metric}&limit=${limit}`);

export const compareContent = (contentIds) =>
  api.post('/content/compare', contentIds);

export const fetchAudienceDemographics = (platform = 'all') =>
  api.get(`/audience/demographics?platform=${platform}`);

export const fetchFollowerGrowth = (days = 30) =>
  api.get(`/audience/growth?days=${days}`);

export const fetchRevenueSummary = () =>
  api.get('/revenue/summary');

export const fetchDeals = (status = 'all') =>
  api.get(`/revenue/deals?status=${status}`);

export const createDeal = (dealData) =>
  api.post('/revenue/deals', dealData);

export const fetchSocialAccounts = () =>
  api.get('/social/accounts');

export const syncSocialAccount = (id) =>
  api.post(`/social/accounts/${id}/sync`);

export const toggleSocialAccount = (id) =>
  api.post(`/social/accounts/${id}/toggle`);

export const fetchNotifications = () =>
  api.get('/notifications');

export const markNotificationRead = (id) =>
  api.post(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.post('/notifications/mark-all-read');

export const switchRole = (role) =>
  api.post(`/auth/switch-role/${role}`);

export const fetchUserProfile = () =>
  api.get('/auth/me');

export const updateProfile = (profileData) =>
  api.put('/auth/profile', profileData);

export const updateAccountSettings = (settingsData) =>
  api.put('/auth/settings', settingsData);

export const fetchGrowthForecast = (months = 3) =>
  api.get(`/analytics/growth-forecast?months=${months}`);

export const fetchHashtagAnalysis = (platform = 'all') =>
  api.get(`/analytics/hashtags?platform=${platform}`);

export const fetchRecommendations = () =>
  api.get('/analytics/recommendations');

export const exportCSV = (type = 'content') =>
  `${API_BASE}/reports/export-csv?report_type=${type}`;
