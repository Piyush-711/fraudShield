# App Flow Document
## AI-Powered Real-Time Fraud Detection System

---

## 1. User Roles & Access Flows

### Role Hierarchy
```
┌─────────────────────────────────────────┐
│  System Admin                           │
│  - Full system access                   │
│  - User management                      │
│  - All dashboards                       │
│  - System settings                      │
└─────────────────────────────────────────┘
                    ↑
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   ┌────────┐  ┌──────────┐  ┌─────────────┐
   │ Analyst│  │Data      │  │Notification │
   │Viewer  │  │Scientist │  │Admin        │
   └────────┘  └──────────┘  └─────────────┘
        ↑           ↑           ↑
        │           │           │
   ┌──────────────────────────────────────┐
   │ Analyst Reviewer                     │
   │ - Can override fraud decisions       │
   │ - Can review transactions            │
   │ - Can acknowledge alerts             │
   └──────────────────────────────────────┘
```

---

## 2. Login & Authentication Flow

### Screen: Login Page
**URL:** `/auth/login`
**Accessible to:** All unauthenticated users

#### Layout
```
┌────────────────────────────────────┐
│                                    │
│     FraudShield Logo               │
│                                    │
│     Email: [________________]      │
│     Password: [______________]     │
│                                    │
│     [Login Button]                 │
│     Forgot Password? | Sign Up     │
│                                    │
│     © 2026 FraudShield. All rights │
│     reserved.                      │
│                                    │
└────────────────────────────────────┘
```

#### User Actions
1. **Enter Email:** Type email address
2. **Enter Password:** Type password
3. **Click Login:**
   - **Success:** Redirect to Dashboard
   - **Invalid Credentials:** Show error banner "Invalid email or password"
   - **Account Locked:** Show error "Account locked. Contact admin."
   - **User Inactive:** Show error "Your account is inactive"
   - **Network Error:** Show error "Connection failed. Please try again."

4. **Click Forgot Password:** Redirect to `/auth/forgot-password`

#### Error States
- **Empty Email:** Show validation "Email is required"
- **Invalid Email Format:** Show validation "Please enter a valid email"
- **Empty Password:** Show validation "Password is required"

#### Loading State
- Show spinner, disable Login button
- Display "Authenticating..." message

---

## 3. Main Dashboard Flow (Risk Analyst)

### Screen: Dashboard Landing Page
**URL:** `/dashboard`
**Required Role:** ANALYST or higher
**Redirect if not authenticated:** → `/auth/login`

#### Layout (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│ Logo     | User: john@bank.com  Settings | Logout           │
├─────────────────────────────────────────────────────────────┤
│ ├─ Transactions                                             │
│ ├─ Alerts                                                   │
│ ├─ Reports                                                  │
│ ├─ Admin                                                    │
│ └─ Settings                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dashboard > Overview                              [Refresh] │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Total Trans  │  │ Fraud Rate   │  │ P95 Latency  │     │
│  │ 5,420        │  │ 2.34%        │  │ 187ms        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Transaction Volume (Last 24h)                          │ │
│  │                                                         │ │
│  │ 5000|          ╱╲      ╱╲                             │ │
│  │ 4000|  ╱╲    ╱  ╲    ╱  ╲    ╱╲                      │ │
│  │ 3000| ╱  ╲  ╱    ╲  ╱    ╲  ╱  ╲  ╱╲                 │ │
│  │ 2000│╱    ╲╱      ╲╱      ╲╱    ╲╱  ╲                │ │
│  │ 1000│                           ╱ ╲╱ ╲              │ │
│  │    0└────────────────────────────────────             │ │
│  │     00:00  06:00  12:00  18:00  24:00                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Fraud Detection Rate (Last 24h)                        │ │
│  │                                                         │ │
│  │ 96%|                    ────────────                   │ │
│  │ 95%|────────────────────        ────────────          │ │
│  │ 94%|                                                   │ │
│  │ 93%└────────────────────────────────────────           │ │
│  │     00:00  06:00  12:00  18:00  24:00                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Recent Frauds Detected - High Risk                     │ │
│  │ [View All]                                             │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ TXN_001   $5,200   Amazon    Risk: 92  [Review]      │ │
│  │ TXN_002   $12,500  Jewelry   Risk: 88  [Review]      │ │
│  │ TXN_003   $3,400   Hotel     Risk: 85  [Review]      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Components

