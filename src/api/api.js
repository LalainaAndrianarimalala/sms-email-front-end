import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('No response from server');
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Services Email
export const emailService = {
  send: (data) => api.post('/emails/send', data),
  list: (params) => api.get('/emails', { params }),
  getById: (id) => api.get(`/emails/${id}`),
};

// Services SMS
export const smsService = {
  send: (data) => api.post('/sms/send', data),
  history: (params) => api.get('/sms/history', { params }),
  inbox: () => api.get('/sms/inbox'),
  sync: () => api.post('/sms/sync'),
};

export default api;