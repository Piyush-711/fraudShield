# Backend Schema Document
## AI-Powered Real-Time Fraud Detection System

---

## 1. Database Design Overview

### Database: PostgreSQL 15
- **Encoding:** UTF8
- **Locale:** C (for performance)
- **Connection Pool:** 20 max connections
- **Backup:** Daily automated backups, 30-day retention

### Schema Layers

```
Public Schema (Main Application)
├── transactions (Core domain)
├── users (Identity)
├── fraud_rules (Business logic)
├── system_config (Settings)
└── audit_logs (Compliance)
```

---

## 2. Core Tables

### TABLE: `users`

**Purpose:** User accounts and profiles

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  external_user_id VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
    CHECK (role IN ('ANALYST_VIEWER', 'ANALYST_REVIEWER', 'SYSTEM_ADMIN', 'DATA_SCIENTIST', 'OPERATOR')),
  
  -- Security
  password_hash VARCHAR(255) NOT NULL,
  password_changed_at TIMESTAMP,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT FALSE,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  
  -- Metadata
  last_login_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by BIGINT REFERENCES users(id),
  updated_by BIGINT REFERENCES users(id),
  
  -- Audit
  deactivated_at TIMESTAMP,
  deactivation_reason TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_external_user_id ON users(external_user_id);
CREATE INDEX idx_users_role ON users(role, is_active);
CREATE INDEX idx_users_last_activity ON users(last_activity_at DESC);
```

### TABLE: `user_profiles`

**Purpose:** User risk profiles and statistics

```sql
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  external_user_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Risk Scoring
  current_risk_score DECIMAL(5,2) DEFAULT 0.00,
  average_transaction_amount DECIMAL(15,2) DEFAULT 0.00,
  std_dev_transaction_amount DECIMAL(15,2) DEFAULT 0.00,
  
  -- Statistics
  total_transactions INT DEFAULT 0,
  total_fraud_detected INT DEFAULT 0,
  fraud_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Time-based Patterns
  most_active_hour INT,
  most_active_day_of_week INT,
  last_transaction_at TIMESTAMP,
  
  -- Geographic
  usual_countries TEXT[], -- Array of country codes
  usual_cities TEXT[], -- Array of city names
  
  -- Device Tracking
  registered_devices TEXT[], -- Array of device IDs
  
  -- Account Status
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason VARCHAR(255),
  blocked_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_external_id ON user_profiles(external_user_id);
