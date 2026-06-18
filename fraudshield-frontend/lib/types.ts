// Types for the entire FraudShield application

export type UserRole = 'SYSTEM_ADMIN' | 'ANALYST_REVIEWER' | 'ANALYST_VIEWER' | 'DATA_SCIENTIST' | 'OPERATOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string;
}

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'CANCELLED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type FraudDecision = 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';

export interface RiskFactor {
  factor: string;
  weight: number;
  explanation: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategory: string;
  cardType: string;
  cardLast4: string;
  transactionType: string;
  location: {
    city: string;
    country: string;
    ipAddress: string;
  };
  deviceType: string;
  deviceOs: string;
  fraudScore: number;
  fraudConfidence: number;
  fraudPrediction: string;
  fraudFactors: RiskFactor[];
  modelVersion: string;
  fraudFinalDecision: FraudDecision | null;
  transactionStatus: TransactionStatus;
  processingTimeMs: number;
  manualReviewNotes: string | null;
  manualReviewReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  actionType: string;
  actorType: string;
  actorId: string;
  actorRole: string;
  oldValue: string | null;
  newValue: string | null;
  changeReason: string | null;
  timestamp: string;
}

export interface TransactionDetail extends Transaction {
  auditHistory: AuditLog[];
}

export type AlertType = 'FRAUD_DETECTED' | 'PERF_DEGRADED' | 'SERVICE_DOWN' | 'INFRA_ALERT' | 'SECURITY_ALERT' | 'THRESHOLD_EXCEEDED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';

export interface Alert {
  id: number;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: AlertStatus;
  transactionId: string | null;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalTransactions: number;
  totalTransactionsChange: number;
  fraudRate: number;
  fraudRateChange: number;
  p95LatencyMs: number;
  latencyStatus: 'GOOD' | 'WARNING' | 'CRITICAL';
  falsePositiveRate: number;
  falsePositiveChange: number;
  activeAlerts: number;
  pendingReviews: number;
}

export interface ChartDataPoint {
  label: string;
  transactions: number;
  fraudDetected: number;
  fraudRate: number;
}

export interface SystemSettings {
  autoApprovalThreshold: number;
  manualReviewThreshold: number;
  autoRejectionThreshold: number;
  maxTransactionsPerMinute: number;
  maxTransactionsPerUserHour: number;
  transactionTimeoutMs: number;
  kafkaConsumerThreads: number;
  redisCacheTtlHours: number;
  alertSeverityThreshold: string;
  emailNotificationsEnabled: boolean;
  slackNotificationsEnabled: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ManualReviewRequest {
  decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  reason: string;
  notes?: string;
  contactCustomer: boolean;
  flagForInvestigation: boolean;
}

export interface TransactionFilters {
  status?: TransactionStatus | 'ALL';
  riskLevel?: RiskLevel | 'ALL';
  dateRange?: '24h' | '7d' | '30d' | 'custom';
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface ReportSummary {
  totalTransactions: number;
  approvedTransactions: number;
  rejectedTransactions: number;
  pendingReviews: number;
  highRiskTransactions: number;
  fraudRate: number;
  avgProcessingTimeMs: number;
  activeAlerts: number;
  reportPeriod: string;
  generatedAt: string;
}
