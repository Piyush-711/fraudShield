// Mock data - realistic seed data matching backend schema

import {
  Transaction, Alert, DashboardMetrics, ChartDataPoint,
  SystemSettings, User, AuditLog, TransactionDetail
} from './types';

// ─── USERS ────────────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: 1, name: 'John Doe', email: 'john@bank.com', role: 'ANALYST_REVIEWER', isActive: true, lastLoginAt: '2026-06-15T08:00:00Z' },
  { id: 2, name: 'Jane Smith', email: 'jane@bank.com', role: 'SYSTEM_ADMIN', isActive: true, lastLoginAt: '2026-06-15T07:30:00Z' },
  { id: 3, name: 'Bob Engineer', email: 'bob@bank.com', role: 'ANALYST_VIEWER', isActive: false, lastLoginAt: '2026-06-10T14:00:00Z' },
  { id: 4, name: 'Alice ML', email: 'alice@bank.com', role: 'DATA_SCIENTIST', isActive: true, lastLoginAt: '2026-06-15T09:00:00Z' },
  { id: 5, name: 'Mike Ops', email: 'mike@bank.com', role: 'OPERATOR', isActive: true, lastLoginAt: '2026-06-14T18:00:00Z' },
];

export const CREDENTIALS = [
  { email: 'admin@fraudshield.com', password: 'admin123', role: 'SYSTEM_ADMIN', name: 'Admin User' },
  { email: 'analyst@fraudshield.com', password: 'analyst123', role: 'ANALYST_REVIEWER', name: 'John Analyst' },
];

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
const merchants = [
  { name: 'Amazon.com', category: 'SHOPPING' },
  { name: 'Jewelry Palace', category: 'JEWELRY' },
  { name: 'Grand Hotel NYC', category: 'HOTEL' },
  { name: 'Best Buy Electronics', category: 'ELECTRONICS' },
  { name: 'Starbucks', category: 'FOOD_BEVERAGE' },
  { name: 'Walmart', category: 'RETAIL' },
  { name: 'Apple Store', category: 'ELECTRONICS' },
  { name: 'Shell Gas Station', category: 'GAS_STATION' },
  { name: 'United Airlines', category: 'TRAVEL' },
  { name: 'Casino Royale', category: 'GAMBLING' },
  { name: 'Netflix', category: 'ENTERTAINMENT' },
  { name: 'Luxury Boutique', category: 'LUXURY' },
];

const locations = [
  { city: 'San Francisco', country: 'US', ipAddress: '192.168.1.100' },
  { city: 'New York', country: 'US', ipAddress: '10.0.0.55' },
  { city: 'Las Vegas', country: 'US', ipAddress: '172.16.0.23' },
  { city: 'Miami', country: 'US', ipAddress: '192.168.2.45' },
  { city: 'London', country: 'GB', ipAddress: '85.12.34.56' },
  { city: 'Tokyo', country: 'JP', ipAddress: '203.45.67.89' },
];

function generateRiskFactors(score: number) {
  const factors = [];
  if (score > 70) {
    factors.push({ factor: 'high_amount', weight: 0.35, explanation: 'Transaction amount 8x higher than user average' });
    factors.push({ factor: 'unusual_merchant', weight: 0.28, explanation: 'First time purchasing from this merchant' });
    factors.push({ factor: 'time_anomaly', weight: 0.22, explanation: 'Transaction at 2:30 AM, user usually shops 10AM–6PM' });
    if (score > 85) factors.push({ factor: 'location_mismatch', weight: 0.15, explanation: 'Transaction in different city than usual' });
  } else if (score > 40) {
    factors.push({ factor: 'amount_deviation', weight: 0.30, explanation: 'Amount 2x higher than 30-day average' });
    factors.push({ factor: 'velocity_check', weight: 0.25, explanation: '3 transactions in last hour' });
  } else {
    factors.push({ factor: 'normal_pattern', weight: 0.10, explanation: 'Transaction matches user spending patterns' });
  }
  return factors;
}