**Top Navigation Bar**
- Logo (click → Home)
- User dropdown (Settings, Logout)
- System status indicator (Green: All Good, Yellow: Warnings, Red: Issues)

**Sidebar Navigation**
- Transactions (icon + label)
- Alerts (icon + label + unread count badge)
- Reports (icon + label)
- Admin (icon + label) - Only for ADMIN role
- Settings (icon + label)

**Metric Cards** (4 cards)
1. **Total Transactions:** Big number with trend arrow (↑ 12% vs yesterday)
2. **Fraud Rate:** Big percentage with trend (↓ 0.5%)
3. **P95 Latency:** Time value with status (Good if <200ms, Warning if 200-500ms, Bad if >500ms)
4. **False Positive Rate:** Percentage with status

**Charts**
1. **Transaction Volume:** Line chart, 24h, hourly data
2. **Fraud Detection Rate:** Line chart, 24h, hourly data, with target line at 95%
3. **Recent High-Risk Transactions:** Table with ID, Amount, Merchant, Risk Score, Action button

#### User Actions

**Click on Transaction in Recent List:**
- Navigate to → `/dashboard/transactions/{transactionId}`

**Click "View All" in Recent Frauds:**
- Navigate to → `/dashboard/transactions?filter=high_risk`

**Click Refresh Button:**
- Reload all charts and cards
- Show loading state for 1-2 seconds

**Click Alerts Dropdown:**
- Show mini list of unacknowledged alerts
- Click alert → Navigate to `/dashboard/alerts/{alertId}`

**Click on Metric Card:**
- Drill into detailed view for that metric

**Auto-Refresh:**
- Dashboard auto-refreshes every 10 seconds
- Show "Last updated: 10:34 AM" timestamp

---

## 4. Transaction List View

### Screen: Transactions List
**URL:** `/dashboard/transactions`
**Params:** `?status=PENDING&sort=-created_at&page=1&risk_level=HIGH`

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard > Transactions                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Filters:                                                     │
│ [Status: PENDING ▼]  [Risk Level: ALL ▼]  [Date Range ▼]  │
│ [Search: ________________] [Export as CSV] [Clear Filters]  │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ ID         │Amount  │Merchant  │Risk  │Status  │Action   ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ TXN_001    │$5,200  │Amazon    │92    │PENDING │[Review] ││
│ │ TXN_002    │$12,500 │Jewelry   │88    │PENDING │[Review] ││
│ │ TXN_003    │$3,400  │Hotel     │85    │PENDING │[Review] ││
│ │ TXN_004    │$250    │Walmart   │15    │APPROVED│[View]   ││
│ │ TXN_005    │$89     │Starbucks │8     │APPROVED│[View]   ││
│ │ TXN_006    │$7,800  │Electronic│87    │REJECTED│[View]   ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Showing 6 of 2,540 transactions                             │
│ [< Previous]  [1] [2] [3] ... [Next >]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Columns
1. **ID:** Transaction ID (clickable)
2. **Amount:** Money with currency symbol
3. **Merchant:** Merchant name
4. **Risk Score:** Numeric 0-100 with color (Red if >70, Yellow if 40-70, Green if <40)
5. **Status:** PENDING, APPROVED, REJECTED, MANUAL_REVIEW (with icon)
6. **Action:** Button to view/review

#### Filter Options
- **Status Dropdown:** All, Pending, Approved, Rejected, Manual Review
- **Risk Level Dropdown:** All, High (>70), Medium (40-70), Low (<40)
- **Date Range:** Last 24h, Last 7 days, Last 30 days, Custom
- **Search:** Search by transaction ID, user ID, merchant name
- **Clear Filters:** Reset all filters

