# Technical Requirements Document (TRD)
## AI-Powered Real-Time Fraud Detection System

---

## 1. System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
│  ┌──────────────────┐         ┌────────────────────────────┐  │
│  │  Risk Dashboard  │         │  Manual Review UI          │  │
│  │  (React/Next.js) │         │  (Built-in Dashboard)      │  │
│  └────────┬─────────┘         └────────────┬───────────────┘  │
│           │                               │                    │
└───────────┼───────────────────────────────┼────────────────────┘
            │                               │
            │              REST API         │
            │                               │
┌───────────▼───────────────────────────────▼────────────────────┐
│                      API GATEWAY LAYER                         │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  NGINX (Reverse Proxy, Load Balancer, SSL/TLS)        │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────┬─────────────────────────────────────────────────────┘
            │
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                    BACKEND SERVICES LAYER                       │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │ Transaction Service      │  │ Fraud Detection Service  │    │
│  │ (Spring Boot / Java)     │  │ (Python FastAPI)         │    │
│  │ - REST endpoints         │  │ - ML inference           │    │
│  │ - Input validation       │  │ - Feature extraction     │    │
│  │ - Rate limiting          │  │ - Risk scoring           │    │
│  │ - Idempotency checks     │  │ - Confidence scoring     │    │
│  └──────────┬───────────────┘  └──────────┬───────────────┘    │
│             │                             │                     │
│  ┌──────────▼──────────────┐  ┌──────────▼───────────────┐    │
│  │ Notification Service    │  │ Decision Service         │    │
│  │ (Spring Boot / Java)    │  │ (Spring Boot / Java)     │    │
│  │ - Email sending         │  │ - Rule evaluation        │    │
│  │ - Slack integration     │  │ - Final decision         │    │
│  │ - Alert management      │  │ - Logging                │    │
│  └────────────────────────┘  └─────────────────────────┘    │
│                                                                  │
└───────────┬──────────────────┬────────────────┬──────────────────┘
            │                  │                │
            │   Kafka Topics   │                │
            │   Message Bus    │                │
            │                  │                │
┌───────────▼──────────────────▼────────────────▼──────────────────┐
│                    DATA & CACHE LAYER                            │
│                                                                   │
│  ┌────────────────────────┐  ┌────────────────────────────────┐ │
│  │ PostgreSQL Database    │  │ Redis Cache Cluster            │ │
│  │ - Transactions         │  │ - User risk scores             │ │
│  │ - Audit logs           │  │ - Recent transactions          │ │
│  │ - User profiles        │  │ - Session cache                │ │
│  │ - Rules & thresholds   │  │ - Rate limit counters          │ │
│  │ - Decisions history    │  │ - Feature cache                │ │
│  └────────────────────────┘  └────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Amazon S3 - Audit Logs & Backups                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Technology Stack Rationale

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | React + Next.js | SSR for SEO, TypeScript for type safety, fast development |
| **Backend (Transactions)** | Spring Boot (Java 21) | Fast, reliable, battle-tested, great for microservices |
| **Backend (Fraud ML)** | Python + FastAPI | ML libraries (scikit-learn, TensorFlow), fast async framework |
| **Message Bus** | Apache Kafka | Handles high throughput, persistent logs, replay capability |
| **Cache** | Redis Cluster | Sub-millisecond lookups, atomic operations, high availability |
| **Database** | PostgreSQL 15 | ACID transactions, JSON support, mature ecosystem |
| **Reverse Proxy** | NGINX | Battle-tested, high performance, SSL termination |
| **Container** | Docker | Consistent environments, easy deployment |
| **Orchestration** | Docker Compose (MVP) | Simple for MVP, can migrate to Kubernetes later |
| **Cloud Provider** | AWS | Market-leading, reliable, good cost-to-performance |

---

## 2. Frontend Stack

### Technology Choices

#### Framework & Library
- **React 18** - Component-based UI
- **Next.js 14** - Server-side rendering, file-based routing
- **TypeScript** - Type safety, better IDE support
- **Tailwind CSS** - Utility-first styling, rapid development
- **Shadcn/ui** - Pre-built accessible components

#### State Management
- **TanStack Query (React Query)** - Server state management, caching
- **Zustand** - Light-weight client state for UI state
- **Recoil** - For complex shared state (if needed in Phase 2)

#### Data Visualization
- **Chart.js + react-chartjs-2** - Real-time charts for dashboards
- **Apache ECharts** - Complex dashboards (consider for Phase 2)
- **React Table** - Data grid for transaction lists

#### Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Cypress** - E2E testing

#### Build & Deployment
- **npm** - Package management
- **Next.js built-in build** - No separate bundler needed
- **Vercel (optional)** - Easy Next.js deployment

### Frontend Architecture

```
pages/
├── dashboard/           # Risk analyst dashboard
│   ├── index.tsx       # Overview dashboard
│   ├── transactions.tsx # Transaction list
│   ├── alerts.tsx      # Active alerts
│   └── reports.tsx     # Generate reports
├── admin/              # Admin panel
│   ├── settings.tsx    # System settings
│   ├── users.tsx       # User management
│   ├── models.tsx      # Model management
│   └── health.tsx      # System health
├── auth/
│   ├── login.tsx
│   └── logout.tsx
└── api/               # API routes (Next.js API Routes)
    ├── auth.ts
    ├── transactions.ts
    └── dashboard.ts

components/
├── dashboard/
│   ├── TransactionList.tsx
│   ├── AlertsPanel.tsx
│   ├── MetricsCards.tsx
│   ├── RiskChart.tsx
│   └── DecisionHistory.tsx
├── forms/
│   ├── ManualReviewForm.tsx
│   ├── ThresholdEditor.tsx
│   └── AlertSettingsForm.tsx
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Layout.tsx
└── common/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── Modal.tsx
    └── ConfirmDialog.tsx

hooks/
├── useTransactions.ts
├── useDashboard.ts
├── useAuth.ts
└── useNotifications.ts

utils/
├── api-client.ts      # Axios/Fetch wrapper
├── formatters.ts      # Data formatting
├── validators.ts      # Form validation
└── constants.ts       # App constants

styles/
├── globals.css        # Tailwind + global styles
└── themes.css         # Theme variables
```

### UI Components Specification

#### Dashboard Layout
- **Header** - Logo, user profile, logout
- **Sidebar** - Navigation menu (fixed/collapsible)
- **Main Content** - Responsive grid (1/2/3 columns based on screen size)
- **Footer** - System status, documentation links

#### Key Screens
1. **Transaction List Screen**
   - Real-time transaction feed (with WebSocket/polling)
   - Columns: ID, Timestamp, Amount, User, Risk Score, Status
   - Sortable, filterable, paginated
   - Color-coded risk levels (Green: <20%, Yellow: 20-60%, Red: >60%)

2. **Transaction Detail Screen**
   - Full transaction details
   - ML model explanation (top 3 risk factors)
   - Manual review form (approve/reject with comment)
   - Audit trail

3. **Dashboard Overview**
   - Line chart: Transaction volume (hourly)
   - Line chart: Fraud detection rate (hourly)
   - Gauge chart: Current latency
   - Cards: Total transactions, Fraud count, Accuracy rate

4. **Alerts Management**
   - List of recent alerts
   - Alert detail view
   - Acknowledge/Dismiss alerts

### Frontend API Integration

```typescript
// Example API calls
GET  /api/transactions           // List transactions
GET  /api/transactions/:id       // Get transaction details
GET  /api/dashboard/metrics      // Get dashboard metrics
GET  /api/dashboard/chart-data   // Get chart data
POST /api/transactions/:id/review // Manual review (approve/reject)
GET  /api/alerts                 // List alerts
POST /api/alerts/:id/acknowledge // Acknowledge alert
GET  /api/audit/export           // Export audit report
```

### Responsive Design
- **Mobile-first approach**
- **Breakpoints:** 640px (mobile), 1024px (tablet), 1280px (desktop)
- **Mobile Dashboard:** Simplified view, hide complex charts on mobile
- **Touch-friendly:** Min 44px buttons/touch targets

---

## 3. Backend Stack - Transaction Service

### Technology: Spring Boot + Java 21

#### Why Spring Boot?
- ✅ Battle-tested for financial systems
- ✅ Excellent dependency injection
- ✅ Rich ecosystem (Spring Data, Spring Security, Spring Cloud)
- ✅ High performance, low latency
- ✅ Easy integration with Kafka, Redis, PostgreSQL
- ✅ Comprehensive error handling

#### Framework & Libraries
- **Spring Boot 3.3** - Latest LTS
- **Spring Data JPA** - ORM
- **Spring Kafka** - Message producer/consumer
- **Spring Cache** - Caching abstraction
- **Spring Security** - Authentication/authorization
- **Validation** - Jakarta Bean Validation (JSR-380)
- **Logging** - SLF4J + Logback
- **Testing** - JUnit 5, Mockito, TestContainers

