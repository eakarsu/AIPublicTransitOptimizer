import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3601/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// Normalize paginated responses for backward compatibility
// Returns response with data.data = the actual array (or original array if not paginated)
function normalizeGetAll(promise) {
  return promise.then(res => {
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      // New paginated format - keep response but also expose flat array for backward compat
      res.data = res.data.data;
    }
    return res;
  });
}

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const routesAPI = {
  getAll: (params) => normalizeGetAll(api.get('/routes', { params })),
  getOne: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
};

export const ridershipAPI = {
  getAll: (params) => normalizeGetAll(api.get('/ridership', { params })),
  getOne: (id) => api.get(`/ridership/${id}`),
  create: (data) => api.post('/ridership', data),
  update: (id, data) => api.put(`/ridership/${id}`, data),
  delete: (id) => api.delete(`/ridership/${id}`),
};

export const schedulesAPI = {
  getAll: (params) => normalizeGetAll(api.get('/schedules', { params })),
  getOne: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};

export const faresAPI = {
  getAll: (params) => normalizeGetAll(api.get('/fares', { params })),
  getOne: (id) => api.get(`/fares/${id}`),
  create: (data) => api.post('/fares', data),
  update: (id, data) => api.put(`/fares/${id}`, data),
  delete: (id) => api.delete(`/fares/${id}`),
};

export const accessibilityAPI = {
  getAll: (params) => normalizeGetAll(api.get('/accessibility', { params })),
  getOne: (id) => api.get(`/accessibility/${id}`),
  create: (data) => api.post('/accessibility', data),
  update: (id, data) => api.put(`/accessibility/${id}`, data),
  delete: (id) => api.delete(`/accessibility/${id}`),
};

export const fleetAPI = {
  getAll: (params) => normalizeGetAll(api.get('/fleet', { params })),
  getOne: (id) => api.get(`/fleet/${id}`),
  create: (data) => api.post('/fleet', data),
  update: (id, data) => api.put(`/fleet/${id}`, data),
  delete: (id) => api.delete(`/fleet/${id}`),
};

export const budgetsAPI = {
  getAll: (params) => normalizeGetAll(api.get('/budgets', { params })),
  getOne: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const incidentsAPI = {
  getAll: (params) => normalizeGetAll(api.get('/incidents', { params })),
  getOne: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
};

export const staffAPI = {
  getAll: (params) => normalizeGetAll(api.get('/staff', { params })),
  getOne: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const performanceAPI = {
  getAll: (params) => normalizeGetAll(api.get('/performance', { params })),
  getOne: (id) => api.get(`/performance/${id}`),
  create: (data) => api.post('/performance', data),
  update: (id, data) => api.put(`/performance/${id}`, data),
  delete: (id) => api.delete(`/performance/${id}`),
};

export const stopsAPI = {
  getAll: (params) => normalizeGetAll(api.get('/stops', { params })),
  getOne: (id) => api.get(`/stops/${id}`),
  create: (data) => api.post('/stops', data),
  update: (id, data) => api.put(`/stops/${id}`, data),
  delete: (id) => api.delete(`/stops/${id}`),
};

export const maintenanceAPI = {
  getAll: (params) => normalizeGetAll(api.get('/maintenance', { params })),
  getOne: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

export const feedbackAPI = {
  getAll: (params) => normalizeGetAll(api.get('/feedback', { params })),
  getOne: (id) => api.get(`/feedback/${id}`),
  create: (data) => api.post('/feedback', data),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
};

export const energyAPI = {
  getAll: (params) => normalizeGetAll(api.get('/energy', { params })),
  getOne: (id) => api.get(`/energy/${id}`),
  create: (data) => api.post('/energy', data),
  update: (id, data) => api.put(`/energy/${id}`, data),
  delete: (id) => api.delete(`/energy/${id}`),
};

export const safetyAPI = {
  getAll: (params) => normalizeGetAll(api.get('/safety', { params })),
  getOne: (id) => api.get(`/safety/${id}`),
  create: (data) => api.post('/safety', data),
  update: (id, data) => api.put(`/safety/${id}`, data),
  delete: (id) => api.delete(`/safety/${id}`),
};

export const aiAPI = {
  optimizeRoute: (data) => api.post('/ai/optimize-route', data || {}),
  analyzeRidership: (data) => api.post('/ai/analyze-ridership', data || {}),
  optimizeSchedule: (data) => api.post('/ai/optimize-schedule', data || {}),
  modelFares: (data) => api.post('/ai/model-fares', data || {}),
  checkAccessibility: (data) => api.post('/ai/check-accessibility', data || {}),
  allocateFleet: (data) => api.post('/ai/allocate-fleet', data || {}),
  analyzeBudget: (data) => api.post('/ai/analyze-budget', data || {}),
  analyzeIncidents: (data) => api.post('/ai/analyze-incidents', data || {}),
  optimizeStaff: (data) => api.post('/ai/optimize-staff', data || {}),
  analyzePerformance: (data) => api.post('/ai/analyze-performance', data || {}),
  optimizeStops: (data) => api.post('/ai/optimize-stops', data || {}),
  planMaintenance: (data) => api.post('/ai/plan-maintenance', data || {}),
  analyzeFeedback: (data) => api.post('/ai/analyze-feedback', data || {}),
  analyzeEnergy: (data) => api.post('/ai/analyze-energy', data || {}),
  analyzeSafety: (data) => api.post('/ai/analyze-safety', data || {}),
  riderChat: (data) => api.post('/ai/rider-chat', data),
  forecastDemand: (data) => api.post('/ai/forecast-demand', data || {}),
  equityReport: () => api.get('/ai/equity-report'),
  incidentPatterns: (data) => api.post('/ai/incident-patterns', data || {}),
  crowdingPrediction: (data) => api.post('/ai/crowding-prediction', data || {}),
  maintenanceTriage: (data) => api.post('/ai/maintenance-triage', data || {}),
};

export const gtfsAPI = {
  importGTFS: (formData) => api.post('/gtfs/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default api;