CREATE INDEX idx_user_profiles_risk_score ON user_profiles(current_risk_score DESC);
```

### TABLE: `transactions`

**Purpose:** All fraud-detected transactions (core domain)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction Identifiers
  transaction_id VARCHAR(100) NOT NULL UNIQUE, -- From bank system
  external_reference_id VARCHAR(100),
  
  -- User Information
  user_id BIGINT NOT NULL, -- External user ID (not FK, for isolation)
  user_email VARCHAR(255),
  
  -- Transaction Details
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  timestamp TIMESTAMP NOT NULL,
  
  -- Merchant Information
  merchant_id VARCHAR(100),
  merchant_name VARCHAR(255),
  merchant_category VARCHAR(50),
  
  -- Card Information
  card_id VARCHAR(50), -- Tokenized card ID
  card_type VARCHAR(20), -- CREDIT, DEBIT, PREPAID
  card_issuer VARCHAR(50),
  card_last_4_digits VARCHAR(4),
  
  -- Transaction Type
  transaction_type VARCHAR(50),
    CHECK (transaction_type IN ('ONLINE', 'IN_PERSON', 'ATM', 'RECURRING')),
  is_card_present BOOLEAN,
  
  -- Location & Device
  user_location_lat DECIMAL(10,8),
  user_location_lon DECIMAL(11,8),
  user_location_country VARCHAR(2),
  user_location_city VARCHAR(100),
  
  device_id VARCHAR(100),
  device_type VARCHAR(50),
  device_os VARCHAR(50),
  ip_address INET,
  
  -- Transaction Status
  transaction_status VARCHAR(20) DEFAULT 'PENDING',
    CHECK (transaction_status IN ('PENDING', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW', 'CANCELLED')),
  
  -- ML Model Fraud Detection
  fraud_model_id VARCHAR(100),
  fraud_model_version VARCHAR(20),
  fraud_score DECIMAL(5,2), -- 0-100
  fraud_confidence DECIMAL(5,2), -- 0-100
  fraud_prediction VARCHAR(20),
    CHECK (fraud_prediction IN ('APPROVE', 'REJECT', 'MANUAL_REVIEW')),
  fraud_factors JSONB, -- {factor: weight, explanation}
  
  -- Final Fraud Decision
  fraud_final_decision VARCHAR(20),
    CHECK (fraud_final_decision IN ('APPROVED', 'REJECTED', 'MANUAL_REVIEW')),
  fraud_decision_reason VARCHAR(255),
  decision_made_by VARCHAR(100), -- 'ML_MODEL', user_id, or 'SYSTEM'
  
  -- Processing
  processing_time_ms INT, -- Latency
  processed_at TIMESTAMP,
  
  -- Manual Review (if applicable)
  manual_reviewer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  manual_review_notes TEXT,
  manual_review_reason VARCHAR(255),
  reviewed_at TIMESTAMP,
  
  -- Additional Flags
  is_suspicious BOOLEAN DEFAULT FALSE,
  requires_investigation BOOLEAN DEFAULT FALSE,
  
  -- Audit & Compliance
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by VARCHAR(50) DEFAULT 'API',
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_fraud_score ON transactions(fraud_score DESC);
CREATE INDEX idx_transactions_fraud_decision ON transactions(fraud_final_decision);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_transactions_user_status ON transactions(user_id, transaction_status);
CREATE INDEX idx_transactions_timestamp_status ON transactions(timestamp DESC, transaction_status);
CREATE INDEX idx_transactions_manual_review ON transactions(
  fraud_final_decision,
  transaction_status
) WHERE transaction_status = 'MANUAL_REVIEW';
```

### TABLE: `transaction_audit_log`

**Purpose:** Complete audit trail of transaction changes

```sql
CREATE TABLE transaction_audit_log (
  id BIGSERIAL PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Action Details
  action_type VARCHAR(50) NOT NULL,
    CHECK (action_type IN ('CREATED', 'DECISION_MADE', 'MANUAL_REVIEW', 'UPDATED', 'ESCALATED', 'RESOLVED')),
  
  -- Who Made Change
  actor_type VARCHAR(20), -- 'SYSTEM', 'USER', 'API'
  actor_id VARCHAR(100),
  actor_role VARCHAR(50),
  
  -- What Changed
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  
  -- Metadata
  change_reason VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  ip_address INET
);

CREATE INDEX idx_audit_transaction_id ON transaction_audit_log(transaction_id);
CREATE INDEX idx_audit_timestamp ON transaction_audit_log(timestamp DESC);
CREATE INDEX idx_audit_action_type ON transaction_audit_log(action_type);
```

### TABLE: `fraud_detection_rules`

**Purpose:** Configurable fraud detection rules (business rules engine)

```sql
CREATE TABLE fraud_detection_rules (
  id BIGSERIAL PRIMARY KEY,
  
  -- Rule Definition
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL,
    CHECK (rule_type IN ('THRESHOLD', 'VELOCITY', 'PATTERN', 'GEOLOCATION', 'DEVICE')),
  
  -- Rule Logic (stored as JSON for flexibility)
  -- Example:
  -- {
  --   "field": "amount",
  --   "operator": "greater_than",
  --   "value": 5000,
  --   "action": "flag_for_review"
  -- }
  rule_condition JSONB NOT NULL,
  rule_action VARCHAR(50), -- 'AUTO_APPROVE', 'AUTO_REJECT', 'FLAG_FOR_REVIEW'
  
  -- Rule Priority & Status
  priority INT DEFAULT 100, -- Higher = executed first
  enabled BOOLEAN DEFAULT TRUE,
  is_system_rule BOOLEAN DEFAULT FALSE, -- Cannot be deleted
  
  -- Thresholds
  risk_score_impact DECIMAL(5,2) DEFAULT 0.00, -- Impact on fraud score
  confidence_weight DECIMAL(5,2) DEFAULT 1.00,
  
  -- Performance
  execution_order INT,
  execution_timeout_ms INT DEFAULT 100,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by BIGINT REFERENCES users(id),
  updated_by BIGINT REFERENCES users(id),
  last_triggered_at TIMESTAMP,
  times_triggered INT DEFAULT 0
);

CREATE INDEX idx_rules_enabled ON fraud_detection_rules(enabled, priority);
CREATE INDEX idx_rules_type ON fraud_detection_rules(rule_type, enabled);
```

