import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'ch_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: API_URL,
});

// Attach the JWT on every request if present.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export async function apiRegister(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data; // { token, user }
}

export async function apiLogin(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data; // { token, user }
}

export async function apiGoogle(credential) {
  const { data } = await api.post('/auth/google', { credential });
  return data; // { token, user }
}

// --- Issues ---
export async function fetchIssues(params = {}) {
  // Strip empty params so the backend doesn't choke on "?category="
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const { data } = await api.get('/issues', { params: clean });
  return Array.isArray(data) ? data : data?.issues ?? [];
}

export async function fetchIssue(id) {
  const { data } = await api.get(`/issues/${id}`);
  return data; // { issue, statusUpdates } OR a flat issue — caller normalizes
}

export async function createIssue({ image, lat, lng }) {
  const form = new FormData();
  form.append('image', image);
  form.append('lat', lat);
  form.append('lng', lng);
  const { data } = await api.post('/issues', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // the created issue
}

export async function fetchNearbyIssues({ lat, lng, radius, category } = {}) {
  const { data } = await api.get('/issues/nearby', {
    params: Object.fromEntries(
      Object.entries({ lat, lng, radius, category }).filter(
        ([, v]) => v !== undefined && v !== null && v !== ''
      )
    ),
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchIssueLetter(id) {
  const { data } = await api.post(`/issues/${id}/letter`);
  return data; // { subject, body, department }
}

export async function confirmIssue(id) {
  const { data } = await api.post(`/issues/${id}/confirm`);
  return data; // { confirmations }
}

export async function deleteIssue(id) {
  const { data } = await api.delete(`/issues/${id}`);
  return data; // { ok, _id }
}

export async function updateIssueStatus(id, payload) {
  // payload: { status, note, category?, title?, severity? }
  const { data } = await api.patch(`/issues/${id}/status`, payload);
  return data;
}

// --- Stats ---
export async function fetchStats() {
  const { data } = await api.get('/stats');
  return data; // { total, open, resolved, byCategory, resolvedThisWeek }
}

export async function fetchLeaderboard() {
  const { data } = await api.get('/stats/leaderboard');
  return data; // { leaders: [...], updatedAt }
}

export async function fetchTrends() {
  const { data } = await api.get('/stats/trends');
  return data; // { days, reportedByDay, resolvedByDay, byCategory, byStatus, topAreas, ... }
}

export async function fetchSla() {
  const { data } = await api.get('/stats/sla');
  return data; // { byCategory: { cat: { avgDays, count } }, overallAvgDays, sampleSize }
}

export default api;