#### Project Structure

```
transaction-service/
├── src/main/java/com/fraudshield/transaction/
│   ├── TransactionServiceApplication.java
│   ├── controller/
│   │   ├── TransactionController.java      # REST endpoints
│   │   └── HealthController.java           # Health check
│   ├── service/
│   │   ├── TransactionService.java         # Business logic
│   │   ├── ValidationService.java          # Input validation
│   │   ├── IdempotencyService.java         # Deduplication
│   │   └── RateLimitService.java           # Rate limiting
│   ├── domain/
│   │   ├── Transaction.java                # Entity
│   │   ├── TransactionStatus.java          # Enum
│   │   ├── TransactionRequest.java         # DTO
│   │   └── TransactionResponse.java        # DTO
│   ├── repository/
│   │   └── TransactionRepository.java      # JPA repository
│   ├── kafka/
│   │   ├── TransactionProducer.java        # Kafka producer
│   │   └── FraudResultConsumer.java        # Consume fraud results
│   ├── cache/
│   │   └── CacheManager.java               # Redis cache logic
│   ├── exception/
│   │   ├── ValidationException.java
│   │   ├── RateLimitExceededException.java
│   │   └── GlobalExceptionHandler.java
│   └── config/
│       ├── KafkaConfig.java
│       ├── CacheConfig.java
│       ├── SecurityConfig.java
│       └── WebConfig.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── schema.sql
└── pom.xml
```

#### Key Endpoints

```
POST   /api/transactions/evaluate
  - Submit transaction for fraud detection
  - Request: { userId, amount, merchant, timestamp, ... }
  - Response: { transactionId, decision, riskScore, confidence }
  - Latency: <200ms

GET    /api/transactions/{transactionId}
  - Get transaction status
  - Response: { status, decision, riskScore, reasons }

GET    /api/health
  - Health check endpoint
  - Response: { status, services: { kafka, db, redis, fraud_service } }

POST   /api/admin/settings
  - Update fraud detection thresholds
  - Request: { approvalThreshold, manualReviewThreshold }
```

---

## 4. Backend Stack - Fraud Detection Service

### Technology: Python + FastAPI

#### Why Python + FastAPI?
- ✅ ML/Data science libraries (scikit-learn, pandas, numpy)
- ✅ FastAPI - Async framework, excellent performance
- ✅ Easy model integration (TensorFlow, PyTorch)
- ✅ Rapid prototyping
- ✅ Strong community for ML

#### Framework & Libraries
- **FastAPI 0.109+** - Async web framework
- **Pydantic** - Data validation
- **scikit-learn** - ML model library
- **numpy/pandas** - Data processing
- **redis-py** - Redis client
- **kafka-python** - Kafka consumer
- **python-dotenv** - Configuration
- **pytest** - Testing framework

#### Project Structure

```
fraud-detection-service/
├── app/
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Configuration
│   ├── routers/
│   │   ├── health.py              # Health check
│   │   └── predict.py             # ML prediction endpoints
│   ├── services/
│   │   ├── ml_service.py          # ML model loading/inference
│   │   ├── feature_service.py     # Feature extraction
│   │   ├── kafka_service.py       # Kafka consumer
│   │   └── cache_service.py       # Redis interaction
│   ├── models/
│   │   ├── schemas.py             # Pydantic models
│   │   ├── ml_model.pkl           # Pre-trained model (binary)
│   │   ├── feature_scaler.pkl     # Feature scaling object
│   │   └── feature_names.json     # Feature definition
│   ├── utils/
│   │   ├── logger.py              # Logging setup
│   │   ├── exceptions.py          # Custom exceptions
│   │   └── helpers.py             # Utility functions
│   └── middleware/
│       ├── logging_middleware.py  # Request logging
│       └── error_handler.py       # Error handling
├── tests/
│   ├── test_feature_extraction.py
│   ├── test_ml_inference.py
│   └── test_endpoints.py
├── requirements.txt
├── Dockerfile
└── docker-compose.override.yml
```

#### ML Model Specifications

