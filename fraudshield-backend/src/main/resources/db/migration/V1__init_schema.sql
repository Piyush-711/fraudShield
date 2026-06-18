-- FraudShield — Flyway Initial Schema
-- V1__init_schema.sql
-- Run automatically by Spring Boot (Flyway) on first startup in prod profile

-- ─── USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_users (
    id                      BIGSERIAL PRIMARY KEY,
    email                   VARCHAR(255) UNIQUE NOT NULL,
    name                    VARCHAR(255) NOT NULL,
    role                    VARCHAR(50)  NOT NULL
        CHECK (role IN ('ANALYST_VIEWER','ANALYST_REVIEWER','SYSTEM_ADMIN','DATA_SCIENTIST','OPERATOR')),
    password_hash           VARCHAR(255) NOT NULL,
    is_active               BOOLEAN      DEFAULT TRUE,
    is_locked               BOOLEAN      DEFAULT FALSE,
    failed_login_attempts   INT          DEFAULT 0,
    locked_until            TIMESTAMP,
    mfa_enabled             BOOLEAN      DEFAULT FALSE,
    mfa_secret              VARCHAR(255),
    last_login_at           TIMESTAMP,
    last_activity_at        TIMESTAMP,
    deactivated_at          TIMESTAMP,
    deactivation_reason     TEXT,
    created_at              TIMESTAMP    DEFAULT NOW(),
    updated_at              TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email       ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON app_users(role, is_active);

-- ─── USER PROFILES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
    id                              BIGSERIAL PRIMARY KEY,
    external_user_id                VARCHAR(100) UNIQUE NOT NULL,
    current_risk_score              DECIMAL(5,2)  DEFAULT 0.00,
    average_transaction_amount      DECIMAL(15,2) DEFAULT 0.00,
    std_dev_transaction_amount      DECIMAL(15,2) DEFAULT 0.00,
    total_transactions              INT           DEFAULT 0,
    total_fraud_detected            INT           DEFAULT 0,
    fraud_rate                      DECIMAL(5,2)  DEFAULT 0.00,
    most_active_hour                INT,
    most_active_day_of_week         INT,
    last_transaction_at             TIMESTAMP,
    is_blocked                      BOOLEAN       DEFAULT FALSE,
    block_reason                    VARCHAR(255),
    blocked_at                      TIMESTAMP,
    created_at                      TIMESTAMP     DEFAULT NOW(),
    updated_at                      TIMESTAMP     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_external_id  ON user_profiles(external_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_risk_score   ON user_profiles(current_risk_score DESC);

-- ─── TRANSACTIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id                          BIGSERIAL    PRIMARY KEY,
    transaction_id              VARCHAR(100) NOT NULL UNIQUE,
    user_id                     VARCHAR(100) NOT NULL,
    user_email                  VARCHAR(255),
    amount                      DECIMAL(15,2) NOT NULL,
    currency                    VARCHAR(3)   DEFAULT 'USD',
    merchant_name               VARCHAR(255),
    merchant_category           VARCHAR(50),
    card_type                   VARCHAR(20),
    card_last_4                 VARCHAR(4),
    transaction_type            VARCHAR(50)
        CHECK (transaction_type IN ('ONLINE','IN_PERSON','ATM','RECURRING')),
    location_city               VARCHAR(100),
    location_country            VARCHAR(2),
    location_ip                 VARCHAR(45),
    device_type                 VARCHAR(50),
    device_os                   VARCHAR(50),
    fraud_score                 INT,
    fraud_confidence            INT,
    fraud_prediction            VARCHAR(20)
        CHECK (fraud_prediction IN ('APPROVE','REJECT','MANUAL_REVIEW')),
    fraud_factors               TEXT,
    model_version               VARCHAR(20),
    fraud_final_decision        VARCHAR(20)
        CHECK (fraud_final_decision IN ('APPROVED','REJECTED','MANUAL_REVIEW')),
    transaction_status          VARCHAR(20)  DEFAULT 'PENDING'
        CHECK (transaction_status IN ('PENDING','APPROVED','REJECTED','MANUAL_REVIEW','CANCELLED')),
    processing_time_ms          INT,
    manual_review_reason        VARCHAR(255),
    manual_review_notes         TEXT,
    reviewed_at                 TIMESTAMP,
    reviewed_by                 VARCHAR(100),
    created_at                  TIMESTAMP    DEFAULT NOW(),
    updated_at                  TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_user_id      ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_status       ON transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_tx_fraud_score  ON transactions(fraud_score DESC);
CREATE INDEX IF NOT EXISTS idx_tx_created_at   ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_user_status  ON transactions(user_id, transaction_status);
CREATE INDEX IF NOT EXISTS idx_tx_manual_review ON transactions(transaction_status)
    WHERE transaction_status = 'MANUAL_REVIEW';

-- ─── AUDIT LOGS ─────────────────────────────────────────────────────────────
-- Table name matches AppAuditLog entity: @Table(name = "audit_logs")
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL    PRIMARY KEY,
    transaction_id  VARCHAR(100),
    action_type     VARCHAR(50)  NOT NULL
        CHECK (action_type IN ('CREATED','DECISION_MADE','MANUAL_REVIEW','UPDATED','ESCALATED','RESOLVED')),
    actor_type      VARCHAR(20),
    actor_id        VARCHAR(100),
    actor_role      VARCHAR(50),
    field_name      VARCHAR(100),
    old_value       TEXT,
    new_value       TEXT,
    change_reason   TEXT,
    ip_address      VARCHAR(45),
    timestamp       TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tx_id    ON audit_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_logs(timestamp DESC);

-- ─── FRAUD DETECTION RULES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fraud_detection_rules (
    id                   BIGSERIAL    PRIMARY KEY,
    name                 VARCHAR(255) NOT NULL UNIQUE,
    description          TEXT,
    rule_type            VARCHAR(50)  NOT NULL
        CHECK (rule_type IN ('THRESHOLD','VELOCITY','PATTERN','GEOLOCATION','DEVICE')),
    rule_condition       JSONB        NOT NULL,
    rule_action          VARCHAR(50),
    priority             INT          DEFAULT 100,
    enabled              BOOLEAN      DEFAULT TRUE,
    is_system_rule       BOOLEAN      DEFAULT FALSE,
    risk_score_impact    DECIMAL(5,2) DEFAULT 0.00,
    confidence_weight    DECIMAL(5,2) DEFAULT 1.00,
    times_triggered      INT          DEFAULT 0,
    last_triggered_at    TIMESTAMP,
    created_at           TIMESTAMP    DEFAULT NOW(),
    updated_at           TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rules_enabled  ON fraud_detection_rules(enabled, priority);
CREATE INDEX IF NOT EXISTS idx_rules_type     ON fraud_detection_rules(rule_type, enabled);

-- ─── SYSTEM ALERTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_alerts (
    id                   BIGSERIAL    PRIMARY KEY,
    alert_type           VARCHAR(100) NOT NULL
        CHECK (alert_type IN ('FRAUD_DETECTED','PERF_DEGRADED','SERVICE_DOWN','INFRA_ALERT','SECURITY_ALERT','THRESHOLD_EXCEEDED')),
    severity             VARCHAR(20)  NOT NULL
        CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    title                VARCHAR(255) NOT NULL,
    message              TEXT         NOT NULL,
    transaction_id       VARCHAR(100),
    status               VARCHAR(20)  DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','ACKNOWLEDGED','RESOLVED','ESCALATED')),
    acknowledged_by      VARCHAR(255),
    acknowledged_at      TIMESTAMP,
    resolved_at          TIMESTAMP,
    resolution_notes     TEXT,
    created_at           TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status      ON system_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at  ON system_alerts(created_at DESC);

-- ─── SYSTEM CONFIG ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_config (
    id                              BIGSERIAL    PRIMARY KEY,
    auto_approval_threshold         INT          DEFAULT 20,
    manual_review_threshold         INT          DEFAULT 70,
    auto_rejection_threshold        INT          DEFAULT 85,
    max_transactions_per_minute     INT          DEFAULT 10000,
    max_transactions_per_user_hour  INT          DEFAULT 1000,
    transaction_timeout_ms          INT          DEFAULT 200,
    kafka_consumer_threads          INT          DEFAULT 3,
    redis_cache_ttl_hours           INT          DEFAULT 1,
    alert_severity_threshold        VARCHAR(20)  DEFAULT 'HIGH',
    email_notifications_enabled     BOOLEAN      DEFAULT TRUE,
    slack_notifications_enabled     BOOLEAN      DEFAULT TRUE,
    created_at                      TIMESTAMP    DEFAULT NOW(),
    updated_at                      TIMESTAMP    DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_system_config_singleton ON system_config((TRUE));

-- ─── MODEL VERSIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS model_versions (
    id                  BIGSERIAL    PRIMARY KEY,
    model_version       VARCHAR(50)  NOT NULL UNIQUE,
    model_description   TEXT,
    accuracy_rate       DECIMAL(5,2),
    precision_rate      DECIMAL(5,2),
    recall_rate         DECIMAL(5,2),
    f1_score            DECIMAL(5,2),
    is_active           BOOLEAN      DEFAULT FALSE,
    is_canary           BOOLEAN      DEFAULT FALSE,
    canary_percentage   INT          DEFAULT 0,
    activated_at        TIMESTAMP,
    deactivated_at      TIMESTAMP,
    created_at          TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_versions_active ON model_versions(is_active);

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id                       BIGSERIAL    PRIMARY KEY,
    notification_type        VARCHAR(100),
    recipient_email          VARCHAR(255),
    subject                  VARCHAR(255),
    message                  TEXT,
    related_transaction_id   VARCHAR(100),
    channel                  VARCHAR(50)
        CHECK (channel IN ('EMAIL','SLACK','IN_APP')),
    status                   VARCHAR(20)  DEFAULT 'QUEUED'
        CHECK (status IN ('QUEUED','SENT','FAILED','BOUNCED')),
    sent_at                  TIMESTAMP,
    read_at                  TIMESTAMP,
    retry_count              INT          DEFAULT 0,
    last_error_message       TEXT,
    created_at               TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_status   ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at  ON notifications(sent_at DESC);
