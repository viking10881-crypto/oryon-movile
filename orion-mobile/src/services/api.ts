import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://oryon-movile.onrender.com';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    const msg =
      data.error ||
      data.detail ||
      (typeof data === 'object' ? Object.values(data).flat().join(' ') : null) ||
      'Error en la solicitud';
    throw new Error(String(msg));
  }
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ─── Accounts ─────────────────────────────────────────────────
export const accountsApi = {
  list: () => request<Account[]>('/accounts/'),
  totalLiquidity: () => request<{ total: string }>('/accounts/total-liquidity/'),
  create: (data: { name: string; type: string; balance?: number; currency?: string }) =>
    request<Account>('/accounts/', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Transactions ─────────────────────────────────────────────
export const transactionsApi = {
  list: (params?: { type?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    return request<Transaction[]>(`/transactions/?${qs.toString()}`);
  },
  summary: () => request<{ total_income: string; total_expense: string }>('/transactions/summary/'),
  create: (data: Partial<Transaction>) =>
    request<Transaction>('/transactions/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/transactions/${id}/`, { method: 'DELETE' }),
};

// ─── Tasks ────────────────────────────────────────────────────
export const tasksApi = {
  list: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return request<Task[]>(`/tasks/${qs}`);
  },
  create: (data: { title: string; priority?: string; due_date?: string; notes?: string }) =>
    request<Task>('/tasks/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/tasks/${id}/`, { method: 'DELETE' }),
};

// ─── Debts ────────────────────────────────────────────────────
export const debtsApi = {
  list: () => request<Debt[]>('/debts/'),
  create: (data: Partial<Debt>) =>
    request<Debt>('/debts/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Debt>) =>
    request<Debt>(`/debts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Tipos ────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  title: string;
  amount: string;
  type: 'income' | 'expense' | 'transfer';
  status: string;
  date: string;
  notes: string | null;
  category_name?: string;
  category_icon?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  priority: string;
  due_date: string | null;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  total_amount: string;
  remaining_amount: string;
  monthly_payment: string | null;
  interest_rate: string | null;
  due_date: string | null;
  paid_percentage: string;
}