### TABLE: `system_alerts`

**Purpose:** System-level alerts and notifications

```sql
CREATE TABLE system_alerts (
  id BIGSERIAL PRIMARY KEY,
  
  -- Alert Details
  alert_type VARCHAR(100) NOT NULL,
    CHECK (alert_type IN (
      'FRAUD_DETECTED',
      'PERF_DEGRADED',
      'SERVICE_DOWN',
      'INFRA_ALERT',
      'SECURITY_ALERT',
      'THRESHOLD_EXCEEDED'
    )),
  severity VARCHAR(20) NOT NULL,
    CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  
  -- Message & Context
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  context_data JSONB, -- Additional JSON data
  
  -- Related Objects
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE',
    CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED')),
  
  -- Response Tracking
  acknowledged_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP,
  acknowledged_comment TEXT,
  
  resolved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  
  escalated_to_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  escalated_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP
);

CREATE INDEX idx_alerts_status ON system_alerts(status, severity);
CREATE INDEX idx_alerts_created_at ON system_alerts(created_at DESC);
CREATE INDEX idx_alerts_unacknowledged ON system_alerts(status) 
  WHERE status IN ('ACTIVE', 'ESCALATED');
```

### TABLE: `system_config`

**Purpose:** System-wide configuration and thresholds

```sql
CREATE TABLE system_config (
  id BIGSERIAL PRIMARY KEY,
  
  -- Fraud Detection Thresholds
  auto_approval_threshold DECIMAL(5,2) DEFAULT 20.00,
  manual_review_threshold DECIMAL(5,2) DEFAULT 70.00,
  auto_rejection_threshold DECIMAL(5,2) DEFAULT 85.00,
  
  -- Rate Limiting
  max_transactions_per_minute INT DEFAULT 10000,
  max_transactions_per_user_hour INT DEFAULT 1000,
  
  -- Processing
  transaction_timeout_ms INT DEFAULT 200,
  kafka_consumer_threads INT DEFAULT 3,
  redis_cache_ttl_hours INT DEFAULT 1,
  
  -- Alerting
  alert_severity_threshold VARCHAR(20) DEFAULT 'MEDIUM',
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  slack_notifications_enabled BOOLEAN DEFAULT TRUE,
  
  -- Performance Thresholds
  max_latency_p95_ms INT DEFAULT 500,
  max_latency_p99_ms INT DEFAULT 1000,
  
  -- Feature Flags
  features JSONB DEFAULT '{}', -- {enable_advanced_rules: true, enable_dark_mode: false}
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by BIGINT REFERENCES users(id),
  change_notes TEXT
);

-- Usually single row
CREATE UNIQUE INDEX idx_system_config_singleton ON system_config((true));
```

### TABLE: `model_versions`

**Purpose:** Track ML model versions for A/B testing and rollback

