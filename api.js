import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to attach token
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('fraudeye_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) { /* ignore */ }
  return config;
}, (error) => Promise.reject(error));

export const fetchScans = (opts = {}) => {
  // opts: { mine: boolean }
  const params = {};
  if (opts.mine) params.mine = 'true';
  return api.get('/scans', { params });
};

export const createScan = (data) => api.post('/scans', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
