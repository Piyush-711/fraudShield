# UI/UX Design Brief
## AI-Powered Real-Time Fraud Detection System

---

## 1. Design Philosophy & Principles

### Core Design Principles
1. **Trust Through Clarity** - Financial systems demand transparency. Every decision must be clearly explained.
2. **Efficiency First** - Analysts review 100+ transactions per day. Speed and minimal clicks are critical.
3. **Real-Time Readiness** - The dashboard must feel alive with real-time updates. Users should never feel like they're looking at stale data.
4. **Progressive Disclosure** - Show essential info at a glance, hide complexity behind progressive expansion.
5. **Data-Driven Design** - Use visual hierarchy and color to surface what matters most (risk levels, alerts, decisions).
6. **Accessibility First** - WCAG 2.1 AA compliance. Color should never be the only indicator of status.
7. **Consistent Patterns** - Reduce cognitive load with consistent UI patterns across the app.

### Design Goals
- ✅ Users can assess a transaction in <5 seconds
- ✅ Manual review takes <30 seconds per transaction
- ✅ Alerts are immediately visible and actionable
- ✅ No scrolling needed for critical information on desktop
- ✅ Mobile-first responsive design
- ✅ 99% uptime perception (no loading spinners > 2 seconds)

---

## 2. Design System

### Color Palette

#### Primary Colors
- **Indigo 600:** `#4F46E5` - Primary brand color, CTA buttons
- **Indigo 50:** `#F0F4FF` - Light backgrounds, hover states

#### Semantic Colors
- **Success (Green):**
  - Dark: `#10B981` - Approved transactions, active status
  - Light: `#D1FAE5` - Success backgrounds, confirmation states
  
- **Warning (Amber):**
  - Dark: `#F59E0B` - Manual review needed, moderate risk
  - Light: `#FEF3C7` - Warning backgrounds, attention needed
  
- **Danger (Red):**
  - Dark: `#EF4444` - Rejected transactions, critical alerts
  - Light: `#FEE2E2` - Danger backgrounds, rejection states
  
- **Info (Blue):**
  - Dark: `#3B82F6` - Information, neutral alerts
  - Light: `#DBEAFE` - Info backgrounds
  
- **Neutral:**
  - Black: `#1F2937` - Primary text, headings
  - Gray 700: `#374151` - Secondary text
  - Gray 500: `#6B7280` - Tertiary text, placeholders
  - Gray 200: `#E5E7EB` - Borders, dividers
  - Gray 50: `#F9FAFB` - Subtle backgrounds
  - White: `#FFFFFF` - Card backgrounds, main content

#### Dark Mode Colors (Optional - Phase 2)
- Primary: `#818CF8`
- Background: `#111827`
- Surface: `#1F2937`
- Text: `#F3F4F6`

### Color Usage Rules

| Element | Color | Use Case |
|---------|-------|----------|
| **Risk Score 0-20%** | Green (`#10B981`) | Low risk, safe transactions |
| **Risk Score 20-60%** | Amber (`#F59E0B`) | Medium risk, needs review |
| **Risk Score 60-100%** | Red (`#EF4444`) | High risk, likely fraudulent |
| **Approved Status** | Green (`#10B981`) | Final approved decision |
| **Manual Review Status** | Amber (`#F59E0B`) | Waiting analyst decision |
| **Rejected Status** | Red (`#EF4444`) | Final rejected decision |
| **Active Alert** | Red (`#EF4444`) | Immediate attention needed |
| **Acknowledged Alert** | Amber (`#F59E0B`) | Seen but not resolved |
| **Resolved Alert** | Gray (`#6B7280`) | Handled, archived |

**Important Rule:** Never use color alone for status indication. Always include icon + text label.

### Typography

#### Font Family
- **Primary Font:** Inter (Google Fonts)
  - Highly legible, modern, excellent for screens
  - All weights available: 400, 500, 600, 700

#### Font Scales

| Element | Size | Weight | Line-Height | Letter-spacing |
|---------|------|--------|-------------|----------------|
| **H1 - Page Title** | 32px | 700 | 1.2 | -0.02em |
| **H2 - Section Title** | 24px | 600 | 1.3 | -0.01em |
| **H3 - Subsection** | 18px | 600 | 1.4 | 0 |
| **H4 - Card Title** | 16px | 600 | 1.5 | 0 |
| **Body - Large** | 16px | 400 | 1.6 | 0 |
| **Body - Regular** | 14px | 400 | 1.6 | 0 |
| **Label - Medium** | 13px | 500 | 1.5 | 0.5px |
| **Label - Small** | 12px | 500 | 1.4 | 0.5px |
| **Caption** | 12px | 400 | 1.5 | 0 |
| **Mono - Code** | 12px | 400 | 1.6 | 0 |

