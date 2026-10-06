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

export const fetchKPISummary = () =>
  api.get('/analytics/kpi-summary');

// Revenue Analytics (M3)
export const fetchRevenue = (params = {}) =>
  api.get('/revenue', { params });

export const fetchRevenueSummary = () =>
  api.get('/revenue/summary');

export const fetchRevenueTrends = () =>
  api.get('/revenue/trends');

export const createRevenueRecord = (data) =>
  api.post('/revenue', data);

export const updateRevenueRecord = (id, data) =>
  api.put(`/revenue/${id}`, data);

export const deleteRevenueRecord = (id) =>
  api.delete(`/revenue/${id}`);

// Backward compatibility for existing components
export const fetchDeals = (status = 'all') =>
  api.get(`/revenue?status=${status}`);

export const createDeal = (dealData) =>
  api.post('/revenue', dealData);

// Social Media Integrations
export const fetchSocialAccounts = () =>
  api.get('/social/accounts');

export const fetchPlatformsStatus = () =>
  api.get('/social/platforms/status');

export const syncSocialAccount = (id) =>
  api.post(`/social/accounts/${id}/sync`);

export const toggleSocialAccount = (id) =>
  api.post(`/social/accounts/${id}/toggle`);

// Notifications (M3)
export const fetchNotifications = (params = {}) =>
  api.get('/notifications', { params });

export const fetchUnreadNotificationsCount = () =>
  api.get('/notifications/unread-count');

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.patch('/notifications/read-all');

// Reports & Export (M3)
export const fetchReportPreview = (reportType = 'analytics_summary', period = '30d') =>
  api.get(`/reports/preview?report_type=${reportType}&period=${period}`);

export const getReportExportUrl = (reportType = 'analytics_summary', period = '30d', format = 'csv') =>
  `${API_BASE}/reports/export?report_type=${reportType}&period=${period}&format=${format}`;

export const downloadReportFile = async (reportType = 'analytics_summary', period = '30d', format = 'csv') => {
  const response = await api.get(`/reports/export?report_type=${reportType}&period=${period}&format=${format}`, {
    responseType: 'blob'
  });
  const blob = new Blob([response.data], {
    type: format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv'
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CreatorIQ_${reportType}_${period}.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const exportCSV = (type = 'content') =>
  `${API_BASE}/reports/export-csv?report_type=${type}`;


// User & Role Switching
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