#### User Actions

**Click on Transaction Row:**
- Navigate to → `/dashboard/transactions/{transactionId}`

**Click [Review] Button:**
- Navigate to → `/dashboard/transactions/{transactionId}/review`

**Change Status Filter:**
- Reload table with filtered results
- Show "Loading..." message

**Enter Search Term:**
- Auto-search after 500ms debounce
- Show results in real-time

**Change Pagination:**
- Reload table with new page
- Scroll to top of table

**Click Export CSV:**
- Download all transactions matching current filters as CSV
- Filename: `transactions_export_2026-06-15.csv`

#### Empty State
```
┌──────────────────────────────────────┐
│  No transactions found               │
│                                      │
│  Try adjusting your filters or       │
│  check back later                    │
│                                      │
│  [Clear Filters] [Go to Dashboard]  │
└──────────────────────────────────────┘
```

#### Loading State
- Show skeleton loaders for table rows
- Display "Loading transactions..." message
- Disable pagination

---

## 5. Transaction Detail & Review Flow

### Screen: Transaction Detail View
**URL:** `/dashboard/transactions/{transactionId}`

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard > Transactions > TXN_001                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Status: PENDING | Risk Score: 92 | Confidence: 94%         │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TRANSACTION DETAILS                                     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Transaction ID:     TXN_001                             │ │
│ │ Timestamp:          2026-06-15 14:30:45 UTC            │ │
│ │ Amount:             $5,200.00 USD                       │ │
│ │ User ID:            USER_12345                          │ │
│ │ User Email:         customer@gmail.com                  │ │
│ │ Merchant:           Amazon.com (Code: 5411)             │ │
│ │ Merchant Category:  Shopping                            │ │
│ │ Card Last 4:        1234                                │ │
│ │ Card Type:          Visa Credit                         │ │
│ │ Location:           San Francisco, CA, USA              │ │
│ │ Device Type:        Mobile (iOS)                        │ │
│ │ IP Address:         192.168.1.100                       │ │
│ │ Processing Time:    87ms                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ FRAUD DETECTION RESULT                                  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Model Decision:     REJECT (High Risk)                  │ │
│ │ Risk Score:         92/100                              │ │
│ │ Confidence:         94%                                 │ │
│ │ Model Version:      v2.1.0                              │ │
│ │                                                          │ │
│ │ Risk Factors:                                           │ │
│ │ 1. High Amount (Weight: 0.35) - Amount 8x higher than  │ │
│ │    user's average $650 transactions                     │ │
│ │ 2. Unusual Merchant (Weight: 0.28) - First time buying │ │
│ │    from this merchant                                   │ │
│ │ 3. Time Anomaly (Weight: 0.22) - Transaction at 2:30 AM│ │
│ │    (user usually shops 10 AM - 6 PM)                   │ │
│ │ 4. Location Mismatch (Weight: 0.15) - Transaction in   │ │
│ │    different city than usual                           │ │
│ │                                                          │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ AUDIT HISTORY                                           │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 2026-06-15 14:30:45 - Initial ML Decision: REJECT      │ │
│ │ 2026-06-15 14:31:10 - Alert Sent to analyst_456        │ │
│ │ 2026-06-15 14:35:22 - Manual Review by analyst_456     │ │
│ │                       Decision: APPROVE                 │ │
│ │                       Reason: Verified by phone call    │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [< Back to Transactions]  [Review Transaction]  [Export]   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### User Actions

**Click [Review Transaction] Button:**
- Navigate to → `/dashboard/transactions/{transactionId}/review`

**Click [Export] Button:**
- Download transaction details as PDF
- Filename: `transaction_TXN_001_detail.pdf`

**Click [< Back] Button:**
- Navigate back to → `/dashboard/transactions`

---

