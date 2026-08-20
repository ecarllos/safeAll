import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('safeall_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface VaultItemSummary {
  id: string;
  title: string;
  category: 'bank' | 'dev' | 'app' | 'note';
  username?: string;
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  historyCount: number;
}

export interface HistoryItemSummary {
  id: string;
  changedAt: string;
}

export const authService = {
  async register(email: string, masterPassword: string) {
    const res = await api.post('/auth/register', { email, masterPassword });
    return res.data;
  },
  async login(email: string, masterPassword: string) {
    const res = await api.post('/auth/login', { email, masterPassword });
    return res.data;
  },
};

export const vaultService = {
  async getAll(search?: string, category?: string): Promise<VaultItemSummary[]> {
    const res = await api.get('/vault', { params: { search, category } });
    return res.data;
  },
  async create(data: {
    title: string;
    category: string;
    username?: string;
    url?: string;
    passwordOrSecret: string;
    masterPassword: string;
    notes?: string;
  }) {
    const res = await api.post('/vault', data);
    return res.data;
  },
  async update(
    id: string,
    data: {
      title?: string;
      category?: string;
      username?: string;
      url?: string;
      passwordOrSecret?: string;
      masterPassword?: string;
      notes?: string;
    },
  ) {
    const res = await api.patch(`/vault/${id}`, data);
    return res.data;
  },
  async decrypt(id: string, masterPassword: string): Promise<{ passwordOrSecret: string }> {
    const res = await api.post(`/vault/${id}/decrypt`, { masterPassword });
    return res.data;
  },
  async getHistory(id: string): Promise<HistoryItemSummary[]> {
    const res = await api.get(`/vault/${id}/history`);
    return res.data;
  },
  async decryptHistory(
    id: string,
    historyId: string,
    masterPassword: string,
  ): Promise<{ historyId: string; changedAt: string; passwordOrSecret: string }> {
    const res = await api.post(`/vault/${id}/history/${historyId}/decrypt`, {
      masterPassword,
    });
    return res.data;
  },
  async remove(id: string) {
    const res = await api.delete(`/vault/${id}`);
    return res.data;
  },
};