```sql
CREATE TABLE model_versions (
  id BIGSERIAL PRIMARY KEY,
  
  -- Model Info
  model_version VARCHAR(50) NOT NULL UNIQUE,
  model_md5_hash VARCHAR(32),
  model_file_path VARCHAR(500),
  model_description TEXT,
  
  -- Performance Metrics
  accuracy_rate DECIMAL(5,2),
  precision_rate DECIMAL(5,2),
  recall_rate DECIMAL(5,2),
  f1_score DECIMAL(5,2),
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  is_canary BOOLEAN DEFAULT FALSE, -- For canary deployments
  canary_percentage INT DEFAULT 0, -- % of traffic
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  deactivated_at TIMESTAMP,
  created_by BIGINT REFERENCES users(id),
  
  features JSONB -- {feature1: importance, feature2: importance}
);

CREATE INDEX idx_model_versions_active ON model_versions(is_active);
```

### TABLE: `notifications`

**Purpose:** Track notification history

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  
  -- Notification Details
  notification_type VARCHAR(100),
  recipient_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255),
  
  -- Content
  subject VARCHAR(255),
  message TEXT,
  related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  
  -- Channel
  channel VARCHAR(50), -- EMAIL, SLACK, IN_APP
  
  -- Status
  status VARCHAR(20), -- QUEUED, SENT, FAILED, BOUNCED
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  
  -- Error Handling
  retry_count INT DEFAULT 0,
  last_error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_status ON notifications(recipient_id, status);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);
```

---

## 3. Redis Cache Schema

### Cache Keys Design

```
# User Risk Profiles (TTL: 1 hour)
user:{userId}:risk_profile
  Value: JSON
  {
    "risk_score": 45.5,
    "transaction_count_24h": 12,
    "last_updated": "2026-06-15T14:30:00Z"
  }

# Recent Transaction Cache (TTL: 24 hours)
user:{userId}:recent_transactions
  Value: JSON Array
  [
    {"id": "txn_001", "amount": 150, "merchant": "Amazon"},
    {"id": "txn_002", "amount": 75, "merchant": "Starbucks"}
  ]

# Transaction Details (TTL: 5 minutes)
transaction:{transactionId}
  Value: JSON
  {
    "id": "txn_001",
    "amount": 150.00,
    "merchant": "Amazon",
    "status": "APPROVED"
  }

# Rate Limiting (TTL: 1 minute)
ratelimit:user:{userId}:count
  Value: Integer counter
  5  (current number of transactions)

# Rate Limiting per Minute
ratelimit:global:count:minute_{YYYYMMDDHHMM}
  Value: Integer counter
  4523 (global transactions in this minute)

# Feature Cache (TTL: 1 hour)
features:user:{userId}:date_{YYYYMMDD}
  Value: JSON
  {
    "user_avg_transaction_amount": 850.00,
    "transaction_count_last_24h": 12,
    "velocity_score": 0.75,
    "is_weekend": false
  }

# Session Cache (TTL: 24 hours)
session:{sessionId}
  Value: JSON
  {
    "user_id": 123,
    "email": "analyst@bank.com",
    "role": "ANALYST_REVIEWER",
    "permissions": ["transaction:view", "transaction:review"]
  }

# Model Version (TTL: Never, manual update)
model:version:active
  Value: String
  "v2.1.0"

model:version:v2.1.0:config
  Value: JSON
  {
    "md5": "abc123def456",
    "loaded_at": "2026-06-15T10:00:00Z"
  }

# Alert Cache (TTL: 24 hours)
alert:active:set
  Value: Redis Set
  {alert_1, alert_2, alert_3}

# Fraud Rule Cache (TTL: 4 hours)
rule:{ruleId}:config
  Value: JSON
  {
    "name": "High Amount Rule",
    "condition": {...},
    "priority": 1
  }

# Temporary Locks (TTL: varies)
lock:fraud_model:update
  Value: String (any value)
  (Use for distributed locking)
