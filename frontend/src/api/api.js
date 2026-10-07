import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uniskill_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('uniskill_token');
        localStorage.removeItem('uniskill_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// Users & Profile Endpoints
export const userAPI = {
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  updateSkills: (skills) => api.put('/users/skills', { skills }),
  getPortfolio: (studentId) => api.get(`/users/portfolio/${studentId}`),
  getStudentsDirectory: (params) => api.get('/users/students', { params }),
};

// Skills Endpoints
export const skillAPI = {
  getSkills: (params) => api.get('/skills', { params }),
  createSkill: (skillData) => api.post('/skills', skillData),
};

// Projects Endpoints
export const projectAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  getMyProjects: () => api.get('/projects/my/projects'),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  joinProject: (id, message) => api.post(`/projects/${id}/join`, { message }),
};

// Supervisor Endpoints
export const supervisorAPI = {
  getSupervisors: (params) => api.get('/supervisors', { params }),
  requestSupervision: (data) => api.post('/supervisors/request', data),
  getMyRequests: () => api.get('/supervisors/requests'),
  respondRequest: (id, data) => api.put(`/supervisors/requests/${id}`, data),
};

// Milestones Endpoints
export const milestoneAPI = {
  getMilestones: (projectId) => api.get(`/milestones/project/${projectId}`),
  createMilestone: (data) => api.post('/milestones', data),
  updateMilestone: (id, data) => api.put(`/milestones/${id}`, data),
  submitDeliverable: (id, data) => api.post(`/milestones/${id}/submit`, data),
  reviewMilestone: (id, data) => api.post(`/milestones/${id}/review`, data),
  toggleTask: (id, taskId) => api.patch(`/milestones/${id}/task/${taskId}`),
};

// Admin Endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
};

export default api;