#### Text Hierarchy Examples

```
Page Title (H1)
Senior analyst views this and immediately knows the context

Card Title (H4)
Supporting information organized in clear sections

Body Text (Regular)
Primary content that users read to understand data

Caption
Supporting meta-information like timestamps
```

### Spacing & Layout

#### Spacing Scale (8px base grid)
```
xs:  4px   (half grid)
sm:  8px   (1 grid)
md: 12px   (1.5 grids)
lg: 16px   (2 grids)
xl: 24px   (3 grids)
2xl: 32px  (4 grids)
3xl: 48px  (6 grids)
```

#### Application to Common Elements
- **Card Padding:** 16px (lg)
- **Section Margin:** 24px (xl)
- **Button Padding:** 8px vertical, 16px horizontal (sm + lg)
- **Sidebar Width:** 280px (fixed)
- **Sidebar to Content Padding:** 24px (xl)
- **Between Form Fields:** 16px (lg)

#### Responsive Breakpoints
```
Mobile:    < 640px    (1 column)
Tablet:    640-1024px (2 columns)
Desktop:   1024+px    (3+ columns, full features)
Ultrawide: 1400+px    (optimized layouts)
```

### Depth & Elevation (Shadows)

| Level | Shadow | Use Case |
|-------|--------|----------|
| **None** | No shadow | Flat backgrounds, same level content |
| **1 (Subtle)** | `0 1px 2px rgba(0,0,0,0.05)` | Borders, subtle separation |
| **2 (Raised)** | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons on hover |
| **3 (Floating)** | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns, popovers |
| **4 (Lifted)** | `0 20px 25px rgba(0,0,0,0.15)` | High-priority modals |

### Border & Radius

| Element | Radius | Rationale |
|---------|--------|-----------|
| **Buttons** | 6px (md) | Modern, approachable |
| **Cards** | 8px (lg) | Softer, premium feel |
| **Inputs** | 6px (md) | Matches buttons |
| **Modals** | 12px (xl) | Strong focal point |
| **Badges** | 4px (sm) | Subtle emphasis |
| **Full Round** | 50% | Icons in circles, avatars |

---

## 3. Component Library

### Button Variants

#### Primary Button
```
State: Default
  - Background: Indigo 600
  - Text: White
  - Shadow: Level 2 on hover
  - Cursor: Pointer

State: Hover
  - Background: Indigo 700
  - Shadow: Level 2

State: Active/Pressed
  - Background: Indigo 800
  - Scale: 98% (subtle animation)

State: Disabled
  - Background: Gray 300
  - Text: Gray 500
  - Cursor: Not-allowed
  - Opacity: 50%

Size: Large (primary CTAs)
  - Padding: 12px 24px
  - Font-size: 16px
  - Height: 44px

Size: Medium (standard)
  - Padding: 10px 16px
  - Font-size: 14px
  - Height: 36px

Size: Small (secondary actions)
  - Padding: 8px 12px
  - Font-size: 12px
  - Height: 28px
```

#### Secondary Button
```
Same as primary but:
  - Background: Gray 100
  - Text: Indigo 600
  - Border: 1px Gray 300
```

#### Danger Button (Approve Override)
```
Same as primary but:
  - Background: Red 600
  - Hover: Red 700
  - Active: Red 800
```

#### Success Button (Approve)
```
Same as primary but:
  - Background: Green 600
  - Hover: Green 700
  - Active: Green 800
```

### Form Elements

#### Text Input
```
Default State:
  - Border: 1px Gray 300
  - Padding: 10px 12px
  - Radius: 6px
  - Font: 14px, Regular

Focus State:
  - Border: 2px Indigo 600
  - Shadow: 0 0 0 3px rgba(79, 70, 229, 0.1)
  - Outline: None

Error State:
  - Border: 2px Red 500
  - Background: Red 50
  - Icon: Red X in right corner

Disabled State:
  - Background: Gray 100
  - Border: 1px Gray 200
  - Color: Gray 400
  - Cursor: Not-allowed
```

