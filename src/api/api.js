import axios from 'axios';

// Détecter si on utilise ngrok
const isNgrok = import.meta.env.VITE_USE_NGROK === 'true';

// Utiliser l'URL de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔧 Mode:', isNgrok ? 'ngrok' : 'local');
console.log('🔗 API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Timeout de 30 secondes
  withCredentials: false,
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
      console.error('❌ Status:', error.response.status);
    } else if (error.request) {
      console.error('❌ No response from server');
      console.error('❌ URL:', error.config?.url);
    } else {
      console.error('❌ Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Intercepteur pour logger les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Services Email
export const emailService = {
  send: (data) => {
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
    const payload = { ...data };
    
    if (typeof payload.numbers === 'string') {
      payload.numbers = payload.numbers.split(',').map(n => n.trim()).filter(n => n);
    }
    
    if (payload.number && !payload.numbers) {
      payload.numbers = [payload.number];
      delete payload.number;
    }
    
    if (payload.to && !payload.numbers) {
      payload.numbers = Array.isArray(payload.to) ? payload.to : [payload.to];
      delete payload.to;
    }
    
    console.log('📤 Envoi SMS payload:', payload);
    return api.post('/sms/send', payload);
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