### Screen: Manual Review Form
**URL:** `/dashboard/transactions/{transactionId}/review`
**Required Role:** ANALYST_REVIEWER or ADMIN

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard > Transactions > TXN_001 > Review                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ STATUS: PENDING REVIEW                                      │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TRANSACTION SUMMARY                                     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Amount: $5,200 | Merchant: Amazon | Risk: 92           │ │
│ │ ML Decision: REJECT | Your Decision: ?                  │ │
│ │ Factors: High Amount, Unusual Merchant, Time Anomaly   │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ YOUR DECISION                                           │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                          │ │
│ │ Decision: ○ Approve  ○ Reject  ○ Manual Review (Wait)  │ │
│ │                                                          │ │
│ │ Reason: [___________________________________________]  │ │
│ │         (Required - 10 characters minimum)             │ │
│ │                                                          │ │
│ │ Notes (Optional):                                       │ │
│ │ [___________________________________________]         │ │
│ │ [___________________________________________]         │ │
│ │ [___________________________________________]         │ │
│ │                                                          │ │
│ │ ☐ I confirm this is my decision                        │ │
│ │ ☐ Contact customer to verify                           │ │
│ │ ☐ Flag for fraud investigation team                    │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Submit Review]  [Cancel]  [Save Draft]                    │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ RECENT ACTIVITY                                         │ │
│ │ 14:35 - ML Fraud Detection Alert triggered              │ │
│ │ 14:36 - You viewed this transaction                     │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Form Fields

1. **Decision (Radio Buttons - Required)**
   - Approve - Override ML and approve transaction
   - Reject - Confirm ML decision to reject
   - Manual Review - Escalate to fraud investigation team

2. **Reason (Text Input - Required)**
   - Minimum 10 characters
   - Examples: "Verified by phone call", "Customer confirmed legitimate", "Match with stored patterns"

3. **Notes (Text Area - Optional)**
   - Additional context
   - Customer communication notes

4. **Checkboxes**
   - "I confirm this is my decision" (Required to submit)
   - "Contact customer to verify" (Optional)
   - "Flag for fraud investigation team" (Optional)

#### User Actions

**Select Approve:**
- Enable Reason field
- Highlight "Approve" button suggestion in green

**Select Reject:**
- Enable Reason field
- Highlight "Reject" button suggestion in red

**Select Manual Review:**
- Enable Reason field
- Show note: "This will escalate to fraud investigation team"

**Enter Reason:**
- Show character count (e.g., "15 / 500 characters")
- Enable Confirm checkbox only after minimum length reached

**Click Submit Review:**
- **If all required fields filled:**
  - Show loading spinner
  - Disable Submit button
  - After success: Show success message "Review submitted successfully"
  - Redirect to `/dashboard/transactions` after 2 seconds
  - Show toast notification: "Transaction updated to [DECISION]"

- **If validation fails:**
  - Highlight empty required fields in red
  - Show error message: "Please fill in all required fields"

**Click Cancel:**
- Navigate back to → `/dashboard/transactions/{transactionId}`
- Show confirmation: "Are you sure? Your review will not be saved." with [Yes, Go Back] [No, Stay]

**Click Save Draft:**
- Save review as draft
- Show success message: "Draft saved at 14:45"
- Allow returning and editing later

#### Success State (After Submission)
```
┌────────────────────────────────────┐
│ ✓ Review submitted successfully    │
│                                    │
│ Decision: APPROVED                 │
│ Reason: Verified by phone call     │
│ Submitted: 2026-06-15 14:45:30    │
│                                    │
│ Redirecting to transactions... 3s  │
│                                    │
│ [Go Back Now]                      │
└────────────────────────────────────┘
```

#### Error State
```
┌────────────────────────────────────┐
│ ✗ Failed to submit review          │
│                                    │
│ Error: Network connection failed.  │
│                                    │
│ [Retry] [Save Draft] [Discard]    │
└────────────────────────────────────┘
```

---

## 6. Alerts & Notifications Flow