**Input Features (20+ features)**
```python
{
  "user_id": int,
  "amount": float,
  "timestamp": datetime,
  "merchant_id": int,
  "merchant_category": str,
  "user_avg_transaction_amount": float,
  "transaction_count_last_24h": int,
  "transaction_count_last_hour": int,
  "is_weekend": bool,
  "is_night_time": bool,
  "days_since_last_transaction": int,
  "is_international": bool,
  "card_not_present": bool,
  "velocity_score": float,  # Recent transaction frequency
  "deviation_from_average": float,  # Amount deviation
  "user_location": str,
  "transaction_location": str,
  "location_distance_km": float,
  "device_id": str,
  "is_new_device": bool
}
```

**Output**
```python
{
  "risk_score": float,  # 0-100
  "confidence": float,  # 0-100
  "prediction": str,    # "APPROVE" or "REJECT"
  "risk_factors": [     # Top 3 factors
    {
      "factor": "high_amount",
      "weight": 0.25,
      "explanation": "Transaction amount 5x higher than usual"
    }
  ],
  "model_version": str  # e.g., "v1.2.3"
}
```

#### Kafka Consumer Configuration
- **Topic:** `transactions`
- **Consumer Group:** `fraud-detection-service`
- **Processing:** Async (non-blocking)
- **Error Handling:** Send to DLQ on error
- **Concurrency:** Configurable (default: 3 threads)

---

## 5. Backend Stack - Notification Service

### Technology: Spring Boot + Java 21

#### Responsibilities
- Consume fraud events from Kafka
- Send email/Slack notifications
- Manage alert history
- Generate daily reports

#### Key Components

```
notification-service/
├── controller/
│   ├── NotificationController.java
│   └── HealthController.java
├── service/
│   ├── EmailService.java         # SMTP integration
│   ├── SlackService.java         # Slack webhook
│   ├── NotificationService.java  # Orchestration
│   └── ReportService.java        # Report generation
├── domain/
│   ├── Notification.java
│   ├── NotificationTemplate.java
│   └── AlertRule.java
├── repository/
│   └── NotificationRepository.java
├── kafka/
│   └── FraudEventConsumer.java
├── config/
│   ├── EmailConfig.java
│   └── SlackConfig.java
└── templates/
    ├── fraud-alert-email.html
    └── daily-report-email.html
```

---

## 6. Data & Cache Layer

### PostgreSQL Database Schema

#### Core Tables

**transactions**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  merchant_id BIGINT NOT NULL,
  merchant_name VARCHAR(255),
  status VARCHAR(20), -- PENDING, APPROVED, REJECTED, REVIEW
  fraud_decision VARCHAR(20), -- APPROVED, REJECTED, MANUAL_REVIEW
  fraud_score DECIMAL(5,2),
  fraud_confidence DECIMAL(5,2),
  fraud_reasons JSONB,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX (user_id),
  INDEX (created_at),
  INDEX (status)
);

CREATE TABLE transaction_audit_log (
  id BIGSERIAL PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  action VARCHAR(50),
  changed_by VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX (transaction_id, timestamp)
);
```

**user_profiles**
```sql
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  external_user_id VARCHAR(100) UNIQUE NOT NULL,
  risk_score DECIMAL(5,2),
  transaction_count INT DEFAULT 0,
  total_fraud_detected INT DEFAULT 0,
  avg_transaction_amount DECIMAL(15,2),
  last_transaction_at TIMESTAMP,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX (external_user_id)
);
```

**fraud_detection_rules**
```sql
CREATE TABLE fraud_detection_rules (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100),
  rule_type VARCHAR(50), -- THRESHOLD, VELOCITY, PATTERN
  condition JSONB,
  priority INT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX (enabled, priority)
);
```

**system_alerts**
```sql
CREATE TABLE system_alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_type VARCHAR(100),
  severity VARCHAR(20), -- LOW, MEDIUM, HIGH, CRITICAL
  message TEXT,
  status VARCHAR(20), -- ACTIVE, ACKNOWLEDGED, RESOLVED
  acknowledged_by VARCHAR(100),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  INDEX (severity, status, created_at)
);
```

### Redis Cache Schema

```
# User Risk Profiles (TTL: 1 hour)
user:{userId}:risk_profile -> { score, flag_count, last_updated }

# Recent Transactions (TTL: 24 hours)
user:{userId}:recent_transactions -> [tx1, tx2, tx3, ...]

# Transaction Cache (TTL: 5 minutes)
transaction:{transactionId} -> { full_transaction_object }

# Rate Limit Counters (TTL: 1 minute)
ratelimit:user:{userId}:count -> counter_value

# Feature Cache (TTL: 1 hour)
features:{userId}:{date} -> { extracted_features_json }