#### Dropdown / Select
```
Closed State:
  - Looks like text input
  - Right icon: Chevron down (Gray 500)

Open State:
  - Border: 2px Indigo 600
  - Dropdown menu below with ~200px width
  - Max height: 300px (scrollable)

Menu Items:
  - Padding: 10px 12px
  - Font: 14px
  - Hover: Gray 100 background
  - Active/Selected: Indigo 100 background + checkmark
```

#### Checkbox
```
Unchecked:
  - Border: 2px Gray 300
  - Size: 18x18px
  - Radius: 4px

Checked:
  - Background: Indigo 600
  - Icon: White checkmark
  - Size: 18x18px

Disabled:
  - Background: Gray 200
  - Border: 1px Gray 300
```

#### Radio Button
```
Unchecked:
  - Border: 2px Gray 300
  - Size: 18x18px
  - Border-radius: 50%

Checked:
  - Border: 2px Indigo 600
  - Inner circle: 8px Indigo 600

Focus:
  - Outer ring: 4px Indigo 100
```

### Data Display Components

#### Data Table
```
Header Row:
  - Background: Gray 50
  - Border-bottom: 1px Gray 200
  - Font: 12px Bold, Label color (Gray 600)
  - Padding: 12px
  - Sortable columns: Show ↑↓ icon on hover

Data Rows:
  - Padding: 12px
  - Border-bottom: 1px Gray 100
  - Font: 14px Regular
  - Hover: Light gray background (Gray 50)

Striped (optional):
  - Alternate rows: White and Gray 25

Column Alignment:
  - Text: Left
  - Numbers: Right
  - Actions: Center

Responsive Behavior:
  - On mobile: Stack columns into cards
  - Or: Horizontal scroll with fixed first column
```

#### Card Component
```
Structure:
  - Container: White background, 8px radius, Level 2 shadow
  - Padding: 16px (lg)
  - Border: 1px Gray 100

Variants:
  - Default: Neutral styling
  - Success: Green left border (3px) for success states
  - Warning: Amber left border for warnings
  - Error: Red left border for errors
  - Elevated: Level 3 shadow for modal-like cards

Hover State:
  - Shadow: Level 3 (if clickable)
  - Cursor: Pointer

Small Card (metric cards):
  - Padding: 12px
  - Title: 12px Bold
  - Value: 24px Bold
  - Meta: 12px Gray
```

#### Badge
```
Variant: Status Badge
  - Padding: 4px 8px
  - Font-size: 11px
  - Font-weight: 600
  - Radius: 4px
  - Color-coded text and background

Examples:
  - "APPROVED" - Green text on Green 100
  - "PENDING" - Amber text on Amber 100
  - "REJECTED" - Red text on Red 100
  - "REVIEWING" - Blue text on Blue 100
```

#### Alert / Toast Notification
```
Structure:
  - Fixed position or inline
  - Padding: 12px 16px
  - Radius: 6px
  - Icon + Text
  - Optional [X] close button
  - Optional CTA button

Variants:
  - Success: Green 100 bg, Green 700 text, checkmark icon
  - Error: Red 100 bg, Red 700 text, X icon
  - Warning: Amber 100 bg, Amber 700 text, ! icon
  - Info: Blue 100 bg, Blue 700 text, i icon

Auto-dismiss:
  - Success: 4 seconds
  - Error: 8 seconds (longer for user to read)
  - Warning: 6 seconds
  - Info: 5 seconds
  - Manual close always available
```

### Modal Dialog

```
Structure:
  - Backdrop: Semi-transparent (rgba(0,0,0,0.5))
  - Modal window: White, 8px radius, Level 4 shadow
  - Centered on screen
  - Max-width: 500px (mobile-responsive)

Header Section:
  - Title: 20px Bold, Black
  - Padding: 20px
  - Border-bottom: 1px Gray 200
  - [X] close button (top-right)

Content Section:
  - Padding: 20px
  - Max-height: 60vh (scrollable if needed)
  - Font: 14px

Footer Section:
  - Padding: 16px 20px
  - Border-top: 1px Gray 200
  - Buttons right-aligned

Actions:
  - [Cancel] button (Secondary)
  - [Action] button (Primary, color-coded)
  - Spacing: 8px between buttons

Animation:
  - Fade in: 200ms
  - Fade out: 150ms
  - Slide up: 200ms (optional)
```

---

## 4. Layout Patterns

