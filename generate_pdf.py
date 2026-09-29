import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress page number on cover page
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header rule and text
        self.drawString(54, letter[1] - 36, "FraudShield - Technical Architecture & Interview Defense Guide")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
        
        # Footer rule and text
        self.line(54, 46, letter[0] - 54, 46)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 32, page_str)
        self.drawString(54, 32, "Confidential - Prepared for Technical Hiring & Engineering Interviews")
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    primary = colors.HexColor("#1E1B4B")     # Dark Indigo
    accent = colors.HexColor("#4F46E5")      # Indigo 600
    secondary = colors.HexColor("#475569")   # Slate 600
    text_dark = colors.HexColor("#0F172A")   # Slate 900
    card_bg = colors.HexColor("#F8FAFC")     # Slate 50
    border_col = colors.HexColor("#E2E8F0")  # Slate 200

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=primary,
        alignment=0,
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=accent,
        alignment=0,
        spaceAfter=24
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary,
        spaceBefore=18,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=accent,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_dark,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyBold_Custom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1E293B")
    )

    q_style = ParagraphStyle(
        'QuestionStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14.5,
        textColor=primary,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    ans_style = ParagraphStyle(
        'AnswerStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=8
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0F172A")
    )

    story_elem = []

    # ─────────────────────────────────────────────────────────────────────────────
    # COVER / TITLE BANNER
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Spacer(1, 10))
    story_elem.append(Paragraph("FRAUDSHIELD ENTERPRISE", ParagraphStyle('Pill', fontName='Helvetica-Bold', fontSize=10, textColor=accent, leading=12, spaceAfter=8)))
    story_elem.append(Paragraph("Full Technical Architecture, Code Walkthrough & Interview Defense Kit", title_style))
    story_elem.append(Paragraph("A Master Blueprint for Junior & Fresher Software Engineers to Ace Senior Technical Interviews", subtitle_style))
    story_elem.append(HRFlowable(width="100%", thickness=2, color=accent, spaceBefore=0, spaceAfter=14))

    meta_table_data = [
        [Paragraph("<b>Target Role:</b> Software Development Engineer / Backend Engineer", body_style),
         Paragraph("<b>Tech Stack:</b> Spring Boot 3, FastAPI, Next.js 14, PostgreSQL", body_style)],
        [Paragraph("<b>Domain:</b> Fintech & Real-Time Cyber Threat Intelligence", body_style),
         Paragraph("<b>Repository:</b> github.com/Piyush-711/fraudShield", body_style)],
        [Paragraph("<b>Author / Candidate:</b> Piyush", body_style),
         Paragraph("<b>Architecture:</b> Hybrid Event-Driven Microservices", body_style)],
    ]
    meta_table = Table(meta_table_data, colWidths=[250, 250])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 0.5, border_col),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_col),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story_elem.append(meta_table)
    story_elem.append(Spacer(1, 16))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 1: EXECUTIVE SUMMARY & PROBLEM STATEMENT
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story_elem.append(HRFlowable(width="100%", thickness=0.75, color=border_col, spaceBefore=2, spaceAfter=8))

    story_elem.append(Paragraph(
        "<b>The Real-World Financial Crisis:</b> Digital payment volumes have exploded, bringing sophisticated fraud vectors including automated card testing, distributed credential stuffing, synthetic account takeover, and rapid geographic velocity anomalies. Traditional banking infrastructure relied on rigid, static rules (e.g. <i>'Flag transactions over $5,000'</i>). Fraudsters easily circumvent static rules by initiating micro-transactions under thresholds across rotating IP subnets. Conversely, aggressive machine learning models frequently trigger false positives, declining genuine users and hurting merchant revenue.",
        body_style
    ))
    story_elem.append(Paragraph(
        "<b>FraudShield's Solution:</b> An enterprise, sub-200ms hybrid risk adjudication platform combining supervised machine learning (XGBoost), unsupervised anomaly detection (Isolation Forest), and an in-memory rule engine with dynamic threshold management. It introduces a 3-tier adjudication funnel:",
        body_style
    ))

    funnel_data = [
        [Paragraph("<b>Funnel Tier</b>", body_bold), Paragraph("<b>Score Range</b>", body_bold), Paragraph("<b>Action Taken</b>", body_bold), Paragraph("<b>System SLA</b>", body_bold)],
        [Paragraph("<b>Auto-Approved</b>", body_style), Paragraph("0 to 29", code_style), Paragraph("Synchronous approval returned to bank gateway", body_style), Paragraph("< 150 ms", body_style)],
        [Paragraph("<b>Manual Review</b>", body_style), Paragraph("30 to 69", code_style), Paragraph("Enqueued into Analyst portal with explainability factors", body_style), Paragraph("Async Triage", body_style)],
        [Paragraph("<b>Auto-Rejected</b>", body_style), Paragraph("70 to 100", code_style), Paragraph("Hard block executed; Security alert triggered", body_style), Paragraph("< 150 ms", body_style)]
    ]
    funnel_table = Table(funnel_data, colWidths=[100, 75, 235, 90])
    funnel_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EEF2FF")),
        ('TEXTCOLOR', (0,0), (-1,0), primary),
        ('GRID', (0,0), (-1,-1), 0.5, border_col),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story_elem.append(funnel_table)
    story_elem.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 2: COMPLETE TECH STACK & JUSTIFICATIONS
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Paragraph("2. Complete Tech Stack & Architectural Justifications", h1_style))
    story_elem.append(HRFlowable(width="100%", thickness=0.75, color=border_col, spaceBefore=2, spaceAfter=8))
    story_elem.append(Paragraph("When an interviewer asks <i>'Why did you choose this technology?'</i>, provide these battle-tested, concise responses:", body_style))

    tech_data = [
        [Paragraph("<b>Component</b>", body_bold), Paragraph("<b>Technology</b>", body_bold), Paragraph("<b>Interview Defense Answer (1-2 Sentences)</b>", body_bold)],
        [
            Paragraph("Backend Framework", body_style),
            Paragraph("Java 17 / Spring Boot 3.2", body_style),
            Paragraph("<i>'Spring Boot provides enterprise-grade thread pooling, dependency injection, and declarative transaction management critical for high-throughput banking systems.'</i>", body_style)
        ],
        [
            Paragraph("Machine Learning", body_style),
            Paragraph("Python 3.11 / FastAPI", body_style),
            Paragraph("<i>'FastAPI provides native ASGI async event loops with Pydantic validation, offering near-C++ network throughput while accessing Python's mature ML ecosystem.'</i>", body_style)
        ],
        [
            Paragraph("ML Algorithms", body_style),
            Paragraph("XGBoost + Isolation Forest", body_style),
            Paragraph("<i>'XGBoost provides superior accuracy on labeled tabular data, while Isolation Forest catches novel zero-day anomalies that didn't exist in training callsets.'</i>", body_style)
        ],
        [
            Paragraph("Database", body_style),
            Paragraph("PostgreSQL + Flyway", body_style),
            Paragraph("<i>'PostgreSQL guarantees strict ACID compliance and row-level locking for financial ledgers; Flyway ensures version-controlled, repeatable schema migrations.'</i>", body_style)
        ],
        [
            Paragraph("Cache & Rate Limit", body_style),
            Paragraph("Redis (Lettuce Driver)", body_style),
            Paragraph("<i>'Redis delivers sub-millisecond atomic key-value increments for sliding-window rate limiters and user transaction velocity tracking outside JVM heap memory.'</i>", body_style)
        ],
        [
            Paragraph("Frontend Shell", body_style),
            Paragraph("Next.js 14 (App Router)", body_style),
            Paragraph("<i>'Next.js 14 App Router gives us Server-Side Rendering (SSR) for instant first paint, combined with strict TypeScript contracts matching backend DTO schemas.'</i>", body_style)
        ],
        [
            Paragraph("Security & Auth", body_style),
            Paragraph("Spring Security + JJWT", body_style),
            Paragraph("<i>'Stateless JWT with HMAC-SHA256 signatures eliminates server session clustering bottlenecks while enforcing fine-grained Role-Based Access Control (RBAC).'</i>", body_style)
        ],
    ]
    tech_table = Table(tech_data, colWidths=[95, 110, 295])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EEF2FF")),
        ('GRID', (0,0), (-1,-1), 0.5, border_col),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story_elem.append(tech_table)
    story_elem.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 3: SYSTEM ARCHITECTURE & END-TO-END WORKFLOW
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Paragraph("3. System Architecture & End-to-End Workflow", h1_style))
    story_elem.append(HRFlowable(width="100%", thickness=0.75, color=border_col, spaceBefore=2, spaceAfter=8))

    story_elem.append(Paragraph("<b>The Life of a Transaction Request (Step-by-Step Execution):</b>", h2_style))
    steps = [
        "<b>1. Gateway Ingestion:</b> Core banking upstream calls <code>POST /api/v1/transactions/evaluate</code> with an <code>X-API-KEY</code> header and JSON payload containing user ID, card hash, merchant name, amount, location, and device details.",
        "<b>2. Rate Limiting Check:</b> <code>RateLimitService</code> checks the client IP / API key against a 60-second sliding-window counter in Redis (or ConcurrentHashMap fallback). If rate > 5,000 req/min, it rejects immediately with HTTP 429.",
        "<b>3. Static Rule Engine:</b> <code>RuleEngine.java</code> evaluates active business rules from <code>FraudRuleRepository</code> (e.g. user hourly velocity, blacklisted merchant categories, high-risk destination countries).",
        "<b>4. Parallel ML Inference:</b> <code>TransactionService.java</code> calls the FastAPI microservice via connection-pooled <code>RestTemplate</code> (500ms connect, 1500ms read timeout). The ML service runs XGBoost + Isolation Forest, outputting a risk score (0-100), confidence percentage, and top explainability weights.",
        "<b>5. Hybrid Decision Synthesis:</b> The final risk score is computed: <code>finalScore = max(mlScore, rulePenalty)</code>. The score is evaluated against dynamic thresholds from <code>SystemConfig</code>: <code>APPROVED</code> (<30), <code>MANUAL_REVIEW</code> (30-70), or <code>REJECTED</code> (>70).",
        "<b>6. ACID Persistence & Audit Log:</b> Inside a <code>@Transactional</code> boundary, the transaction, explainability factors JSON, and initial audit log entries are saved to PostgreSQL. If high risk, a <code>SystemAlert</code> is created.",
        "<b>7. Synchronous Gateway Response:</b> The client receives HTTP 200 with decision and transaction ID in under 150 milliseconds.",
        "<b>8. Human Adjudication (If Flagged):</b> An analyst views the transaction in Next.js 14, inspects SHAP factor bars, and submits an approval or rejection with justification notes via <code>POST /api/v1/transactions/{id}/review</code>."
    ]
    for step in steps:
        story_elem.append(Paragraph(step, body_style))

    story_elem.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 4: CORE FEATURES & CODE MAP
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Paragraph("4. Core Features & Codebase File Map", h1_style))
    story_elem.append(HRFlowable(width="100%", thickness=0.75, color=border_col, spaceBefore=2, spaceAfter=8))

    file_map_data = [
        [Paragraph("<b>Feature Module</b>", body_bold), Paragraph("<b>Key Source Files</b>", body_bold), Paragraph("<b>Core Responsibilities</b>", body_bold)],
        [
            Paragraph("Transaction Ingestion & Orchestration", body_style),
            Paragraph("<code>TransactionController.java</code><br/><code>TransactionService.java</code>", code_style),
            Paragraph("Validates payloads, coordinates parallel calls to ML service, evaluates business rules, commits DB transactions.", body_style)
        ],
        [
            Paragraph("Dynamic Rule Engine", body_style),
            Paragraph("<code>RuleEngine.java</code><br/><code>FraudDetectionRule.java</code>", code_style),
            Paragraph("Executes velocity, amount, and geolocation heuristics loaded from PostgreSQL without requiring app restarts.", body_style)
        ],
        [
            Paragraph("ML Inference & Explainability", body_style),
            Paragraph("<code>app/main.py</code><br/><code>services/ml_service.py</code>", code_style),
            Paragraph("Vectorized feature extraction, XGBoost classification, Isolation Forest anomaly scoring, and SHAP factor decomposition.", body_style)
        ],
        [
            Paragraph("Stateless Authentication", body_style),
            Paragraph("<code>JwtService.java</code><br/><code>SecurityConfig.java</code>", code_style),
            Paragraph("HMAC-SHA256 JWT generation/verification, SecurityFilterChain, and real-time active status revocation check.", body_style)
        ],
        [
            Paragraph("Rate Limiting", body_style),
            Paragraph("<code>RateLimitService.java</code>", code_style),
            Paragraph("Sliding-window rate limiting with Redis implementation and local thread-safe ConcurrentHashMap fallback.", body_style)
        ],
        [
            Paragraph("Human Adjudication Portal", body_style),
            Paragraph("<code>app/dashboard/*</code><br/><code>app/admin/*</code>", code_style),
            Paragraph("Next.js 14 App Router, live sparklines, explainability detail view, review adjudication modal, zero raw emojis.", body_style)
        ]
    ]
    file_map_table = Table(file_map_data, colWidths=[110, 150, 240])
    file_map_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EEF2FF")),
        ('GRID', (0,0), (-1,-1), 0.5, border_col),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story_elem.append(file_map_table)
    story_elem.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 5: DATABASE SCHEMA & DATA MODELING
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Paragraph("5. Database Schema & Data Modeling", h1_style))
    story_elem.append(HRFlowable(width="100%", thickness=0.75, color=border_col, spaceBefore=2, spaceAfter=8))

    schema_data = [
        [Paragraph("<b>Table Name</b>", body_bold), Paragraph("<b>Key Columns & Types</b>", body_bold), Paragraph("<b>Constraints & Indexing Rationale</b>", body_bold)],
        [
            Paragraph("<code>transactions</code>", code_style),
            Paragraph("<code>transaction_id</code> (PK, VARCHAR)<br/><code>user_id</code> (VARCHAR)<br/><code>amount</code> (DECIMAL 15,2)<br/><code>fraud_score</code> (INT)<br/><code>transaction_status</code> (VARCHAR)<br/><code>factors_json</code> (TEXT)", code_style),
            Paragraph("Primary key indexed for O(1) lookups. Composite index on <code>(user_id, created_at)</code> for sub-10ms user velocity checks. Index on <code>created_at</code> for dashboard aggregation.", body_style)
        ],
        [
            Paragraph("<code>app_users</code>", code_style),
            Paragraph("<code>id</code> (PK, BIGINT)<br/><code>email</code> (UK, VARCHAR)<br/><code>password_hash</code> (VARCHAR)<br/><code>role</code> (VARCHAR)<br/><code>is_active</code> (BOOLEAN)", code_style),
            Paragraph("Unique constraint on email. Checked by <code>JwtAuthenticationFilter</code> on every authenticated request to immediately block deactivated users.", body_style)
        ],
        [
            Paragraph("<code>system_alerts</code>", code_style),
            Paragraph("<code>id</code> (PK, BIGINT)<br/><code>alert_type</code> (VARCHAR)<br/><code>severity</code> (VARCHAR)<br/><code>status</code> (VARCHAR)<br/><code>transaction_id</code> (FK)", code_style),
            Paragraph("Foreign key to <code>transactions</code>. Filtered by <code>status='ACTIVE'</code> for the real-time operational incident feed.", body_style)
        ],
        [
            Paragraph("<code>system_config</code>", code_style),
            Paragraph("<code>config_key</code> (UK, VARCHAR)<br/><code>config_value</code> (VARCHAR)<br/><code>data_type</code> (VARCHAR)", code_style),
            Paragraph("Stores threshold boundaries (<code>auto_approval_threshold</code>, etc.). Loaded into memory cache to allow dynamic threshold updates without service redeployment.", body_style)
        ],
        [
            Paragraph("<code>audit_logs</code>", code_style),
            Paragraph("<code>id</code> (PK, BIGINT)<br/><code>action_type</code> (VARCHAR)<br/><code>actor_id</code> (VARCHAR)<br/><code>old_value</code>, <code>new_value</code> (VARCHAR)", code_style),
            Paragraph("Immutable compliance log tracking state transitions (e.g. PENDING -> APPROVED) and human overrides for audit verification.", body_style)
        ]
    ]
    schema_table = Table(schema_data, colWidths=[90, 190, 220])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EEF2FF")),
        ('GRID', (0,0), (-1,-1), 0.5, border_col),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg])
    ]))
    story_elem.append(schema_table)
    story_elem.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 6: CHALLENGES, EDGE CASES & BOTTLENECKS
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Paragraph("6. Challenges, Edge Cases & Decisions Handled", h1_style))
    story_elem.append(HRFlowable(width="100%", thickness=0.75, color=border_col, spaceBefore=2, spaceAfter=8))

    challenges = [
        ("Lombok @Builder Default Field Erasure:",
         "When Lombok's <code>@Builder</code> is applied to an entity, fields with inline default values (like <code>private boolean isActive = true;</code>) get erased and initialized to Java defaults (<code>false</code>). In our project, new users were being created as deactivated, locking them out immediately. <b>Resolution:</b> Annotated all initialized fields with <code>@Builder.Default</code> and wrote automated test coverage in <code>AdminServiceTest</code>."),
        
        ("Socket Starvation & TIME_WAIT Leak Under Load:",
         "Using standard unpooled HTTP clients resulted in socket starvation under 500 TPS because every HTTP call opened a new TCP handshake, quickly consuming ephemeral ports. <b>Resolution:</b> Configured a connection-pooled <code>RestTemplate</code> backed by Apache <code>PoolingHttpClientConnectionManager</code> with 200 max connections, a 500ms connect timeout, and a 1500ms read timeout in <code>WebConfig.java</code>."),
        
        ("Next.js Server-Side Rendering (SSR) Hydration Mismatch:",
         "Rendering dynamic time (<code>new Date().toLocaleTimeString()</code>) in Next.js App Router caused hydration errors because the server-rendered HTML timestamp differed from the client browser timestamp 2 seconds later. <b>Resolution:</b> Implemented a <code>mounted</code> state guard with <code>suppressHydrationWarning</code> to guarantee identical initial DOM trees during hydration."),
        
        ("Concurrency at 10,000 Simultaneous Requests (What Breaks & How to Scale):",
         "1. <i>HikariCP Database Pool Exhaustion:</i> Default 10 connections would block under high concurrency. <b>Scale:</b> Increase Hikari pool size to 50, add read replicas for reporting queries, and buffer ingest writes via partitioned Apache Kafka.<br/>"
         "2. <i>In-Memory Rate Limiting:</i> Single-node ConcurrentHashMap scales linearly in heap size. <b>Scale:</b> Switch to distributed Redis cluster sliding-logs.<br/>"
         "3. <i>ML CPU Saturation:</i> Python GIL can bottleneck on CPU. <b>Scale:</b> Export trained models to ONNX runtime or NVIDIA Triton server in C++ for GPU-accelerated 5ms inference.")
    ]
    for title, desc in challenges:
        story_elem.append(Paragraph(f"<b>{title}</b>", h2_style))
        story_elem.append(Paragraph(desc, body_style))

    story_elem.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # SECTION 7: FRESHER INTERVIEW DEFENSE KIT
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Paragraph("7. Fresher Interview Defense Kit", h1_style))
    story_elem.append(HRFlowable(width="100%", thickness=0.75, color=border_col, spaceBefore=2, spaceAfter=8))

    story_elem.append(Paragraph("<b>The 90-Second Elevator Pitch (Memorize and Practice):</b>", h2_style))
    pitch_text = (
        "<i>\"For my major project, I engineered <b>FraudShield</b>, a real-time financial fraud detection and adjudication platform designed for banks and payment gateways.<br/><br/>"
        "The core problem we solved is that traditional rule-based systems are too rigid, while purely ML-based systems lack explainability and cause high false-positive rates. I designed a hybrid architecture: incoming transactions hit a Spring Boot microservice where they undergo sliding-window rate limiting. The transaction is then evaluated in parallel by a business rules engine and an asynchronous Python FastAPI machine learning service running XGBoost and Isolation Forest models.<br/><br/>"
        "The system computes a composite risk score from 0 to 100 in under 150 milliseconds. Scores below 30 are auto-approved, scores above 70 are blocked, and borderline transactions are routed to a human review queue. On the frontend, I built a responsive Next.js 14 dashboard using TypeScript and Tailwind CSS, where fraud analysts can inspect feature explainability factors, review transactions, and adjust risk thresholds dynamically.<br/><br/>"
        "Through this project, I gained deep hands-on experience with microservice communication, connection pooling, database migrations with Flyway, and securing endpoints using stateless JWT authentication.\"</i>"
    )
    pitch_box = Table([[Paragraph(pitch_text, callout_style)]], colWidths=[500])
    pitch_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86EFAC")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story_elem.append(pitch_box)
    story_elem.append(Spacer(1, 14))

    story_elem.append(Paragraph("<b>Top 10 Senior Interview Questions & Crisp Model Answers:</b>", h2_style))
    qa_list = [
        ("Q1: Why separate the ML service into Python and the backend into Java?",
         "Java and Spring Boot excel at multi-threaded transactional I/O, ACID persistence, and enterprise security. Python is the native environment for data science and ML libraries (XGBoost, Scikit-learn). Separating them into microservices allows scaling compute-heavy ML inference independently from I/O-heavy database workloads."),
        
        ("Q2: How do you guarantee the fraud decision takes less than 200ms?",
         "We optimize every stage: 1) The HTTP client uses pre-warmed connection pooling with strict 500ms connect and 1500ms read timeouts; 2) The ML service keeps models loaded in memory; 3) Database lookups use composite indexes (transaction_id, user_id + created_at); 4) If the ML service times out, a circuit breaker falls back to the static rules engine to prevent customer wait times."),
        
        ("Q3: How does your JWT authentication handle deactivated accounts in real time?",
         "Stateless JWTs normally remain valid until expiration. In FraudShield, our JwtAuthenticationFilter extracts the claims and performs a lightweight indexed check: user.getIsActive(). If an admin deactivates an account, access is rejected immediately on the very next request without needing token blacklists."),
        
        ("Q4: What is the difference between XGBoost and Isolation Forest in your pipeline?",
         "XGBoost is a supervised ensemble model trained on labeled historical fraud to recognize known attack patterns (e.g., velocity spikes). Isolation Forest is an unsupervised tree model that isolates anomalies by randomly partitioning features; it does not require labels and catches novel zero-day attacks that have never been seen before."),
        
        ("Q5: What is Flyway, and why not use hibernate.hbm2ddl.auto = update?",
         "Using ddl-auto=update in production risks silent table locks and data corruption during non-backward-compatible column changes. Flyway treats database migrations as versioned code (V1__init_schema.sql). Migrations execute sequentially, idempotently, and are logged in flyway_schema_history."),
        
        ("Q6: How does your sliding-window rate limiter work?",
         "A fixed window resets at fixed clock intervals, permitting 2x traffic bursts at the boundary. A sliding window evaluates a rolling 60-second window. Incoming request timestamps are recorded in a thread-safe deque or Redis sorted set; timestamps older than 60 seconds are evicted, and requests exceeding the threshold receive HTTP 429."),
        
        ("Q7: What is an N+1 query problem, and how did you prevent it?",
         "An N+1 problem occurs when fetching N parent rows triggers N additional queries for child relationships (e.g. AuditLog). We prevented this by using explicit JOIN FETCH queries in Spring Data JPA and avoiding eager fetching on collection fields in favor of indexed pagination."),
        
        ("Q8: What happens if the Python ML microservice crashes?",
         "The HTTP call in TransactionService is wrapped in a resilient try-catch. If the ML microservice is unreachable or times out, the system triggers a SERVICE_DOWN system alert and gracefully falls back to the local RuleEngine to score the transaction heuristically, ensuring zero downtime for payment gateways."),
        
        ("Q9: What was the Next.js hydration error you encountered?",
         "The navigation bar displayed a live clock. The server pre-rendered the page at timestamp T1, but the browser hydrated it at T2. React detected the text mismatch and threw a hydration error. I resolved it using a mounted state hook and suppressHydrationWarning, ensuring static SSR output on initial load and dynamic ticking post-mount."),
        
        ("Q10: How would you scale FraudShield to 50,000 transactions per second?",
         "1) Place an API gateway (e.g., Kong) in front and publish transactions directly to partitioned Kafka topics; 2) Scale stateless Spring Boot worker pods horizontally in Kubernetes; 3) Export XGBoost models to ONNX runtime / C++ Triton server for GPU-accelerated 5ms inference; 4) Shard PostgreSQL by user_id or migrate to CockroachDB.")
    ]

    for q, a in qa_list:
        story_elem.append(Paragraph(q, q_style))
        story_elem.append(Paragraph(a, ans_style))

    story_elem.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────────────────────
    # HARDEST BUGS / CONTRIBUTION SCENARIOS
    # ─────────────────────────────────────────────────────────────────────────────
    story_elem.append(Paragraph("<b>'What Was the Hardest Bug You Fixed?' (Interview Stories):</b>", h2_style))
    
    story_a = (
        "<b>Scenario 1: The Silent Account Lockout (Lombok @Builder.Default)</b><br/>"
        "<i>\"While testing user provisioning, newly created analysts couldn't log in despite correct credentials. In PostgreSQL, I found is_active was saved as false despite having private boolean isActive = true in Java. I discovered that Lombok's @Builder bypasses inline field initializers unless @Builder.Default is specified. I fixed this across all entities and added automated tests in AdminServiceTest to prevent regression.\"</i>"
    )
    story_elem.append(Paragraph(story_a, body_style))
    story_elem.append(Spacer(1, 6))

    story_b = (
        "<b>Scenario 2: Ephemeral Socket Starvation Under Load</b><br/>"
        "<i>\"During high-throughput testing, Spring Boot threw connection timeouts to the ML service after ~2,000 requests. Running netstat revealed thousands of sockets stuck in TIME_WAIT. The code was instantiating a new RestTemplate per request. I replaced it with a singleton RestTemplate backed by Apache PoolingHttpClientConnectionManager with strict connection pooling and timeouts.\"</i>"
    )
    story_elem.append(Paragraph(story_b, body_style))

    # Build Document
    doc.build(story_elem, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == '__main__':
    target = os.path.join(r"c:\Users\DELL\Downloads\fraudShield-main\fraudShield-main", "FraudShield_Complete_Interview_Guide.pdf")
    build_pdf(target)