```

### Cache Invalidation Strategy

| Data | TTL | Invalidation Trigger |
|------|-----|----------------------|
| User Risk Profile | 1 hour | Manual profile update |
| Recent Transactions | 24 hours | New transaction added |
| Transaction Details | 5 minutes | Status change |
| Rate Limit | 1 minute | Automatic expiry |
| Feature Cache | 1 hour | Automatic expiry |
| Session | 24 hours | Logout or timeout |
| Model Version | Never | Manual deployment |
| Alert Status | 24 hours | Alert status change |

---

## 4. Kafka Schema (Message Format)

### Topic: `transactions`

**Purpose:** Input transaction stream

```json
{
  "schema_version": "1.0",
  "transaction_id": "txn_001",
  "timestamp": "2026-06-15T14:30:45.123Z",
  "user_id": "user_12345",
  "user_email": "customer@gmail.com",
  "amount": 5200.00,
  "currency": "USD",
  "merchant_id": "merchant_789",
  "merchant_name": "Amazon.com",
  "merchant_category": "SHOPPING",
  "card": {
    "type": "CREDIT",
    "issuer": "Visa",
    "last_4": "1234",
    "id": "card_masked_001"
  },
  "transaction_type": "ONLINE",
  "is_card_present": false,
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "country": "US",
    "city": "San Francisco",
    "ip_address": "192.168.1.1"
  },
  "device": {
    "id": "device_xyz789",
    "type": "MOBILE",
    "os": "iOS",
    "browser": "Safari"
  }
}
```

### Topic: `fraud-results`

**Purpose:** ML model fraud detection output

```json
{
  "transaction_id": "txn_001",
  "timestamp": "2026-06-15T14:30:45.500Z",
  "model_version": "v2.1.0",
  "risk_score": 92.5,
  "confidence": 94.2,
  "prediction": "REJECT",
  "processing_time_ms": 87,
  "risk_factors": [
    {
      "factor": "high_amount",
      "weight": 0.35,
      "explanation": "Transaction amount 8x higher than average"
    },
    {
      "factor": "unusual_merchant",
      "weight": 0.28,
      "explanation": "First time purchasing from this merchant"
    }
  ]
}
```

### Topic: `fraud-alerts`

**Purpose:** Alert notifications

```json
{
  "alert_id": "alert_001",
  "transaction_id": "txn_001",
  "alert_type": "FRAUD_DETECTED",
  "severity": "CRITICAL",
  "title": "High Risk Transaction Detected",
  "message": "Transaction $5,200 detected as high fraud risk (92/100)",
  "timestamp": "2026-06-15T14:30:46.000Z",
  "context": {
    "user_id": "user_12345",
    "merchant": "Amazon",
    "amount": 5200.00
  }
}
```

### Topic: `audit-events`

**Purpose:** Audit trail for compliance

```json
{
  "event_id": "event_001",
  "timestamp": "2026-06-15T14:30:46.000Z",
  "event_type": "TRANSACTION_DECISION",
  "actor": {
    "type": "ML_MODEL",
    "id": "fraud_detection_v2.1.0"
  },
  "transaction_id": "txn_001",
  "action": "FRAUD_DECISION_MADE",
  "details": {
    "decision": "REJECT",
    "reason": "High fraud score (92.5)"
  },
  "ip_address": "192.168.1.100"
}
```

### Topic: `dead-letter-topic`

**Purpose:** Failed message handling

```json
{
  "original_message": {...},
  "error": "Invalid JSON payload",
  "error_timestamp": "2026-06-15T14:30:47.000Z",
  "source_topic": "transactions",
  "retry_count": 3,
  "first_error_at": "2026-06-15T14:30:45.000Z"
}
```

---

## 5. Relationships & Foreign Keys

```
users (1) ──── (N) transactions
  user.id ──→ transaction.manual_reviewer_id

users (1) ──── (N) transaction_audit_log
  user.id ──→ audit_log.actor_id

users (1) ──── (N) system_alerts
  user.id ──→ alert.acknowledged_by

users (1) ──── (1) user_profiles
  user.external_user_id ──→ user_profile.external_user_id

transactions (1) ──── (N) transaction_audit_log
  transaction.id ──→ audit_log.transaction_id

fraud_detection_rules (N) ──── (N) transactions
  (implicit, rules applied via conditions)

system_config (1)
  (singleton table)