### Desktop Layout - Main Dashboard
```
┌────────────────────────────────────────────────────────────┐
│ Header (fixed, h=56px)                                     │
│ Logo | Nav | User Menu                                     │
├────┬────────────────────────────────────────────────────────┤
│    │ Dashboard (max-width: 1400px, centered)                │
│ 280│                                                         │
│ px │ ┌──────────────────────────────────────────────────┐   │
│    │ │ Metric Cards (4 columns, 1fr each)               │   │
│    │ │                                                   │   │
│    │ │ [24px gap]                                       │   │
│    │ │                                                   │   │
│ S  │ │ ┌─ Chart 1 ─────────────────────────────────┐   │   │
│ i  │ │ │                                             │   │   │
│ d  │ │ │ Transaction Volume (48% width)            │   │   │
│ e  │ │ │                                             │   │   │
│ b  │ │ └─────────────────────────────────────────────┘   │   │
│ a  │ │ ┌─ Chart 2 ─────────────────────────────────┐   │   │
│ r  │ │ │                                             │   │   │
│    │ │ │ Fraud Rate (48% width)                     │   │   │
│    │ │ │                                             │   │   │
│    │ │ └─────────────────────────────────────────────┘   │   │
│    │ │                                                   │   │
│    │ │ ┌─ Recent Frauds ────────────────────────────┐   │   │
│    │ │ │                                             │   │   │
│    │ │ │ Table (100% width)                        │   │   │
│    │ │ │                                             │   │   │
│    │ │ └─────────────────────────────────────────────┘   │   │
│    │ └──────────────────────────────────────────────────┘   │
└────┴────────────────────────────────────────────────────────┘
```

### Mobile Layout - Stacked
```
┌────────────────────────────┐
│ Header (h=48px)            │
│ [☰] Logo                   │
├────────────────────────────┤
│                            │
│ Metric Card 1              │
│ [Total Trans: 5,420]       │
│                            │
│ [8px gap]                  │
│                            │
│ Metric Card 2              │
│ [Fraud Rate: 2.34%]        │
│                            │
│ [8px gap]                  │
│                            │
│ Metric Card 3              │
│ [P95 Latency: 187ms]       │
│                            │
│ [8px gap]                  │
│                            │
│ Metric Card 4              │
│ [False Positive: 0.8%]     │
│                            │
│ [24px gap]                 │
│                            │
│ Chart (scrollable)         │
│ Transaction Volume         │
│ [more...]                  │
│                            │
│ [View Full Dashboard]      │
│                            │
└────────────────────────────┘
```

---

## 5. Dashboard Structure

### Metric Cards Layout (Desktop)
```
Each Card:
  ┌────────────────────┐
  │ 📊                 │
  │ Total Transactions │
  │ 5,420              │ (Large: 28px bold)
  │ ↑ 12% vs yesterday │ (Small: 12px green)
  └────────────────────┘

4 Cards in 1 Row (equal width)
Gap: 16px between cards
```

### Chart Layout
```
┌─ Transaction Volume (Last 24h) ─────────────────┐
│ 5000─┐                                          │
│      │    ╱╲      ╱╲                            │
│      │   ╱  ╲    ╱  ╲                           │
│      │  ╱    ╲  ╱    ╲                          │
│ [Legend: Actual, Target]  [Export] [Refresh]   │
│                                                  │
│ ├─ 00:00 ─ 06:00 ─ 12:00 ─ 18:00 ─ 24:00 ─┤   │
│ └─────────────────────────────────────────────┘ │
```

### Transaction List Layout
```
┌─ High Risk Transactions ─────────────────┐
│ ID    | Amount | Merchant | Risk | [>] │
├───────────────────────────────────────────┤
│ TXN_1 | $5.2K  | Amazon   | 92   | [>] │ ← Hover: Light gray bg
│ TXN_2 | $12.5K | Jewelry  | 88   | [>] │
│ TXN_3 | $3.4K  | Hotel    | 85   | [>] │
└─────────────────────────────────────────┘
```

---

## 6. Design Tokens (CSS Variables)