# Alert Status (TTL: 24 hours)
alert:active -> set of active alert IDs

# Session Cache (TTL: 24 hours)
session:{sessionId} -> { user_info, permissions }

# Model Version (TTL: infinite, manually updated)
model:version -> { version, updated_at, md5_hash }
```

### Caching Strategy

| Data | TTL | Invalidation |
|------|-----|--------------|
| User Risk Profile | 1 hour | Manual invalidation on profile update |
| Recent Transactions | 24 hours | Update on every new transaction |
| Transaction Details | 5 minutes | Automatic expiry |
| Feature Cache | 1 hour | Automatic expiry |
| Rate Limit | 1 minute | Automatic expiry |
| Session | 24 hours | On logout or timeout |

---

## 7. Message Queue Architecture (Kafka)

### Topics Configuration

#### `transactions` (Source Topic)
- **Partitions:** 10 (for scalability)
- **Replication Factor:** 3 (for reliability)
- **Retention:** 7 days
- **Schema:** Avro (structured data)
- **Producers:** Transaction Service
- **Consumers:** Fraud Detection Service, Audit Service

#### `fraud-results` (Output Topic)
- **Partitions:** 10
- **Replication Factor:** 3
- **Retention:** 30 days (for auditing)
- **Producers:** Fraud Detection Service
- **Consumers:** Transaction Decision Service, Notification Service, Audit Service

#### `fraud-alerts` (Alert Topic)
- **Partitions:** 5
- **Replication Factor:** 2
- **Retention:** 24 hours
- **Producers:** Decision Service
- **Consumers:** Notification Service

#### `audit-events` (Audit Topic)
- **Partitions:** 5
- **Replication Factor:** 3
- **Retention:** 90 days (compliance requirement)
- **Producers:** All services
- **Consumers:** Audit Service

#### `dead-letter-topic` (Error Handling)
- **Partitions:** 3
- **Replication Factor:** 2
- **Retention:** 30 days (for debugging)
- **Producers:** All consumers on processing errors
- **Consumers:** Alert service, manual review queue

### Message Flow

```
Transaction Service
    ↓ (publishes)
transactions topic
    ↓ (subscribes)
Fraud Detection Service
    ↓ (processes & publishes)
fraud-results topic
    ↓ (subscribes)
Decision Service
    ├─→ Notification Service (fraud alerts)
    └─→ Audit Service (all decisions)
```

### Idempotency Strategy

**Problem:** Kafka consumer may crash and restart, causing duplicate processing.

**Solution:** Use transactionId as key + database unique constraint

```java
// In transaction_decisions table
CREATE UNIQUE INDEX idx_transaction_id_decision 
  ON transaction_decisions(transaction_id);

// Service checks if already processed
boolean isAlreadyProcessed = 
  decisionRepository.existsByTransactionId(transactionId);

if (!isAlreadyProcessed) {
  // Process and save decision
  saveDecision(transactionId, decision);
}
```

---

## 8. Authentication & Authorization

### Authentication Strategy

#### For Dashboard Users (Risk Analysts, Admins)
- **Method:** OAuth 2.0 + OpenID Connect
- **Provider:** Okta / Auth0 (or self-hosted Keycloak)
- **Token Format:** JWT with claims: { userId, role, permissions }
- **Token Expiry:** 1 hour (access token), 30 days (refresh token)

#### For Banks Calling Transaction API
- **Method:** API Key + HMAC-SHA256 (mutual TLS preferred)
- **Key Rotation:** Every 90 days
- **Rate Limiting:** Per API key
- **Example Header:**
  ```
  Authorization: Bearer {api_key}
  X-Request-Signature: {hmac_signature}
  X-Request-Timestamp: {timestamp}
  ```

### Authorization Model (RBAC)

```
Roles:
├── ANALYST_VIEWER - Can view transactions, alerts (read-only)
├── ANALYST_REVIEWER - Can approve/reject transactions
├── SYSTEM_ADMIN - Full system access
├── DATA_SCIENTIST - Can update models
└── OPERATOR - Can view system health