### Screen: Alerts Dashboard
**URL:** `/dashboard/alerts`

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard > Alerts                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Filters: [Status: ALL ▼]  [Severity: ALL ▼]  [Date ▼]     │
│          [Search: ________________]  [Clear All Filters]    │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Alert                         │Type      │Severity│Action ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ 🔴 High Risk Transaction TXN  │FRAUD     │CRITICAL│[View] ││
│ │    High fraud risk detected   │DETECTED  │        │[Mark] ││
│ │    2026-06-15 14:30:45        │          │        │       ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ 🟡 Latency Warning            │PERF      │HIGH    │[View] ││
│ │    P95 latency exceeded 250ms │DEGRADED  │        │[Mark] ││
│ │    2026-06-15 14:28:12        │          │        │       ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ 🟢 Kafka Lag High             │INFRA     │MEDIUM  │[View] ││
│ │    Kafka topic lag > 500ms    │ALERT     │        │[Mark] ││
│ │    2026-06-15 14:25:33        │          │        │       ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Active: 3 | Acknowledged: 12 | Resolved: 45                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Alert Types
- **FRAUD_DETECTED:** High-risk transaction found
- **PERF_DEGRADED:** Latency or throughput issues
- **SERVICE_DOWN:** Service failure
- **INFRA_ALERT:** Infrastructure issues (Kafka lag, Redis connection)
- **SECURITY_ALERT:** Suspicious access patterns

#### User Actions

**Click [View] Button:**
- Navigate to relevant detail page (e.g., transaction if fraud detected)

**Click [Mark] Button:**
- Show dropdown with options: "Acknowledge", "Resolve", "Escalate"
- Acknowledge: Mark as seen, stays in active list
- Resolve: Move to resolved list, hide from active alerts
- Escalate: Send to admin/team, move to queue

**Filter by Status:**
- Active, Acknowledged, Resolved

**Filter by Severity:**
- Critical, High, Medium, Low

**Search Alerts:**
- Search by alert message, transaction ID, etc.

---

## 7. Reports & Export Flow

### Screen: Reports Dashboard
**URL:** `/dashboard/reports`

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard > Reports                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Generate New Report:                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Report Type:    [Daily Summary ▼]                      │ │
│ │ Date Range:     [From ________] [To ________]          │ │
│ │ Include:        ☐ Fraud Summary                        │ │
│ │                 ☐ System Performance                   │ │
│ │                 ☐ Detailed Transactions                │ │
│ │                 ☐ Audit Log                            │ │
│ │ Format:         ○ PDF  ○ CSV  ○ JSON                   │ │
│ │                                                         │ │
│ │ [Generate Report]  [Schedule Report]                   │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Recent Reports:                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Report                      │Date      │Type │Status    ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ Daily Summary - 06/14       │06/14/26  │PDF  │✓ Ready   ││
│ │                             │          │     │[Download]││
│ ├──────────────────────────────────────────────────────────┤│
│ │ Weekly Audit - 06/08-06/14  │06/14/26  │CSV  │✓ Ready   ││
│ │                             │          │     │[Download]││
│ ├──────────────────────────────────────────────────────────┤│
│ │ Monthly Report - June       │In Progress│PDF │⏳ 45%    ││
│ │                             │          │     │[Cancel]  ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Report Types
1. **Daily Summary** - Transactions, fraud detected, performance metrics
2. **Weekly Audit** - All transactions, decisions, manual reviews
3. **Monthly Report** - Trends, statistical analysis, compliance summary
4. **Custom Report** - User-defined date range and sections

#### User Actions

**Click [Generate Report]:**
- Validate all required fields
- Show progress: "Generating report... 25%"
- After completion: Add to Recent Reports list
- Auto-download or show download link

**Click [Download]:**
- Download report in selected format (PDF, CSV, JSON)
- Filename: `report_[type]_[date].pdf`

**Click [Schedule Report]:**
- Open dialog to set recurring schedule
- Options: Daily, Weekly (select day), Monthly (select date)
- Show: "This report will be emailed to you every Monday at 8 AM"

---

## 8. Admin Settings Flow

