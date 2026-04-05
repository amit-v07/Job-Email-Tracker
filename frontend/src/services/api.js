import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const fetchEmails = async (filters = {}) => {
  const { data } = await api.get('/emails', { params: filters });
  return data;
};

export const updateEmailStatus = async (id, status) => {
  const { data } = await api.patch(`/emails/${id}`, { status });
  return data;
};

export const updateEmailSnooze = async (id, snoozed_until) => {
  const { data } = await api.patch(`/emails/${id}`, { snoozed_until });
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await api.patch(`/emails/${id}`, { is_unread: false });
  return data;
};

export const dismissEmail = async (id) => {
  const { data } = await api.delete(`/emails/${id}`);
  return data;
};

export const triggerManualFetch = async () => {
  const { data } = await api.post('/emails/fetch');
  return data;
};