Permissions Matrix:
├── transaction:view
├── transaction:review
├── transaction:override
├── alert:acknowledge
├── rule:view
├── rule:edit
├── report:generate
├── system:health
└── system:settings
```

### Security Implementation

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
  
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) {
    http
      .oauth2ResourceServer(oauth2 -> oauth2
        .jwt(jwt -> jwt
          .decoder(jwtDecoder())
          .jwtAuthenticationConverter(jwtAuthenticationConverter())
        )
      )
      .authorizeHttpRequests(authz -> authz
        .requestMatchers("/api/transactions/evaluate").hasRole("BANK_API")
        .requestMatchers("/api/dashboard/**").hasRole("ANALYST")
        .requestMatchers("/api/admin/**").hasRole("ADMIN")
        .requestMatchers("/health").permitAll()
        .anyRequest().authenticated()
      )
      .csrf().disable() // Stateless API
      .sessionManagement().sessionCreationPolicy(
        SessionCreationPolicy.STATELESS
      );
    return http.build();
  }
}
```

---

## 9. API Specification

### 1. Submit Transaction (Core API)

```
POST /api/v1/transactions/evaluate
Authentication: API Key
Content-Type: application/json

REQUEST BODY:
{
  "transaction_id": "txn_abc123def456",
  "timestamp": "2026-06-15T14:30:45.123Z",
  "user_id": "user_12345",
  "user_email": "customer@bank.com",
  "user_phone": "+1-555-1234",
  "amount": 150.00,
  "currency": "USD",
  "merchant_id": "merchant_789",
  "merchant_name": "Amazon.com",
  "merchant_category": "SHOPPING",
  "card_number_last4": "1234",
  "card_type": "CREDIT",
  "transaction_type": "ONLINE",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "city": "San Francisco",
    "country": "US",
    "ip_address": "192.168.1.1"
  },
  "device_info": {
    "device_id": "device_xyz789",
    "device_type": "MOBILE",
    "os": "iOS",
    "browser": "Safari"
  },
  "card_present": false,
  "recurring": false
}

RESPONSE (200 OK):
{
  "transaction_id": "txn_abc123def456",
  "status": "APPROVED",
  "decision": "APPROVE",
  "risk_score": 15.5,
  "confidence": 95.2,
  "processing_time_ms": 87,
  "timestamp": "2026-06-15T14:30:45.500Z",
  "risk_factors": [
    {
      "factor": "normal_amount",
      "weight": 0.20,
      "explanation": "Amount within user's typical range"
    },
    {
      "factor": "known_merchant",
      "weight": 0.30,
      "explanation": "Merchant previously used by user"
    }
  ],
  "model_version": "v2.1.0"
}

ERROR RESPONSES:
400 Bad Request - Invalid payload
401 Unauthorized - Invalid API key
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Service failure
```

### 2. Get Transaction Status

```
GET /api/v1/transactions/{transactionId}
Authentication: API Key

RESPONSE (200 OK):
{
  "transaction_id": "txn_abc123def456",
  "status": "APPROVED",
  "fraud_decision": "APPROVED",
  "fraud_score": 15.5,
  "timestamp": "2026-06-15T14:30:45.123Z",
  "processed_at": "2026-06-15T14:30:45.500Z",
  "history": [
    {
      "action": "INITIAL_DECISION",
      "decision": "APPROVED",
      "timestamp": "2026-06-15T14:30:45.500Z"
    },
    {
      "action": "MANUAL_REVIEW",
      "reviewer": "analyst_123",
      "decision": "APPROVED",
      "timestamp": "2026-06-15T14:35:22.000Z"
    }
  ]
}
```

### 3. Dashboard - Get Transaction List

```
GET /api/v1/dashboard/transactions?
  status=PENDING&
  sort=-created_at&
  page=1&
  limit=20

Authentication: JWT Token
Role Required: ANALYST or ADMIN

RESPONSE (200 OK):
{
  "total": 2540,
  "page": 1,
  "limit": 20,
  "transactions": [
    {
      "id": "txn_001",
      "user_id": "user_001",
      "amount": 500.00,
      "merchant": "Amazon",
      "status": "PENDING",
      "fraud_score": 75.2,
      "created_at": "2026-06-15T14:30:45.123Z"
    },
    ...
  ]
}
```

### 4. Manual Review - Update Decision

```
POST /api/v1/dashboard/transactions/{transactionId}/review
Authentication: JWT Token
Role Required: ANALYST_REVIEWER or ADMIN
Content-Type: application/json

REQUEST BODY:
{
  "decision": "APPROVE",
  "reason": "Verified customer identity - known merchant",
  "notes": "Called customer, confirmed transaction"
}

RESPONSE (200 OK):
{
  "transaction_id": "txn_abc123def456",
  "original_decision": "REJECT",
  "new_decision": "APPROVE",
  "reviewed_by": "analyst_456",
  "reviewed_at": "2026-06-15T14:35:22.000Z"
}
```

