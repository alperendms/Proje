import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
  login: (data) => axios.post(`${API_BASE}/auth/login`, data),
  getMe: () => axios.get(`${API_BASE}/auth/me`, { headers: getAuthHeader() }),
  
  // Users
  getUser: (userId) => axios.get(`${API_BASE}/users/${userId}`),
  updateProfile: (data) => axios.put(`${API_BASE}/users/profile`, data, { headers: getAuthHeader() }),
  followUser: (userId) => axios.post(`${API_BASE}/users/${userId}/follow`, {}, { headers: getAuthHeader() }),
  getFollowStatus: (userId) => axios.get(`${API_BASE}/users/${userId}/follow-status`, { headers: getAuthHeader() }),
  
  // Quotes
  createQuote: (data) => axios.post(`${API_BASE}/quotes`, data, { headers: getAuthHeader() }),
  getQuotes: (params) => axios.get(`${API_BASE}/quotes`, { params }),
  getQuote: (quoteId) => axios.get(`${API_BASE}/quotes/${quoteId}`),
  deleteQuote: (quoteId) => axios.delete(`${API_BASE}/quotes/${quoteId}`, { headers: getAuthHeader() }),
  likeQuote: (quoteId) => axios.post(`${API_BASE}/quotes/${quoteId}/like`, {}, { headers: getAuthHeader() }),
  saveQuote: (quoteId) => axios.post(`${API_BASE}/quotes/${quoteId}/save`, {}, { headers: getAuthHeader() }),
  getQuoteStatus: (quoteId) => axios.get(`${API_BASE}/quotes/${quoteId}/status`, { headers: getAuthHeader() }),
  
  // Categories
  createCategory: (data) => axios.post(`${API_BASE}/categories`, data, { headers: getAuthHeader() }),
  getCategories: (parentId) => axios.get(`${API_BASE}/categories`, { params: { parent_id: parentId } }),
  getCategory: (categoryId) => axios.get(`${API_BASE}/categories/${categoryId}`),
  
  // Discover
  getTrending: () => axios.get(`${API_BASE}/discover/trending`),
  getMostLiked: (params) => axios.get(`${API_BASE}/discover/liked`, { params }),
  getMostSaved: (params) => axios.get(`${API_BASE}/discover/saved`, { params }),
  getMostViewed: (params) => axios.get(`${API_BASE}/discover/viewed`, { params }),
  getUserSaved: () => axios.get(`${API_BASE}/user/saved`, { headers: getAuthHeader() }),
  
  // Messages
  sendMessage: (data) => axios.post(`${API_BASE}/messages`, data, { headers: getAuthHeader() }),
  getConversations: () => axios.get(`${API_BASE}/messages/conversations`, { headers: getAuthHeader() }),
  getMessages: (userId) => axios.get(`${API_BASE}/messages/${userId}`, { headers: getAuthHeader() }),
  getUnreadCount: () => axios.get(`${API_BASE}/messages/unread/count`, { headers: getAuthHeader() }),
  
  // Ranking
  getRanking: (period) => axios.get(`${API_BASE}/ranking`, { params: { period } }),
  
  // Home
  getHomeData: () => axios.get(`${API_BASE}/home`),
  
  // Admin
  getAdminSettings: () => axios.get(`${API_BASE}/admin/settings`, { headers: getAuthHeader() }),
  updateAdminSettings: (data) => axios.put(`${API_BASE}/admin/settings`, data, { headers: getAuthHeader() }),
  addBackground: (data) => axios.post(`${API_BASE}/admin/backgrounds`, data, { headers: getAuthHeader() }),
  getBackgrounds: (type) => axios.get(`${API_BASE}/backgrounds`, { params: { type } }),
  deleteBackground: (bgId) => axios.delete(`${API_BASE}/admin/backgrounds/${bgId}`, { headers: getAuthHeader() }),
  getAdminStats: () => axios.get(`${API_BASE}/admin/stats`, { headers: getAuthHeader() })
};

export default api;