### Screen: Admin Settings (System Admin Only)
**URL:** `/admin/settings`
**Required Role:** SYSTEM_ADMIN

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Admin > Settings                                            │
├─────────────────────────────────────────────────────────────┤
│ Settings | Users | Models | Deployments | Logs             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ FRAUD DETECTION THRESHOLDS                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Auto-Approval Threshold:  [___20____]  %               │ │
│ │   (Transactions below this are auto-approved)          │ │
│ │                                                          │ │
│ │ Manual Review Threshold:  [___70____]  %               │ │
│ │   (Transactions above this go to manual review)         │ │
│ │                                                          │ │
│ │ Auto-Rejection Threshold: [___85____]  %               │ │
│ │   (Transactions above this are auto-rejected)          │ │
│ │                                                          │ │
│ │ Current Model Version: v2.1.0 [Update Model]           │ │
│ │                                                          │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Threshold Visualization                            │ │ │
│ │ │ 0%                                                  │ │ │
│ │ │ ├──────[20]──────[70]──────────[85]───────────100%│ │ │
│ │ │ └─Auto-Approve ─ Manual Review ─ Auto-Reject ─│ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SYSTEM SETTINGS                                         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Max Transactions/Minute: [____10000____]               │ │
│ │ Max Transactions/User/Hour: [____1000____]             │ │
│ │ Transaction Timeout (ms): [____200____]                │ │
│ │ Kafka Consumer Threads: [____3____]                    │ │
│ │ Redis Cache TTL (hours): [____1____]                   │ │
│ │ Alert Severity Threshold: [HIGH ▼]                     │ │
│ │ Email Notifications: ☑ Enabled                         │ │
│ │ Slack Notifications: ☑ Enabled                         │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Save Changes] [Reset to Defaults] [Cancel]                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### User Actions

**Change Threshold Value:**
- Update field
- Show validation message if invalid (e.g., "Must be between 0 and 100")
- Show threshold visualization in real-time

**Click [Update Model]:**
- Open dialog to upload new model file
- Show current model MD5 hash and upload date
- Validate file (must be .pkl or .joblib)
- Create backup of old model automatically
- Show: "Model updated successfully. Previous version saved as backup."

**Click [Save Changes]:**
- Show confirmation: "Are you sure? These changes will apply immediately."
- Confirm checkbox: "I have tested these settings in staging"
- On success: Show green banner "Settings updated successfully"
- Log change to audit table with admin username

**Click [Reset to Defaults]:**
- Show warning: "This will reset all settings to factory defaults"
- Confirmation required
- Show: "Settings reset to defaults"

---

## 9. User Management Flow

### Screen: User Management
**URL:** `/admin/users`
**Required Role:** SYSTEM_ADMIN

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Admin > Users                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [+ Add New User] [Import from CSV] [Export Users]           │
│                                                              │
│ Search: [________________]  Filter: [Role: ALL ▼]           │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ User         │Email            │Role           │Status  ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ John Doe     │john@bank.com    │ANALYST_REVIEWER│Active ││
│ │              │                 │                │[Edit] ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ Jane Smith   │jane@bank.com    │SYSTEM_ADMIN    │Active ││
│ │              │                 │                │[Edit] ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ Bob Engineer │bob@bank.com     │ANALYST_VIEWER  │Inactive││
│ │              │                 │                │[Edit] ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Showing 3 of 12 users                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### User Actions

**Click [+ Add New User]:**
- Open modal dialog with form:
  - Name (text)
  - Email (email input)
  - Role (dropdown: ANALYST_VIEWER, ANALYST_REVIEWER, SYSTEM_ADMIN, DATA_SCIENTIST)
  - Permissions (multi-select checkboxes)
  - Send welcome email (checkbox)
- Click [Create User]
- Show confirmation: "User created successfully. Welcome email sent."

**Click [Edit]:**
- Open modal to edit user:
  - Name
  - Role
  - Permissions
  - Status (Active/Inactive)
- Show [Deactivate User] button for non-admin users
- Show password reset link

**Deactivate User:**
- Confirmation required: "User will lose access immediately"
- Reason (text field, optional)
- After confirmation: Show "User deactivated"

---

## 10. Error Handling Flows