### 5. Dashboard - Get Metrics

```
GET /api/v1/dashboard/metrics?timeframe=1h
Authentication: JWT Token
Role Required: ANALYST or ADMIN

RESPONSE (200 OK):
{
  "timestamp": "2026-06-15T14:30:45.123Z",
  "transaction_volume": 5420,
  "fraud_detected_count": 127,
  "fraud_rate": 2.34,
  "approval_rate": 97.66,
  "avg_processing_time_ms": 98,
  "p95_processing_time_ms": 187,
  "p99_processing_time_ms": 289,
  "model_accuracy": 96.2,
  "false_positive_rate": 0.8,
  "kafka_lag": 45,
  "redis_cache_hit_rate": 87.3,
  "db_connections_used": 32
}
```

### 6. System Health Check

```
GET /api/v1/health
No Authentication Required

RESPONSE (200 OK):
{
  "status": "UP",
  "services": {
    "database": {
      "status": "UP",
      "latency_ms": 12
    },
    "kafka": {
      "status": "UP",
      "lag": 45
    },
    "redis": {
      "status": "UP",
      "latency_ms": 2
    },
    "fraud_service": {
      "status": "UP",
      "latency_ms": 89
    }
  },
  "uptime_seconds": 864000
}
```

---

## 10. Deployment Architecture

### Development Environment (Local)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fraudshield
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  transaction-service:
    build:
      context: ./backend/transaction-service
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/fraudshield
      SPRING_REDIS_HOST: redis
      KAFKA_BROKERS: kafka:9092
    depends_on:
      - postgres
      - redis
      - kafka

  fraud-service:
    build:
      context: ./backend/fraud-service
      dockerfile: Dockerfile
    ports:
      - "8081:8081"
    environment:
      KAFKA_BROKERS: kafka:9092
      REDIS_HOST: redis
    depends_on:
      - redis
      - kafka

  notification-service:
    build:
      context: ./backend/notification-service
      dockerfile: Dockerfile
    ports:
      - "8082:8082"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/fraudshield
      KAFKA_BROKERS: kafka:9092
    depends_on:
      - postgres
      - kafka

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
    depends_on:
      - transaction-service

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - transaction-service

volumes:
  postgres_data:
```

### Production Deployment (AWS)

```
AWS Infrastructure:
├── VPC (Private subnets for compute, public for ALB)
├── ALB (Application Load Balancer for frontend & APIs)
├── EC2 Instances:
│   ├── EC2-1: Transaction Service (t3.2xlarge, 2 instances)
│   ├── EC2-2: Fraud Service (c6i.2xlarge, 3 instances)
│   ├── EC2-3: Notification Service (t3.large, 2 instances)
│   ├── EC2-4: Kafka Cluster (r6i.2xlarge, 3 instances)
│   └── EC2-5: NGINX (t3.large, 2 instances)
├── RDS PostgreSQL (Multi-AZ, 2 vCPU, 100 GB storage)
├── ElastiCache Redis Cluster (3 nodes, 4GB each)
├── S3 (Audit logs, backups)
├── CloudWatch (Monitoring, alarms)
├── VPC Endpoint (For S3, DynamoDB)
└── Route 53 (DNS)

Auto-scaling:
├── Transaction Service: 2-10 instances (CPU > 70%)
├── Fraud Service: 3-15 instances (CPU > 80%)
└── Notification Service: 2-5 instances (Queue depth)

Backup & DR:
├── Database: Daily automated backups, 30-day retention
├── Kafka: Replicated across 3 AZs
├── Redis: Multi-AZ failover enabled
└── S3: Cross-region replication enabled
```

### Deployment Pipeline

```
┌─────────────────────────────────────────────────────────┐
│            Developer commits to main branch             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
        ┌────────────────────────────────┐
        │  GitHub Actions Triggered      │
        └────────────────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              ↓                             ↓
        ┌─────────────┐            ┌──────────────┐
        │ Run Tests   │            │ Build Docker │
        └──────┬──────┘            │ Images       │
               │                   └──────┬───────┘
               │                          │
               └──────────────┬───────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Push to ECR         │
                    └──────────┬──────────┘
                               │
               ┌───────────────┼───────────────┐
               ↓               ↓               ↓
        ┌──────────────┐ ┌──────────────┐ ┌────────────────┐
        │ Deploy to    │ │ Deploy to    │ │ Manual Approval│
        │ Staging      │ │ QA Env       │ │ for Prod       │
        │ (Auto)       │ │ (Auto)       │ │                │
        └──────┬───────┘ └──────────────┘ └────────┬───────┘
               │                                    │
               └────────────────┬───────────────────┘
                                ↓
                        ┌─────────────────┐
                        │ Deploy to Prod  │
                        │ (Blue-Green)    │
                        └─────────────────┘