```css
/* Colors */
--color-primary: #4F46E5;
--color-primary-hover: #4338CA;
--color-primary-dark: #3730A3;

--color-success: #10B981;
--color-success-light: #D1FAE5;

--color-warning: #F59E0B;
--color-warning-light: #FEF3C7;

--color-danger: #EF4444;
--color-danger-light: #FEE2E2;

--color-text-primary: #1F2937;
--color-text-secondary: #6B7280;
--color-text-tertiary: #9CA3AF;

--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F9FAFB;
--color-bg-tertiary: #F3F4F6;

--color-border: #E5E7EB;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;

/* Typography */
--font-family: 'Inter', sans-serif;
--font-size-xs: 12px;
--font-size-sm: 13px;
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-xl: 18px;
--font-size-2xl: 24px;
--font-size-3xl: 32px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

/* Border Radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-full: 50%;

/* Transitions */
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

---

## 7. Animation & Interaction

### Micro-Interactions

#### Button Hover
- Scale: 100% → 102%
- Duration: 200ms
- Easing: ease-out
- Shadow: Level 2

#### Button Click
- Scale: 102% → 98%
- Duration: 100ms
- Easing: ease-in

#### Loading Spinner
```
Appearance: Rotating Indigo circle (24px diameter)
Rotation: 360° in 1 second, continuous
Opacity: 100%

Location: Center of button or loading area
Size: 20px (fits inside button)
```

#### Success Animation
- Checkmark appears with bounce (scale 0 → 1.2 → 1)
- Duration: 400ms
- Toast slides down from top
- Background fades in 200ms

#### Error Animation
- Shake: -2px → +2px → -2px, 3 cycles
- Duration: 300ms
- Red border pulse: 500ms

#### Page Transition
- Fade out: 100ms
- Fade in: 200ms
- No full-page reload (SPA behavior)

### Loading States

#### Skeleton Loading
- Gray shimmer background (#E5E7EB)
- Pulse animation: opacity 0.5 → 1 → 0.5, 1.5s duration
- Match expected content shape (rectangle for text, circle for avatar)

#### Placeholder States
- "No data found" - Centered gray icon + message
- "Loading..." - Spinner + text
- "Error" - Red icon + error message + retry button

---

## 8. Accessibility (WCAG 2.1 AA)

### Color & Contrast
- **Minimum Contrast Ratio:** 4.5:1 for normal text, 3:1 for large text
- **Not Color-Only:** Never rely on color alone (use icons, text, patterns)
- **Example:** Red badge + ❌ icon + "REJECTED" text

### Keyboard Navigation
- **Tab Order:** Logical, follows visual flow
- **Skip Links:** Jump to main content (hidden unless focused)
- **Focus Indicator:** Minimum 3px border in primary color
- **No Keyboard Trap:** User can tab away from any element

### Screen Reader Support
- **Semantic HTML:** Use `<button>`, `<a>`, `<form>`, `<label>`
- **ARIA Labels:** For icons-only buttons: `aria-label="Review transaction"`
- **Form Labels:** Explicit `<label>` tags, not placeholders alone
- **Live Regions:** `aria-live="polite"` for alerts and updates

### Motion
- **Respect prefers-reduced-motion:** If enabled, disable animations
- **No Auto-play:** Videos/animations only on user action
- **Flashing:** Avoid anything > 3 Hz (accessibility seizure risk)

### Example Accessible Button
```html
<button 
  type="button"
  aria-label="Review transaction TXN_001"
  data-testid="review-button"
  class="btn btn-primary"
>
  <ReviewIcon aria-hidden="true" />
  Review
</button>
```

---

## 9. Mobile Design Specifications

### Touch Targets
- **Minimum Size:** 44x44px (recommended by iOS & Android)
- **Spacing:** 8px minimum between interactive elements
- **Large Buttons:** 48x48px for primary CTAs
- **Small Text:** Minimum 16px on mobile (prevents zoom)

### Mobile Navigation
- **Hamburger Menu:** Show on < 768px
- **Bottom Tab Bar:** Optional for main sections (Transactions, Alerts, etc.)
- **Sticky Header:** Fixed top with navigation on scroll

### Mobile Forms
- **Input Size:** 44px height, 16px font (prevents zoom on iOS)
- **Label Position:** Above input (not placeholder-as-label)
- **Submit Button:** Full width, 48px height
- **Error Messages:** Clear, above field, red background

### Responsive Images & Icons
- **Icons:** Use SVG, scale with `width` and `height` props
- **Charts:** Full width, scrollable if needed
- **Tables:** Stack into cards on mobile or horizontal scroll

---

## 10. Visual Hierarchy

### Element Importance Levels

```
LEVEL 1: CRITICAL (Grab attention immediately)
├─ High-risk transaction badges (Red background, large size)
├─ Active alerts (Red background, centered)
└─ Critical error messages (Red, prominent placement)

LEVEL 2: IMPORTANT (User should notice)
├─ Metric cards (Larger font, light backgrounds)
├─ Medium-risk transactions (Amber background)
├─ Primary action buttons (Indigo background)
└─ Success messages (Green background)