```

---

## 6. Data Ownership & Permissions

### User Access Control

```
Table: transactions
├── ANALYST_VIEWER: SELECT all
├── ANALYST_REVIEWER: SELECT all + UPDATE fraud_final_decision
├── SYSTEM_ADMIN: SELECT, INSERT, UPDATE, DELETE all
└── DATA_SCIENTIST: SELECT all + UPDATE fraud_model_id

Table: users
├── SYSTEM_ADMIN: All operations
└── Others: SELECT own user record only

Table: fraud_detection_rules
├── SYSTEM_ADMIN: All operations
├── DATA_SCIENTIST: SELECT, INSERT, UPDATE (non-system rules)
└── Others: SELECT only
```

### Row-Level Security (RLS)

```sql
-- For transactions table
CREATE POLICY transaction_viewer_policy
  ON transactions
  FOR SELECT
  TO analyst_role
  USING (true);

-- For user personal data
CREATE POLICY users_personal_policy
  ON users
  FOR SELECT
  TO user_role
  USING (id = current_user_id());
```

---

## 7. Data Lifecycle & Retention

### Retention Policy

| Table | Retention | Reason |
|-------|-----------|--------|
| `transactions` | 2 years | Regulatory requirement |
| `transaction_audit_log` | 7 years | Audit trail |
| `system_alerts` | 1 year | Operational reference |
| `notifications` | 90 days | Reference only |
| `transaction_audit_log` (backup) | 10 years (S3) | Compliance archive |

### Archiving Strategy

```sql
-- Move old transactions to archive table monthly
CREATE TABLE transactions_archive (
  LIKE transactions INCLUDING ALL
);

-- Partition by year
CREATE TABLE transactions_2024 PARTITION OF transactions
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Move to S3 after 6 months
SELECT * FROM transactions WHERE created_at < NOW() - INTERVAL '6 months'
  → Export to S3 → Delete from DB
```

---

## 8. Indexing Strategy

### Index Types & Rationale

| Index | Type | Rationale |
|-------|------|-----------|
| `transactions(user_id)` | B-tree | Query by user |
| `transactions(timestamp DESC)` | B-tree DESC | Recent transactions |
| `transactions(fraud_score DESC)` | B-tree DESC | High-risk sorting |
| `transactions(user_id, transaction_status)` | Composite | User + status queries |
| `fraud_detection_rules(enabled, priority)` | Composite | Active rules lookup |
| `system_alerts(status, severity)` | Composite | Alert filtering |

### Partial Indexes

```sql
-- Only active manual reviews
CREATE INDEX idx_pending_reviews 
  ON transactions(fraud_final_decision)
  WHERE transaction_status = 'MANUAL_REVIEW'
    AND fraud_final_decision IS NULL;

-- Only active rules
CREATE INDEX idx_active_rules 
  ON fraud_detection_rules(priority)
  WHERE enabled = TRUE;
```

### Index Maintenance

```
Analyze: ANALYZE transactions; (weekly)
Reindex: REINDEX transactions; (monthly)
Vacuum: VACUUM transactions; (daily during off-hours)
```

---

## 9. Database Constraints & Validations

### CHECK Constraints

```sql
-- Data Quality
ALTER TABLE transactions
  ADD CONSTRAINT check_amount_positive CHECK (amount > 0);

ALTER TABLE transactions
  ADD CONSTRAINT check_risk_score_range CHECK (fraud_score BETWEEN 0 AND 100);

ALTER TABLE fraud_detection_rules
  ADD CONSTRAINT check_priority_positive CHECK (priority > 0);

-- Logical Constraints
ALTER TABLE transactions
  ADD CONSTRAINT check_decision_filled 
    CHECK (fraud_final_decision IS NOT NULL);
```

### NOT NULL Constraints

| Column | Table | Reason |
|--------|-------|--------|
| `transaction_id` | transactions | Unique identifier |
| `user_id` | transactions | Required for audit |
| `amount` | transactions | Core transaction data |
| `fraud_final_decision` | transactions | Decision must be recorded |
| `role` | users | Authorization required |

### UNIQUE Constraints

```sql
-- No duplicate transactions
ALTER TABLE transactions
  ADD CONSTRAINT unique_transaction_id UNIQUE (transaction_id);

