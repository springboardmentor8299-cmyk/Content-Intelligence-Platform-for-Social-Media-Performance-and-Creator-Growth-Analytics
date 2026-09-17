import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('creatoriq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Keep demo mode on the dashboard instead of redirecting to login.
client.interceptors.response.use((response) => {
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default client;