LEVEL 3: SUPPORTING (Context & details)
├─ Secondary information (Gray text, smaller font)
├─ Chart labels (Small font, gray)
├─ Timestamps (Tertiary text color)
└─ Secondary buttons (Light backgrounds)

LEVEL 4: MINIMAL (For advanced users)
├─ Hidden details behind "Show More"
├─ Advanced filter options
└─ Developer documentation links
```

### Visual Weight
```
Heavy: Bold text, large size, bright color (Red, Green)
Normal: Regular text, medium size, primary color
Light: Gray text, small size, subtle
```

---

## 11. Dark Mode Support (Phase 2)

### Color Adjustments
```
Light Mode → Dark Mode

White → #1F2937 (dark gray-900)
Gray 50 → #111827 (darker gray)
Gray 100 → #1F2937
Gray 900 → #F3F4F6 (light gray)

Shadows: More pronounced (darker background = more contrast needed)
Border: Lighter (Gray 700 instead of Gray 200)
```

### Implementation
- CSS Custom Properties with `prefers-color-scheme`
- User preference toggle in Settings
- Persist choice in localStorage

---

## 12. Icons & Illustrations

### Icon Library
- **Source:** Heroicons (www.heroicons.com) or Tabler Icons
- **Size:** 16px (small), 20px (medium), 24px (large)
- **Stroke Width:** 1.5 (for 20px+), 2 (for 16px)
- **Color:** Inherit from text or explicit color

### Icons Usage
```
Status Indicators:
├─ ✓ Checkmark (Green) = Approved
├─ ✕ X Mark (Red) = Rejected
├─ ⟳ Spinner (Gray) = Loading/Processing
└─ ⚠ Warning (Amber) = Manual Review

Navigation:
├─ Dashboard = Home icon
├─ Transactions = Receipt icon
├─ Alerts = Bell icon
├─ Reports = Document icon
└─ Settings = Gear icon

Data:
├─ Expand/Collapse = Chevron down/up
├─ Edit = Pencil icon
├─ Delete = Trash icon
└─ Export = Download icon
```

### Custom Illustrations
- Error states: Friendly character with helpful message
- Empty states: Icon + text, not overwhelming
- Onboarding: Step-by-step visual guide

---

## 13. Components Inventory

### Ready to Build
- ✅ Button (Primary, Secondary, Danger, Success)
- ✅ Input (Text, Email, Number, Password)
- ✅ Dropdown / Select
- ✅ Checkbox
- ✅ Radio Button
- ✅ Card
- ✅ Badge
- ✅ Alert / Toast
- ✅ Modal Dialog
- ✅ Data Table
- ✅ Sidebar Navigation
- ✅ Header
- ✅ Metric Card
- ✅ Loading Skeleton

### Third-Party Libraries
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Heroicons React
- **UI Components:** Shadcn/ui (highly customizable)
- **Form:** React Hook Form + Zod
- **Notifications:** Sonner or React Toastify

---

## 14. Design Handoff Artifacts

### Developer Deliverables
1. **Figma Design System** - Link to all components
2. **Color Variables File** - CSS/SCSS with all tokens
3. **Typography Scale** - Web-safe fonts with fallbacks
4. **Component Library Documentation** - Props, states, examples
5. **Interactive Prototype** - Figma prototype for reference

### QA Testing Checklist
- [ ] Color contrast > 4.5:1
- [ ] All buttons are 44x44px (minimum) on mobile
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Focus indicators visible on all interactive elements
- [ ] Forms are fully keyboard-navigable
- [ ] Error messages are descriptive and actionable
- [ ] Loading states never exceed 2 seconds visible
- [ ] Responsive design tested on mobile/tablet/desktop

---

## 15. Design Resources

### Fonts
- Inter: https://rsms.me/inter/
- Google Fonts: https://fonts.google.com/

### Icons
- Heroicons: https://heroicons.com/
- Tabler Icons: https://tabler-icons.io/

### Color Tools
- Tailwind Color Generator: https://www.twind.dev/
- Contrast Checker: https://webaim.org/resources/contrastchecker/

### Documentation
- Figma Design System: [Internal Link]
- Component Library: [Storybook Link]
- Accessibility Guide: WCAG 2.1 AA

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-15  
**Owner:** Lead UI/UX Designer  
**Status:** Approved for Development  
**Figma File:** [Link to design file]