-- One profile per user
ALTER TABLE user_profiles
  ADD CONSTRAINT unique_user_profile UNIQUE (external_user_id);
```

---

## 10. Sample Data & Test Fixtures

### Sample User

```sql
INSERT INTO users (
  external_user_id, email, name, role, password_hash, is_active
) VALUES (
  'analyst_456',
  'john@fraudshield.com',
  'John Analyst',
  'ANALYST_REVIEWER',
  '$2b$10$N9qo8uLOickgx2ZMRZoMye', -- bcrypt hash
  TRUE
);
```

### Sample Transaction

```sql
INSERT INTO transactions (
  transaction_id, user_id, amount, merchant_name, 
  fraud_score, fraud_prediction, fraud_final_decision, processed_at
) VALUES (
  'txn_001',
  'user_12345',
  5200.00,
  'Amazon.com',
  92.5,
  'REJECT',
  'REJECTED',
  NOW()
);
```

---

## 11. Database Security

### Authentication & Encryption

```sql
-- Enable SSL/TLS
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

-- Connection encryption
sslmode = require

-- Password encryption (bcrypt, not stored in DB)
password_encryption = scram-sha-256
```

### User Roles & Permissions

```sql
-- Create roles
CREATE ROLE analyst_role;
CREATE ROLE admin_role;
CREATE ROLE app_user;

-- Grant minimal privileges (least privilege principle)
GRANT SELECT ON transactions TO analyst_role;
GRANT SELECT, UPDATE ON transactions TO admin_role;

-- Revoke public access
REVOKE ALL ON transactions FROM PUBLIC;
```

---

## 12. Monitoring & Performance

### Query Performance Monitoring

```sql
-- Enable query logging
log_statement = 'mod'
log_min_duration_statement = 1000 -- Log queries > 1 second

-- Check slow queries
SELECT query, calls, mean_time 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;

-- Check missing indexes
SELECT schemaname, tablename 
  FROM pg_stat_user_tables 
  WHERE n_tup_ins + n_tup_upd + n_tup_del > 0
  ORDER BY n_live_tup DESC;
```

### Connection Pool Monitoring

```
Active Connections: SELECT count(*) FROM pg_stat_activity;
Idle Connections: SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';
```

---

## 13. Backup & Recovery Strategy

### Backup Plan

```
Backup Type: PostgreSQL custom format (pg_dump)
Frequency: Daily at 2 AM UTC
Retention: 30 days local, 1 year in S3
Location: Primary DB server + S3 bucket

Command:
  pg_dump --format=custom --file=/backups/fraudshield_$(date +%Y%m%d).dump

Restore:
  pg_restore --dbname=fraudshield --file=/backups/fraudshield_20260615.dump
```

### Point-in-Time Recovery (PITR)

```
WAL Archival: Enabled (ARCHIVE_COMMAND to S3)
Archive Retention: 30 days
Recovery Window: Recover to any point in last 30 days
```

---

## 14. Migration Strategy (New Features)

### Zero-Downtime Migrations

```sql
-- Step 1: Add new column (backwards compatible)
ALTER TABLE transactions 
  ADD COLUMN new_field VARCHAR(100);

-- Step 2: Backfill data
UPDATE transactions 
  SET new_field = computed_value();

-- Step 3: Add constraint
ALTER TABLE transactions 
  ALTER COLUMN new_field SET NOT NULL;

-- Step 4: Update application code to use new column

-- Step 5: Drop old column (after verification)
ALTER TABLE transactions 
  DROP COLUMN old_column;
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-15  
**Owner:** Senior Backend Engineer  
**Status:** Approved for Development

**Migration Scripts Location:** `/db/migrations/`  
**Backup Scripts Location:** `/scripts/backup/`  
**Seed Data Location:** `/db/seeds/`