let txCounter = 1;
function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  const id = String(txCounter++).padStart(3, '0');
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const score = overrides.fraudScore ?? Math.floor(Math.random() * 100);
  const status = overrides.transactionStatus ?? (
    score > 85 ? 'REJECTED' : score > 70 ? 'MANUAL_REVIEW' : score > 20 ? 'PENDING' : 'APPROVED'
  );
  const decision: any = status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : status === 'MANUAL_REVIEW' ? 'MANUAL_REVIEW' : null;
  const hrs = Math.floor(Math.random() * 23);
  const mins = Math.floor(Math.random() * 60);
  const createdAt = `2026-06-15T${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:00Z`;

  return {
    id: `uuid-${id}`,
    transactionId: `TXN_${id}`,
    userId: `USER_${Math.floor(Math.random() * 9000 + 1000)}`,
    userEmail: `customer${id}@gmail.com`,
    amount: overrides.amount ?? parseFloat((Math.random() * 14000 + 50).toFixed(2)),
    currency: 'USD',
    merchantName: merchant.name,
    merchantCategory: merchant.category,
    cardType: Math.random() > 0.4 ? 'CREDIT' : 'DEBIT',
    cardLast4: String(Math.floor(Math.random() * 9000 + 1000)),
    transactionType: Math.random() > 0.3 ? 'ONLINE' : 'IN_PERSON',
    location,
    deviceType: Math.random() > 0.5 ? 'MOBILE' : 'DESKTOP',
    deviceOs: Math.random() > 0.5 ? 'iOS' : 'Android',
    fraudScore: score,
    fraudConfidence: Math.min(99, score + Math.floor(Math.random() * 8)),
    fraudPrediction: score > 50 ? 'REJECT' : 'APPROVE',
    fraudFactors: generateRiskFactors(score),
    modelVersion: 'v2.1.0',
    fraudFinalDecision: decision,
    transactionStatus: status,
    processingTimeMs: Math.floor(Math.random() * 180 + 20),
    manualReviewNotes: status === 'APPROVED' && score > 50 ? 'Verified by phone call with customer' : null,
    manualReviewReason: status === 'APPROVED' && score > 50 ? 'Customer confirmed transaction' : null,
    reviewedAt: status !== 'PENDING' && status !== 'MANUAL_REVIEW' ? createdAt : null,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  makeTransaction({ fraudScore: 92, amount: 5200, merchantName: 'Jewelry Palace', transactionStatus: 'MANUAL_REVIEW' }),
  makeTransaction({ fraudScore: 88, amount: 12500, merchantName: 'Casino Royale', transactionStatus: 'REJECTED' }),
  makeTransaction({ fraudScore: 85, amount: 3400, merchantName: 'Grand Hotel NYC', transactionStatus: 'MANUAL_REVIEW' }),
  makeTransaction({ fraudScore: 79, amount: 7800, merchantName: 'Best Buy Electronics', transactionStatus: 'MANUAL_REVIEW' }),
  makeTransaction({ fraudScore: 15, amount: 250, merchantName: 'Walmart', transactionStatus: 'APPROVED' }),
  makeTransaction({ fraudScore: 8, amount: 89, merchantName: 'Starbucks', transactionStatus: 'APPROVED' }),
  makeTransaction({ fraudScore: 95, amount: 18000, merchantName: 'Luxury Boutique', transactionStatus: 'REJECTED' }),
  makeTransaction({ fraudScore: 12, amount: 45, merchantName: 'Netflix', transactionStatus: 'APPROVED' }),
  makeTransaction({ fraudScore: 67, amount: 1200, merchantName: 'United Airlines', transactionStatus: 'MANUAL_REVIEW' }),
  makeTransaction({ fraudScore: 22, amount: 380, merchantName: 'Amazon.com', transactionStatus: 'APPROVED' }),
  makeTransaction({ fraudScore: 91, amount: 9500, merchantName: 'Jewelry Palace', transactionStatus: 'REJECTED' }),
  makeTransaction({ fraudScore: 5, amount: 60, merchantName: 'Shell Gas Station', transactionStatus: 'APPROVED' }),
  makeTransaction({ fraudScore: 74, amount: 2100, merchantName: 'Apple Store', transactionStatus: 'MANUAL_REVIEW' }),
  makeTransaction({ fraudScore: 18, amount: 199, merchantName: 'Amazon.com', transactionStatus: 'APPROVED' }),
  makeTransaction({ fraudScore: 83, amount: 6700, merchantName: 'Casino Royale', transactionStatus: 'REJECTED' }),
  makeTransaction({ fraudScore: 35, amount: 890, merchantName: 'Best Buy Electronics', transactionStatus: 'APPROVED' }),
  makeTransaction({ fraudScore: 97, amount: 25000, merchantName: 'Luxury Boutique', transactionStatus: 'REJECTED' }),
  makeTransaction({ fraudScore: 44, amount: 640, merchantName: 'United Airlines', transactionStatus: 'APPROVED' }),
  makeTransaction({ fraudScore: 88, amount: 4300, merchantName: 'Grand Hotel NYC', transactionStatus: 'MANUAL_REVIEW' }),
  makeTransaction({ fraudScore: 9, amount: 29, merchantName: 'Starbucks', transactionStatus: 'APPROVED' }),
];

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
function makeAuditLogs(tx: Transaction): AuditLog[] {
  const logs: AuditLog[] = [
    {
      id: 1, actionType: 'CREATED', actorType: 'API', actorId: 'bank_api_v1',
      actorRole: 'BANK_API', oldValue: null, newValue: 'PENDING',
      changeReason: 'Transaction received from bank API', timestamp: tx.createdAt,
    },
    {
      id: 2, actionType: 'DECISION_MADE', actorType: 'SYSTEM', actorId: `ml_model_${tx.modelVersion}`,
      actorRole: 'ML_MODEL', oldValue: 'PENDING', newValue: tx.fraudPrediction,
      changeReason: `ML Model scored ${tx.fraudScore}/100`, timestamp: new Date(new Date(tx.createdAt).getTime() + 87).toISOString(),
    },
  ];
  if (tx.transactionStatus === 'APPROVED' && tx.fraudScore > 50) {
    logs.push({
      id: 3, actionType: 'MANUAL_REVIEW', actorType: 'USER', actorId: 'analyst_001',
      actorRole: 'ANALYST_REVIEWER', oldValue: 'MANUAL_REVIEW', newValue: 'APPROVED',
      changeReason: tx.manualReviewReason ?? 'Manual override by analyst',
      timestamp: new Date(new Date(tx.createdAt).getTime() + 300000).toISOString(),
    });
  }
  return logs;
}

