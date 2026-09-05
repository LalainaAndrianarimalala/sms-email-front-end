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
  send: (data) => {
    // Si 'to' est une chaîne avec des virgules, la convertir en tableau
    if (typeof data.to === 'string') {
      data.to = data.to.split(',').map(email => email.trim()).filter(email => email);
    }
    return api.post('/emails/send', data);
  },
  list: (params) => api.get('/emails', { params }),
  getById: (id) => api.get(`/emails/${id}`),
};

// Services SMS
export const smsService = {
  send: (data) => {
    // Si 'numbers' est une chaîne avec des virgules, la convertir en tableau
    if (typeof data.numbers === 'string') {
      data.numbers = data.numbers.split(',').map(num => num.trim()).filter(num => num);
    }
    // Si 'number' est utilisé (ancien format), le convertir en tableau
    if (data.number && !data.numbers) {
      data.numbers = [data.number];
      delete data.number;
    }
    return api.post('/sms/send', data);
  },
  history: (params) => api.get('/sms/history', { params }),
  inbox: () => api.get('/sms/inbox'),
  sync: () => api.post('/sms/sync'),
};

// Services Statistiques
export const statsService = {
  getSimpleStats: (params) => api.get('/sms/chart/simple', { params }),
  getFullStats: (params) => api.get('/sms/chart/stats', { params }),
  getWeekdayStats: (params) => api.get('/sms/chart/weekday', { params }),
};

export default api;