// API client - calls Spring Boot backend at localhost:8081
// Falls back to mock data if backend is unavailable

import {
  Transaction, TransactionDetail, Alert, DashboardMetrics,
  ChartDataPoint, SystemSettings, User, PaginatedResponse,
  LoginRequest, LoginResponse, ManualReviewRequest, TransactionFilters,
  CreateUserRequest, ReportSummary,
} from './types';

import {
  MOCK_TRANSACTIONS, MOCK_ALERTS, MOCK_METRICS, MOCK_CHART_DATA,
  MOCK_SETTINGS, MOCK_USERS, getTransactionDetail, getRiskLevel,
} from './mockData';

const BASE_URL = '/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fraudshield_token');
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch (err) {
    // Network error / connection refused -> backend unavailable
    throw new Error('USE_MOCK');
  }

  if (!res.ok) {
    // Backend is available, but returned an error response
    let errMsg = `HTTP ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData && errorData.message) {
        errMsg = errorData.message;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errMsg);
  }

  return await res.json();
}

// Simulate async delay for realistic UX
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export async function login(req: LoginRequest): Promise<LoginResponse> {
  await delay(600);
  try {
    const res = await apiFetch<any>('/auth/login', {
      method: 'POST', body: JSON.stringify(req),
    });
    return res.data;
  } catch (err: any) {
    if (err.message === 'USE_MOCK') {
      // Mock login
      const valid = [
        { email: 'admin@fraudshield.com', password: 'admin123', role: 'SYSTEM_ADMIN', name: 'Admin User' },
        { email: 'analyst@fraudshield.com', password: 'analyst123', role: 'ANALYST_REVIEWER', name: 'John Analyst' },
      ].find(u => u.email === req.email && u.password === req.password);

      if (!valid) throw new Error('Invalid email or password');

      return {
        token: `mock-jwt-token-${Date.now()}`,
        user: { id: 1, name: valid.name, email: valid.email, role: valid.role as any, isActive: true, lastLoginAt: new Date().toISOString() },
      };
    }
    throw err;
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export async function fetchMetrics(): Promise<DashboardMetrics> {
  await delay(300);
  try {
    return await apiFetch<DashboardMetrics>('/dashboard/metrics');
  } catch (err: any) {
    if (err.message === 'USE_MOCK') return MOCK_METRICS;
    throw err;
  }
}

export async function fetchChartData(): Promise<ChartDataPoint[]> {
  await delay(400);
  try {
    return await apiFetch<ChartDataPoint[]>('/dashboard/chart-data');
  } catch (err: any) {
    if (err.message === 'USE_MOCK') return MOCK_CHART_DATA;
    throw err;
  }
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export async function fetchTransactions(filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> {
  await delay(350);
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.riskLevel && filters.riskLevel !== 'ALL') params.set('riskLevel', filters.riskLevel);
    if (filters.search) params.set('search', filters.search);
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.size !== undefined) params.set('size', String(filters.size));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortDir) params.set('sortDir', filters.sortDir);
    return await apiFetch<PaginatedResponse<Transaction>>(`/transactions?${params}`);
  } catch (err: any) {
    if (err.message === 'USE_MOCK') {
      // Filter mock data
      let data = [...MOCK_TRANSACTIONS];

      if (filters.status && filters.status !== 'ALL') {
        data = data.filter(t => t.transactionStatus === filters.status);
      }
      if (filters.riskLevel && filters.riskLevel !== 'ALL') {
        data = data.filter(t => getRiskLevel(t.fraudScore) === filters.riskLevel);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(t =>
          t.transactionId.toLowerCase().includes(q) ||
          t.merchantName.toLowerCase().includes(q) ||
          t.userId.toLowerCase().includes(q) ||
          t.userEmail.toLowerCase().includes(q)
        );
      }

      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const page = filters.page ?? 0;
      const size = filters.size ?? 10;
      const start = page * size;
      return {
        content: data.slice(start, start + size),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size,
        number: page,
      };
    }
    throw err;
  }
}

export async function fetchTransactionById(id: string): Promise<TransactionDetail | null> {
  await delay(300);
  try {
    return await apiFetch<TransactionDetail>(`/transactions/${id}`);
  } catch (err: any) {
    if (err.message === 'USE_MOCK') return getTransactionDetail(id);
    throw err;
  }
}

export async function submitManualReview(
  transactionId: string, req: ManualReviewRequest
): Promise<{ success: boolean; message: string }> {
  await delay(800);
  try {
    const res = await apiFetch<any>(`/transactions/${transactionId}/review`, {
      method: 'POST', body: JSON.stringify(req),
    });
    return res;
  } catch (err: any) {
    if (err.message === 'USE_MOCK') {
      // Simulate update in mock data
      const tx = MOCK_TRANSACTIONS.find(t => t.transactionId === transactionId || t.id === transactionId);
      if (tx) {
        tx.transactionStatus = req.decision === 'APPROVED' ? 'APPROVED' : req.decision === 'REJECTED' ? 'REJECTED' : 'MANUAL_REVIEW';
        tx.fraudFinalDecision = req.decision;
        tx.manualReviewReason = req.reason;
        tx.manualReviewNotes = req.notes ?? null;
        tx.reviewedAt = new Date().toISOString();
      }
      return { success: true, message: `Transaction ${req.decision.toLowerCase()} successfully` };
    }
    throw err;
  }
}

// ─── ALERTS ───────────────────────────────────────────────────────────────────
export async function fetchAlerts(): Promise<Alert[]> {
  await delay(300);
  try {
    return await apiFetch<Alert[]>('/alerts');
  } catch (err: any) {
    if (err.message === 'USE_MOCK') return MOCK_ALERTS;
    throw err;
  }
}

export async function acknowledgeAlert(
  id: number, action: 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED'
): Promise<{ success: boolean }> {
  await delay(500);
  try {
    const res = await apiFetch<any>(`/alerts/${id}/acknowledge`, { method: 'POST', body: JSON.stringify({ action }) });
    return res;
  } catch (err: any) {
    if (err.message === 'USE_MOCK') {
      const alert = MOCK_ALERTS.find(a => a.id === id);
      if (alert) {
        alert.status = action;
        alert.acknowledgedAt = new Date().toISOString();
        alert.acknowledgedBy = 'admin@fraudshield.com';
      }
      return { success: true };
    }
    throw err;
  }
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export async function fetchSettings(): Promise<SystemSettings> {
  await delay(200);
  try {
    return await apiFetch<SystemSettings>('/admin/settings');
  } catch (err: any) {
    if (err.message === 'USE_MOCK') return MOCK_SETTINGS;
    throw err;
  }
}

export async function saveSettings(settings: SystemSettings): Promise<{ success: boolean }> {
  await delay(700);
  try {
    const res = await apiFetch<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
    return res;
  } catch (err: any) {
    if (err.message === 'USE_MOCK') {
      Object.assign(MOCK_SETTINGS, settings);
      return { success: true };
    }
    throw err;
  }
}

export async function fetchUsers(): Promise<User[]> {
  await delay(300);
  try {
    return await apiFetch<User[]>('/admin/users');
  } catch (err: any) {
    if (err.message === 'USE_MOCK') return MOCK_USERS;
    throw err;
  }
}

export async function fetchHealth(): Promise<{ status: string; services: Record<string, string> }> {
  await delay(200);
  try {
    return await apiFetch('/health');
  } catch (err: any) {
    if (err.message === 'USE_MOCK') {
      return {
        status: 'UP',
        services: { database: 'UP', kafka: 'UP', redis: 'UP', fraudService: 'UP' },
      };
    }
    throw err;
  }
}

export async function createUser(req: CreateUserRequest): Promise<User> {
  await delay(500);
  try {
    const res = await apiFetch<any>('/admin/users', {
      method: 'POST', body: JSON.stringify(req),
    });
    return res.data as User;
  } catch (err: any) {
    if (err.message === 'USE_MOCK') {
      // Simulate adding user to mock list
      const newUser: User = {
        id: Date.now(),
        name: req.name,
        email: req.email,
        role: req.role,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      };
      MOCK_USERS.push(newUser);
      return newUser;
    }
    throw err;
  }
}

export async function fetchReportSummary(days: number = 30): Promise<ReportSummary> {
  await delay(400);
  try {
    return await apiFetch<ReportSummary>(`/reports/summary?days=${days}`);
  } catch (err: any) {
    if (err.message === 'USE_MOCK') {
      const total = MOCK_TRANSACTIONS.length;
      const rejected = MOCK_TRANSACTIONS.filter(t => t.transactionStatus === 'REJECTED').length;
      const approved = MOCK_TRANSACTIONS.filter(t => t.transactionStatus === 'APPROVED').length;
      const pending = MOCK_TRANSACTIONS.filter(t => t.transactionStatus === 'MANUAL_REVIEW').length;
      const highRisk = MOCK_TRANSACTIONS.filter(t => t.fraudScore >= 70).length;
      const avgMs = MOCK_TRANSACTIONS.reduce((s, t) => s + (t.processingTimeMs ?? 100), 0) / total;
      return {
        totalTransactions: total,
        approvedTransactions: approved,
        rejectedTransactions: rejected,
        pendingReviews: pending,
        highRiskTransactions: highRisk,
        fraudRate: Math.round((rejected / total) * 1000) / 10,
        avgProcessingTimeMs: Math.round(avgMs * 10) / 10,
        activeAlerts: MOCK_ALERTS.filter(a => a.status === 'ACTIVE').length,
        reportPeriod: `Last ${days} days`,
        generatedAt: new Date().toISOString(),
      };
    }
    throw err;
  }
}