export function getTransactionDetail(id: string): TransactionDetail | null {
  const tx = MOCK_TRANSACTIONS.find(t => t.transactionId === id || t.id === id);
  if (!tx) return null;
  return { ...tx, auditHistory: makeAuditLogs(tx) };
}

// ─── ALERTS ───────────────────────────────────────────────────────────────────
export const MOCK_ALERTS: Alert[] = [
  {
    id: 1, alertType: 'FRAUD_DETECTED', severity: 'CRITICAL',
    title: 'High Risk Transaction Detected',
    message: 'Transaction $25,000 (TXN_017) detected as critical fraud risk (97/100) at Luxury Boutique',
    status: 'ACTIVE', transactionId: 'TXN_017',
    acknowledgedBy: null, acknowledgedAt: null, resolvedAt: null,
    createdAt: '2026-06-15T14:28:00Z',
  },
  {
    id: 2, alertType: 'PERF_DEGRADED', severity: 'HIGH',
    title: 'P95 Latency Spike Detected',
    message: 'P95 transaction processing latency exceeded 250ms threshold. Current: 287ms',
    status: 'ACTIVE', transactionId: null,
    acknowledgedBy: null, acknowledgedAt: null, resolvedAt: null,
    createdAt: '2026-06-15T14:25:00Z',
  },
  {
    id: 3, alertType: 'INFRA_ALERT', severity: 'MEDIUM',
    title: 'Kafka Consumer Lag High',
    message: 'Kafka topic "transactions" consumer lag exceeded 500ms. Current lag: 620ms',
    status: 'ACTIVE', transactionId: null,
    acknowledgedBy: null, acknowledgedAt: null, resolvedAt: null,
    createdAt: '2026-06-15T14:20:00Z',
  },
  {
    id: 4, alertType: 'FRAUD_DETECTED', severity: 'CRITICAL',
    title: 'High Risk Transaction Detected',
    message: 'Transaction $18,000 (TXN_007) detected as high fraud risk (95/100) at Luxury Boutique',
    status: 'ACKNOWLEDGED', transactionId: 'TXN_007',
    acknowledgedBy: 'john@bank.com', acknowledgedAt: '2026-06-15T13:45:00Z', resolvedAt: null,
    createdAt: '2026-06-15T13:30:00Z',
  },
  {
    id: 5, alertType: 'SECURITY_ALERT', severity: 'HIGH',
    title: 'Multiple Failed Login Attempts',
    message: '5 failed login attempts for user bob@bank.com from IP 203.45.67.89',
    status: 'ACKNOWLEDGED', transactionId: null,
    acknowledgedBy: 'jane@bank.com', acknowledgedAt: '2026-06-15T12:00:00Z', resolvedAt: null,
    createdAt: '2026-06-15T11:55:00Z',
  },
  {
    id: 6, alertType: 'SERVICE_DOWN', severity: 'CRITICAL',
    title: 'Fraud Detection Service Down',
    message: 'Python FastAPI fraud detection service is unreachable. Fallback rules activated.',
    status: 'RESOLVED', transactionId: null,
    acknowledgedBy: 'mike@bank.com', acknowledgedAt: '2026-06-15T10:05:00Z',
    resolvedAt: '2026-06-15T10:22:00Z',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 7, alertType: 'INFRA_ALERT', severity: 'LOW',
    title: 'Redis Cache Hit Rate Low',
    message: 'Redis cache hit rate dropped to 72% (threshold: 80%)',
    status: 'RESOLVED', transactionId: null,
    acknowledgedBy: 'mike@bank.com', acknowledgedAt: '2026-06-15T09:00:00Z',
    resolvedAt: '2026-06-15T09:30:00Z',
    createdAt: '2026-06-15T08:50:00Z',
  },
];