### Network Error
```
┌─────────────────────────────────────────┐
│ ⚠ Connection Lost                       │
│                                         │
│ We're having trouble connecting to      │
│ the server. Please check your           │
│ internet connection.                    │
│                                         │
│ [Retry] [Go Home]                      │
└─────────────────────────────────────────┘
```

### Authentication Error
```
┌─────────────────────────────────────────┐
│ ✗ Session Expired                       │
│                                         │
│ Your session has expired. Please        │
│ log in again to continue.               │
│                                         │
│ [Log In Again]                         │
└─────────────────────────────────────────┘
```

### Permission Error
```
┌─────────────────────────────────────────┐
│ 🔒 Access Denied                        │
│                                         │
│ You don't have permission to access     │
│ this page. Contact your administrator.  │
│                                         │
│ [Go Home]                              │
└─────────────────────────────────────────┘
```

### Server Error
```
┌─────────────────────────────────────────┐
│ ✗ Server Error (500)                    │
│                                         │
│ Something went wrong on our end.        │
│ We've been notified. Please try again   │
│ later.                                  │
│                                         │
│ Error ID: 12345-67890                   │
│                                         │
│ [Retry] [Go Home] [Contact Support]    │
└─────────────────────────────────────────┘
```

---

## 11. Global Navigation & Persistent UI

### Header (All Pages)
```
┌─────────────────────────────────────────────────────────────┐
│ 🛡 FraudShield  |  Dashboard  |  Transactions  |  Alerts    │
│                                     👤 John Doe  |  ⚙ ⏣  │
└─────────────────────────────────────────────────────────────┘
```

### User Dropdown Menu
```
┌────────────────────────────────┐
│ Profile                        │
│ Settings                       │
│ Change Password                │
│ Documentation                  │
│ ─────────────────────────────  │
│ Logout                         │
└────────────────────────────────┘
```

### Notifications Badge
- Shows unacknowledged alert count
- Click to open mini alerts sidebar
- Auto-updates every 10 seconds

---

## 12. Responsive Design - Mobile Flow

### Mobile Dashboard
```
┌──────────────┐
│ ☰ FraudShield│
├──────────────┤
│              │
│ Total Tx:    │
│ 5,420        │
│              │
│ Fraud Rate:  │
│ 2.34%        │
│              │
│ P95 Latency: │
│ 187ms        │
│              │
│ [View Full   │
│  Dashboard]  │
│              │
│ Recent High- │
│ Risk:        │
│              │
│ • TXN_001    │
│   $5,200     │
│   [Review]   │
│              │
│ • TXN_002    │
│   $12,500    │
│   [Review]   │
│              │
└──────────────┘
```

### Mobile Menu (Hamburger)
```
┌──────────────┐
│ ✕            │
├──────────────┤
│ Dashboard    │
│ Transactions │
│ Alerts       │
│ Reports      │
│ Admin        │
│ Settings     │
│ ─────────────│
│ Logout       │
└──────────────┘
```

---

## 13. Summary of All Screens

| Screen | URL | Required Role | Purpose |
|--------|-----|--------------|---------|
| Login | `/auth/login` | Public | User authentication |
| Dashboard | `/dashboard` | ANALYST+ | Overview metrics & charts |
| Transactions List | `/dashboard/transactions` | ANALYST+ | Browse all transactions |
| Transaction Detail | `/dashboard/transactions/{id}` | ANALYST+ | View full transaction details |
| Manual Review | `/dashboard/transactions/{id}/review` | ANALYST_REVIEWER+ | Review & override decision |
| Alerts | `/dashboard/alerts` | ANALYST+ | View and manage alerts |
| Reports | `/dashboard/reports` | ANALYST+ | Generate and export reports |
| Admin Settings | `/admin/settings` | SYSTEM_ADMIN | Configure thresholds & system |
| User Management | `/admin/users` | SYSTEM_ADMIN | Add/edit/remove users |
| System Health | `/admin/health` | SYSTEM_ADMIN | Monitor service health |

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-15  
**Owner:** UX Designer  
**Status:** Ready for Development