```

---

## 11. Security Requirements

### Data Protection
- **Encryption in Transit:** TLS 1.3 for all connections
- **Encryption at Rest:** PostgreSQL native encryption + application-level encryption for sensitive fields
- **API Keys:** Stored hashed in database, rotated every 90 days
- **PII Data:** Tokenized (card numbers, SSN stored as hashes)

### Access Control
- **API Gateway:** NGINX with rate limiting, DDoS protection
- **Database:** No direct internet access, accessed only from VPC
- **SSH:** Disabled, use AWS Systems Manager Session Manager only
- **Secrets Management:** AWS Secrets Manager for DB passwords, API keys

### Audit & Compliance
- **Audit Logging:** All transactions logged with user, timestamp, action
- **Retention:** 90 days in database, 1 year in S3
- **Compliance:** PCI-DSS v3.2.1, SOC 2 Type II
- **Audit Export:** Monthly export to S3 for compliance team

### Network Security
- **VPC Isolation:** Services in private subnets
- **Security Groups:** Restrictive ingress rules by source IP
- **WAF:** AWS WAF on ALB to block common attacks
- **VPN:** Required for admin access

---

## 12. Monitoring & Observability

### Metrics to Track
- **Application Metrics:**
  - Transaction throughput (TPS)
  - API latency (p50, p95, p99)
  - Fraud detection rate
  - False positive rate
  - Model inference time

- **Infrastructure Metrics:**
  - CPU/Memory utilization
  - Disk I/O
  - Network throughput
  - Database connections

- **Business Metrics:**
  - Total transactions processed
  - Fraud losses prevented
  - Operational cost per transaction
  - Customer satisfaction

### Logging Strategy
- **Level:** DEBUG in dev, INFO in staging, WARN in prod
- **Format:** JSON (structured logging)
- **Aggregation:** CloudWatch Logs + ELK Stack
- **Retention:** 30 days in CloudWatch, 1 year in S3

### Alerting
- **P95 Latency > 500ms:** Page
- **Service Down:** Page
- **Error Rate > 1%:** Page
- **Fraud Detection Rate < 90%:** Email
- **Disk > 80% full:** Email

---

## 13. Technical Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Kafka over RabbitMQ** | Kafka handles higher throughput, message replay for audit, better for streaming |
| **Spring Boot over Node.js** | Java better for financial systems, mature libraries, type safety |
| **Python for ML** | Ecosystem (scikit-learn, TensorFlow), data science talent pool |
| **PostgreSQL over MongoDB** | ACID compliance, data integrity, relational data |
| **Redis over Memcached** | Data structures, atomic operations, persistence, replication |
| **Docker Compose for MVP** | Faster setup, simpler orchestration than Kubernetes for MVP |
| **JWT tokens** | Stateless, scalable, standard in industry |
| **Next.js over React SPA** | SSR improves SEO, API routes eliminate N+1, better performance |

---

## 14. Performance & Scalability Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Latency (p95)** | <200ms | Customer expectation, industry standard |
| **Throughput** | 10,000 TPS | Current market demand |
| **Availability** | 99.9% | Financial industry standard |
| **Data Recovery** | <5 minutes | RPO: 1 hour, RTO: 5 min |
| **Cache Hit Rate** | >85% | Reduces database load |
| **Kafka Lag** | <100ms | Near real-time processing |

---

## 15. Testing Strategy

### Unit Tests
- Services, repositories, utilities
- Target: >80% code coverage
- Framework: JUnit 5 (Java), pytest (Python)

### Integration Tests
- API endpoints with mocked Kafka/Redis
- Database integration
- Target: >60% scenario coverage

### System Tests
- Full flow: transaction → fraud detection → decision
- Using TestContainers for containerized services
- Load testing: 5,000 TPS for 10 minutes

### End-to-End Tests
- Cypress for UI testing
- Manual QA for complex scenarios

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-15  
**Owner:** Senior Architect  
**Status:** Approved for Development