// ─── DASHBOARD METRICS ────────────────────────────────────────────────────────
export const MOCK_METRICS: DashboardMetrics = {
  totalTransactions: 5420,
  totalTransactionsChange: 12.3,
  fraudRate: 2.34,
  fraudRateChange: -0.5,
  p95LatencyMs: 187,
  latencyStatus: 'GOOD',
  falsePositiveRate: 0.82,
  falsePositiveChange: -0.1,
  activeAlerts: 3,
  pendingReviews: 5,
};

// ─── CHART DATA (24 hours) ────────────────────────────────────────────────────
export const MOCK_CHART_DATA: ChartDataPoint[] = Array.from({ length: 24 }, (_, i) => {
  const base = 180 + Math.floor(Math.random() * 80);
  const fraudDetected = Math.floor(base * (0.02 + Math.random() * 0.015));
  return {
    label: `${String(i).padStart(2, '0')}:00`,
    transactions: base,
    fraudDetected,
    fraudRate: parseFloat(((fraudDetected / base) * 100).toFixed(2)),
  };
});

// ─── SYSTEM SETTINGS ─────────────────────────────────────────────────────────
export const MOCK_SETTINGS: SystemSettings = {
  autoApprovalThreshold: 20,
  manualReviewThreshold: 70,
  autoRejectionThreshold: 85,
  maxTransactionsPerMinute: 10000,
  maxTransactionsPerUserHour: 1000,
  transactionTimeoutMs: 200,
  kafkaConsumerThreads: 3,
  redisCacheTtlHours: 1,
  alertSeverityThreshold: 'HIGH',
  emailNotificationsEnabled: true,
  slackNotificationsEnabled: true,
};

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
export function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score < 40) return 'LOW';
  if (score < 70) return 'MEDIUM';
  return 'HIGH';
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
