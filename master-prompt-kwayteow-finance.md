# 🍜 Master Prompt — ร้านก๋วยเตี๋ยว Finance Web App

> **วิธีใช้**: Copy prompt แต่ละ Phase ไปวาง AI ทีละ Phase เรียงตาม Phase 0 → 1 → 2 → 3 → 4
> ห้ามข้าม Phase หรือรวม Phase เพราะจะทำให้ AI งานลวกและตกหล่น

---

## 🔧 Tech Stack Reference (แปะไว้ทุก prompt)

```
Frontend  : Next.js 16 App Router · Tailwind CSS 4 · Shadcn UI · Framer Motion
State     : TanStack Query (server) · Zustand (client)
Icons     : Lucide React
Backend   : Next.js Server Actions & Route Handlers
Database  : PostgreSQL · Drizzle ORM
Auth      : JWT (jose) · HTTP-only cookies
Validation: Zod
```

---

## 📐 Design System Reference (แปะไว้ทุก prompt)

```
Design philosophy : Mobile-first · Responsive · Modern 2025–2026
Color palette     : Warm cream/red (brand) · Emerald green (income) · Rose red (expense)
Typography        : Sarabun (Thai body) + Prompt (Thai display/heading)
                    → import จาก Google Fonts
Corner radius     : sm=6px · md=10px · lg=14px · xl=20px
Spacing scale     : 4 · 8 · 12 · 16 · 24 · 32 · 48px
Animation         : Framer Motion · spring stagger for list items
                    · fade+slide for page transitions
Shadow system     : shadow-sm (cards) · shadow-md (modals)
Dark mode         : Tailwind dark: class (system preference)
Glass card style  : backdrop-blur + semi-transparent bg
Bottom nav        : Mobile fixed bottom · Desktop left sidebar
Breakpoints       : mobile < 768px · tablet 768–1024px · desktop > 1024px
```

---

## ✅ PHASE 0 — Project Scaffold & Shared Infrastructure

> **ส่ง prompt นี้ก่อนเลย · ยังไม่ต้องทำ UI**

```
You are a senior full-stack engineer. Set up the project scaffold for a Thai noodle shop
finance tracker app. Follow the tech stack and design system below EXACTLY.

=== TECH STACK ===
[วาง Tech Stack Reference]

=== DESIGN SYSTEM ===
[วาง Design System Reference]

=== DELIVERABLES (Phase 0 only) ===

1. PROJECT STRUCTURE
   Create the following folder structure (App Router convention):
   src/
   ├── app/
   │   ├── layout.tsx          ← root layout with ThemeProvider + QueryProvider
   │   ├── (auth)/
   │   │   ├── login/page.tsx
   │   │   └── layout.tsx
   │   └── (dashboard)/
   │       ├── layout.tsx      ← dashboard shell with bottom nav / sidebar
   │       ├── page.tsx        ← today overview (placeholder)
   │       ├── add/page.tsx    ← add transaction (placeholder)
   │       ├── history/page.tsx
   │       └── monthly/page.tsx
   ├── components/
   │   ├── ui/                 ← shadcn generated (do NOT create manually)
   │   ├── layout/
   │   │   ├── BottomNav.tsx
   │   │   ├── Sidebar.tsx
   │   │   └── AppShell.tsx
   │   └── shared/
   │       ├── CurrencyDisplay.tsx   ← formats ฿ Thai style
   │       ├── ThaiDateLabel.tsx     ← date in Thai Buddhist Era
   │       ├── LoadingSpinner.tsx
   │       └── ErrorBoundary.tsx
   ├── lib/
   │   ├── db/
   │   │   ├── index.ts        ← drizzle client singleton
   │   │   └── schema.ts       ← all table definitions
   │   ├── auth/
   │   │   ├── jwt.ts          ← sign/verify with jose
   │   │   └── middleware.ts   ← protect routes
   │   ├── validations/
   │   │   └── transaction.ts  ← zod schemas
   │   └── utils/
   │       ├── formatCurrency.ts
   │       └── formatThaiDate.ts
   ├── stores/
   │   └── useAppStore.ts      ← zustand store (UI state only)
   ├── hooks/
   │   ├── useTransactions.ts  ← TanStack Query hooks
   │   └── useAuth.ts
   └── types/
       └── index.ts            ← shared TypeScript types

2. DATABASE SCHEMA (drizzle + PostgreSQL)
   Define these tables in src/lib/db/schema.ts:

   users:
     - id: uuid primary key default gen_random_uuid()
     - shop_name: text not null
     - owner_name: text not null
     - email: text unique not null
     - password_hash: text not null
     - created_at: timestamp default now()

   transactions:
     - id: uuid primary key default gen_random_uuid()
     - user_id: uuid references users(id) on delete cascade
     - type: enum('income', 'expense') not null
     - category: text not null
     - amount: numeric(10,2) not null
     - note: text
     - transaction_date: date not null
     - created_at: timestamp default now()

   monthly_goals: (optional, for future phase)
     - id, user_id, year, month, income_goal, expense_limit

3. ENVIRONMENT SETUP
   Create .env.example:
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-here
     NEXT_PUBLIC_APP_NAME=บัญชีร้านก๋วยเตี๋ยว

4. PROVIDERS & WRAPPERS
   - src/app/layout.tsx: wrap with <QueryClientProvider> + <ThemeProvider>
   - src/stores/useAppStore.ts: zustand store with:
       activeTab: 'dashboard' | 'add' | 'history' | 'monthly'
       setActiveTab: (tab) => void
       transactionType: 'income' | 'expense'
       setTransactionType: fn
       selectedCategory: string
       setSelectedCategory: fn

5. SHARED UTILITIES
   - formatCurrency(amount: number): string
     → returns "฿1,250" Thai locale, no decimals for whole numbers
   - formatThaiDate(date: Date | string): string
     → returns "จ. 4 เม.ย. 2568" (BE year)
   - INCOME_CATEGORIES and EXPENSE_CATEGORIES arrays with { id, label, icon (lucide) }

6. MIDDLEWARE
   - src/middleware.ts: redirect unauthenticated users from (dashboard) to /login
   - Use Next.js middleware with JWT verification

=== CONSTRAINTS ===
- Write REAL, COMPLETE code. No "// TODO" or placeholder logic.
- Use TypeScript strict mode throughout.
- Every component must have proper TypeScript types.
- Do NOT install or configure Shadcn UI components manually —
  just note which ones to run: `npx shadcn@latest add button input ...`
- Output each file as a separate, clearly labeled code block.
- After all files, output a "Phase 0 Checklist" confirming what was created.
```

---

## ✅ PHASE 1 — Authentication (Login / Logout)

> **ทำหลัง Phase 0 เสร็จและ checklist ผ่านทุกข้อ**

```
You are a senior full-stack engineer continuing the noodle shop finance app.
Phase 0 (scaffold, DB schema, providers) is COMPLETE.

=== TECH STACK ===
[วาง Tech Stack Reference]

=== DESIGN SYSTEM ===
[วาง Design System Reference]

=== WHAT EXISTS (do NOT recreate) ===
- DB schema: users, transactions tables
- lib/auth/jwt.ts: signJwt, verifyJwt functions
- middleware.ts: route protection skeleton
- stores/useAppStore.ts: zustand store
- app/(auth)/login/page.tsx: placeholder

=== DELIVERABLES (Phase 1 only) ===

1. LOGIN PAGE  (app/(auth)/login/page.tsx)
   Design:
   - Full-screen centered layout, mobile-first
   - Top: large bowl emoji + shop name "บัญชีร้านก๋วยเตี๋ยว" in Prompt font
   - Card with glass effect (backdrop-blur, semi-transparent bg)
   - Fields: Email + Password (toggle show/hide with Eye icon)
   - Submit button: full width, brand red, loading spinner state
   - Below form: small text "ระบบบัญชีสำหรับร้านของคุณ" muted
   - Framer Motion: card fades in + slides up on mount
   - Error state: shake animation on wrong credentials

   Functionality:
   - Client-side: react-hook-form + zod validation
   - Server Action: src/app/actions/auth.ts → loginAction(formData)
     · Verify email + bcrypt.compare(password, hash)
     · signJwt({ userId, shopName })
     · Set HTTP-only cookie "token" maxAge 7 days
     · Return { success: true } or { error: string }
   - On success: router.push('/') (dashboard)
   - On error: display inline error with red border + message

2. LOGOUT
   - Server Action: logoutAction() → clears "token" cookie → redirect /login
   - Add logout button to Sidebar (desktop) and a menu in AppShell (mobile)

3. AUTH HOOK  (hooks/useAuth.ts)
   - useSession(): returns { user: { userId, shopName } | null }
     · Reads from /api/auth/session route handler that returns JWT payload
   - isLoading state

4. SESSION ROUTE  (app/api/auth/session/route.ts)
   - GET: reads "token" cookie → verifyJwt → return { userId, shopName }
   - Returns 401 if invalid/missing

5. MIDDLEWARE (update src/middleware.ts)
   - Protected: /*, except /login and /api/auth/*
   - Verify JWT from cookie; redirect to /login if invalid

=== DESIGN REQUIREMENTS ===
- Mobile: login card is full-width with 24px horizontal padding
- Desktop: card max-width 400px, centered with decorative bg pattern
  (subtle repeating bowl emoji or geometric Thai pattern in bg)
- Dark mode: card bg adapts, brand red stays consistent
- All form interactions have micro-animations (border glow on focus)

=== CONSTRAINTS ===
- NO demo/hardcoded credentials. Use real bcrypt verification.
- Do NOT use NextAuth — implement JWT manually with jose.
- Password field must have show/hide toggle.
- All validation errors display inline (not alert/toast).
- Output each file as a clearly labeled code block.
- After all files, output "Phase 1 Checklist" with all items.
```

---

## ✅ PHASE 2 — Dashboard & Add Transaction

> **ทำหลัง Phase 1 เสร็จและ login/logout ทดสอบผ่านแล้ว**

```
You are a senior full-stack engineer continuing the noodle shop finance app.
Phases 0 and 1 are COMPLETE (scaffold, auth, JWT, session).

=== TECH STACK ===
[วาง Tech Stack Reference]

=== DESIGN SYSTEM ===
[วาง Design System Reference]

=== WHAT EXISTS (do NOT recreate) ===
- Auth: loginAction, logoutAction, useAuth hook, /api/auth/session
- DB schema: users, transactions with Drizzle
- AppShell with BottomNav (mobile) and Sidebar (desktop) — placeholders
- Zustand store: transactionType, selectedCategory, setters
- INCOME_CATEGORIES, EXPENSE_CATEGORIES arrays

=== DELIVERABLES (Phase 2 only) ===

──────────────────────────────────────────
2A. SERVER ACTIONS  (app/actions/transactions.ts)
──────────────────────────────────────────
  addTransaction(data: TransactionInput): Promise<{ success: boolean; error?: string }>
  - Validate with Zod (category, amount > 0, date required)
  - Insert into DB with current userId from JWT cookie
  - Revalidate path '/'

  getDashboardSummary(date: string): Promise<DashboardSummary>
  - Return: { totalIncome, totalExpense, profit, incomeCount, expenseCount, recentTransactions[] }
  - Filter by user_id AND transaction_date = date

  Both must verify auth (check JWT cookie) before querying.

──────────────────────────────────────────
2B. DASHBOARD PAGE  (app/(dashboard)/page.tsx)
──────────────────────────────────────────
  Layout (mobile-first):
  - Sticky header: shop name left, Thai date right, brand red bg
  - Section: "สรุปวันนี้"
    · 2-column grid: Income card (emerald) | Expense card (rose)
    · Each card: amount in Prompt font 1.4rem, count below in xs muted
    · Profit banner below: full-width, green if profit ≥ 0 / red if negative
    · Profit banner has emoji: 😊 profit / 😟 loss
  - Section: "รายการล่าสุด"
    · List of max 8 transactions from today
    · Each row: icon left, category + note center, +/- amount right
    · Framer Motion stagger animation on list items (0.06s delay each)
    · Empty state: centered bowl emoji + "ยังไม่มีรายการวันนี้"
  - FAB button: bottom-right fixed, brand red, + icon, opens /add

  Data: Use TanStack Query to call getDashboardSummary(todayISO)
  Show skeleton loaders while fetching (Shadcn Skeleton component)

──────────────────────────────────────────
2C. ADD TRANSACTION PAGE  (app/(dashboard)/add/page.tsx)
──────────────────────────────────────────
  Layout (mobile-first, scroll page):
  - Page header: "บันทึกรายการ" with back arrow
  - Income / Expense toggle: 2-button segmented control
    · Smooth background slide animation (Framer Motion layoutId)
    · Income = emerald active state / Expense = rose active state
  - Category grid: 2×N pill buttons with Lucide icon + label
    · Grid switches categories based on toggle (INCOME_CATEGORIES / EXPENSE_CATEGORIES)
    · Selected pill: filled bg + checkmark icon
    · Grid animates in when category list changes (stagger)
  - Amount input: large centered number, ฿ prefix, numeric keyboard (inputMode="decimal")
    · Quick-add buttons: +50 / +100 / +500 / +1000
  - Note input: optional, placeholder "เช่น ขายเช้า, ค่าเส้น..."
  - Date picker: defaults to today, Shadcn Popover + Calendar
  - Submit button: full width, disabled until amount > 0, loading state
  - On success: Framer Motion success animation → navigate back to dashboard

  Functionality:
  - react-hook-form + zod
  - Calls addTransaction server action
  - On success: router.push('/') AND TanStack Query invalidate ['dashboard']

=== DESIGN REQUIREMENTS ===
- Cards must have subtle inner shadow, not flat
- Amount in profit banner: large Prompt font (2rem mobile, 2.5rem desktop)
- Category pills: icon 20px, label 13px, pill height 44px (touch target)
- All interactive elements: minimum 44px height (mobile accessibility)
- Page transitions: dashboard fades in, add page slides in from right
  (use Framer Motion AnimatePresence in layout)
- Numbers always use Thai Buddhist Era (BE) for years

=== CONSTRAINTS ===
- Server actions must validate JWT (not trust client).
- Amount field must reject negative/zero values client AND server side.
- Do NOT use alert() or window.confirm() — use Shadcn Toast for success.
- TanStack Query key for dashboard: ['dashboard', 'summary', dateString]
- Output each file clearly labeled.
- After all files: "Phase 2 Checklist"
```

---

## ✅ PHASE 3 — History & Monthly Summary

> **ทำหลัง Phase 2 เสร็จและ dashboard + add ทดสอบผ่านแล้ว**

```
You are a senior full-stack engineer continuing the noodle shop finance app.
Phases 0, 1, and 2 are COMPLETE.

=== TECH STACK ===
[วาง Tech Stack Reference]

=== DESIGN SYSTEM ===
[วาง Design System Reference]

=== WHAT EXISTS (do NOT recreate) ===
- All auth, DB schema, server actions: addTransaction, getDashboardSummary
- Dashboard page, Add page fully functional
- TanStack Query setup, Zustand store, AppShell/nav

=== DELIVERABLES (Phase 3 only) ===

──────────────────────────────────────────
3A. SERVER ACTIONS (add to transactions.ts)
──────────────────────────────────────────
  getTransactionHistory(filters: HistoryFilters): Promise<Transaction[]>
  - filters: { dateFrom?: string; dateTo?: string; type?: 'income'|'expense'|'all'; category?: string }
  - Always filters by current user_id
  - Order by transaction_date DESC, created_at DESC
  - Max 100 rows

  getMonthlyReport(year: number, month: number): Promise<MonthlyReport>
  - Returns:
    · totalIncome, totalExpense, profit
    · profitMargin: (profit/income)*100 rounded
    · incomeByCategory: { category, total }[]
    · expenseByCategory: { category, total }[]
    · dailySummaries: { date, income, expense }[] for all days in month
    · averageDailyIncome
    · topExpenseCategory: { category, total }

  deleteTransaction(id: string): Promise<{ success: boolean }>
  - Verify ownership: check transaction.user_id = current user
  - Delete from DB
  - Revalidate paths '/' and '/history'

──────────────────────────────────────────
3B. HISTORY PAGE  (app/(dashboard)/history/page.tsx)
──────────────────────────────────────────
  Layout:
  - Header: "ประวัติรายการ"
  - Filter bar (horizontal scroll, no scrollbar visible):
    · Date filter chips: "วันนี้" "เมื่อวาน" "7 วันล่าสุด" "เดือนนี้" "ทั้งหมด"
    · Type filter pills: "ทั้งหมด" "รายได้" "ค่าใช้จ่าย"
    · Active filter: filled brand-red background
  - Transaction list grouped by date:
    · Date header: "จ. 4 เม.ย. 2568" with day's net amount right-aligned
    · Each transaction row: same design as dashboard recent list
    · Swipe to delete (mobile): reveal red delete button on swipe left
      → use react-swipeable or CSS gesture
    · Desktop: delete icon button on hover
  - Pull-to-refresh on mobile (use Intersection Observer trick)
  - Empty state per filter: relevant message + icon

  Functionality:
  - TanStack Query: ['transactions', 'history', filters]
  - Filters update query params (URL search params) so browser back works
  - Delete: optimistic update — remove from list immediately, undo toast 3s

──────────────────────────────────────────
3C. MONTHLY PAGE  (app/(dashboard)/monthly/page.tsx)
──────────────────────────────────────────
  Layout (scrollable):
  - Month navigation: ← (month name + BE year) →
    · Animated slide: left/right slide when changing month
  - Summary cards row (same style as dashboard but for full month):
    · Income | Expense | Profit (3 cards)
  - BAR CHART — Daily income vs expense for all days in month:
    · Use Recharts BarChart (grouped bars: income=emerald, expense=rose)
    · X axis: day numbers (1–31), only show if data exists
    · Responsive container, mobile scrolls horizontally if > 20 days
    · Custom tooltip: Thai date, income, expense, profit/loss
    · Chart height: 200px mobile, 260px desktop
  - CATEGORY BREAKDOWN:
    · Two sections side by side (desktop) or stacked (mobile)
    · Income by category: horizontal bar list with % of total
    · Expense by category: same, sorted descending
    · Each bar: category icon + label left, amount + % right, colored bar fill
  - ANALYSIS CARD:
    · Title: "วิเคราะห์เดือนนี้"
    · Dynamic bullet points based on data:
      - ✅ กำไร X บาท (Y% ของรายได้) — or ⚠️ ขาดทุน
      - 📊 รายได้เฉลี่ยต่อวัน: X บาท
      - 💸 ค่าใช้จ่ายสูงสุด: category (X บาท)
      - 📈 วันที่ขายดีที่สุด: date
    · Each bullet animates in with stagger

=== DESIGN REQUIREMENTS ===
- Recharts: use custom bar shape with border-radius top (rounded top bars)
- Chart colors must work in dark mode — use CSS vars in chart stroke/fill
- History date headers: sticky while scrolling within that date group
- Delete confirmation: NOT a modal — use inline expand animation or toast undo
- Category bars: animated width on mount (Framer Motion)
- Empty month: full-width illustration-style placeholder (SVG drawing of bowl + "ยังไม่มีข้อมูล")

=== CONSTRAINTS ===
- Recharts must be responsive — wrap in <ResponsiveContainer>
- Month change must NOT trigger full page reload — update state only
- TanStack Query keys: ['monthly', year, month] and ['transactions', 'history', ...filters]
- Delete optimistic update: use queryClient.setQueryData
- Output each file clearly labeled.
- After all files: "Phase 3 Checklist"
```

---

## ✅ PHASE 4 — Navigation Shell, Polish & Dark Mode

> **ทำเป็น Phase สุดท้าย หลังทุก feature ทำงานได้แล้ว**

```
You are a senior full-stack engineer. This is the final polish phase of the noodle shop
finance app. All features (auth, dashboard, add, history, monthly) are COMPLETE.

=== TECH STACK ===
[วาง Tech Stack Reference]

=== DESIGN SYSTEM ===
[วาง Design System Reference]

=== WHAT EXISTS (do NOT recreate) ===
- All pages: dashboard, add, history, monthly — fully functional
- All server actions, TanStack Query hooks, Zustand store
- AppShell, BottomNav, Sidebar — basic placeholders

=== DELIVERABLES (Phase 4 only) ===

──────────────────────────────────────────
4A. APP SHELL & NAVIGATION (complete the placeholders)
──────────────────────────────────────────
  BottomNav (mobile, fixed bottom):
  - 4 tabs: ภาพรวม (Home) · บันทึก (PlusCircle) · ประวัติ (List) · รายเดือน (BarChart2)
  - Active tab: brand red icon + label, animated dot indicator
  - Inactive: gray icon, no label
  - Height: 64px + safe-area-inset-bottom (for iPhone notch)
  - Tab switch: Framer Motion layoutId dot slides between tabs
  - Background: white/dark with top border + backdrop-blur

  Sidebar (desktop ≥ 768px, fixed left):
  - Width: 240px collapsed to 64px on narrow screens
  - Top: shop name + owner avatar (initials in circle)
  - Nav items: same 4 tabs, full label + icon
  - Active: brand red left border + tinted bg
  - Bottom: logout button (LogOut icon)
  - Hover: smooth bg highlight transition

  AppShell (wraps dashboard layout):
  - Mobile: render BottomNav, add 80px padding-bottom to main
  - Desktop: render Sidebar, add 240px margin-left to main
  - Page transition: Framer Motion AnimatePresence with opacity+y spring

──────────────────────────────────────────
4B. DARK MODE
──────────────────────────────────────────
  - ThemeProvider already exists — wire it up fully
  - Tailwind dark: class strategy (class on <html>)
  - All custom colors defined as CSS variables:
    --color-brand: #c0392b (light) → #e74c3c (dark, slightly lighter)
    --color-income-bg: #eaf7ef → #0d2818
    --color-expense-bg: #fdecea → #2a0e0e
    --color-surface: #ffffff → #1a1a1a
    --color-card: #ffffff → #232323
    --color-border: #e8d5c0 → #2e2e2e
  - Theme toggle button in header/sidebar:
    · Sun/Moon icon with Framer Motion rotation animation
    · Persisted to localStorage

──────────────────────────────────────────
4C. PERFORMANCE & UX POLISH
──────────────────────────────────────────
  Loading states:
  - Dashboard skeleton: 2 cards + 1 banner + 4 list items (Shadcn Skeleton)
  - History skeleton: date header + 3 rows per group
  - Monthly skeleton: 3 summary cards + chart placeholder bar
  - All skeletons must match exact layout of loaded state

  Error states:
  - ErrorBoundary catches query errors
  - Friendly Thai error messages: "โหลดข้อมูลไม่ได้ ลองใหม่อีกครั้ง"
  - Retry button with TanStack Query refetch

  Toast notifications (Shadcn Sonner):
  - ✅ บันทึกรายได้แล้ว / บันทึกค่าใช้จ่ายแล้ว
  - ✅ ลบรายการแล้ว (+ Undo button 4s)
  - ❌ เกิดข้อผิดพลาด ลองใหม่อีกครั้ง
  - Position: bottom-center mobile, bottom-right desktop

  Pull-to-refresh (mobile):
  - Dashboard and History pages
  - Custom PTR indicator: spinning bowl emoji → done check
  - Trigger TanStack Query refetch on release

  Empty states (consistent design):
  - Each page has unique Thai copy + relevant Lucide icon
  - "บันทึกรายการแรกเลย!" with arrow pointing to FAB/add button

──────────────────────────────────────────
4D. RESPONSIVE AUDIT
──────────────────────────────────────────
  Check and fix all pages at these breakpoints:
  - 375px (iPhone SE) — smallest supported
  - 390px (iPhone 15)
  - 768px (iPad)
  - 1280px (desktop)

  Rules:
  - No horizontal scroll at any breakpoint
  - Touch targets minimum 44×44px on all interactive elements
  - Text never smaller than 12px
  - Profit banner amount: 1.5rem → 2rem → 2.5rem across breakpoints
  - Monthly chart: horizontal scroll container on mobile < 600px

=== CONSTRAINTS ===
- Dark mode must NOT flash on initial load (use suppressHydrationWarning on <html>)
- All animations: respect prefers-reduced-motion media query (disable if reduced)
- No hardcoded colors in JSX — use Tailwind classes or CSS vars only
- Framer Motion imports: use { motion, AnimatePresence } — no default import
- After all files: "Phase 4 Final Checklist" + "Known Limitations" section
  listing anything intentionally left out or simplified
```

---

## 📋 Inter-Phase Handoff Checklist

ก่อนเริ่ม Phase ถัดไปทุกครั้ง ตรวจสอบ:

| Phase | ตรวจสอบก่อนไป Phase ถัดไป |
|-------|---------------------------|
| 0 → 1 | DB schema รัน migrate ได้ · Providers wrap layout แล้ว · Folder structure ถูกต้อง |
| 1 → 2 | Login ทำงานได้ · Cookie set ถูก · Redirect หลัง login ไป dashboard · Logout clear cookie |
| 2 → 3 | บันทึกรายการได้ · Dashboard แสดงข้อมูลจริงจาก DB · TanStack Query invalidate หลัง add |
| 3 → 4 | History filter ทำงาน · Monthly chart render · Delete แล้ว list update ทันที |
| 4 done | Dark mode ไม่ flash · ทุก breakpoint ไม่มี horizontal scroll · Toast แสดงถูก position |

---

## 🚫 สิ่งที่ห้าม AI ทำโดยไม่ถามก่อน

- เพิ่ม dependencies ใหม่นอก stack ที่กำหนด
- เปลี่ยน routing structure จาก (auth)/(dashboard) groups
- ใช้ `any` type ใน TypeScript
- Hardcode userId หรือ credentials ใดๆ
- ข้าม Zod validation ทั้ง client และ server side
- สร้าง Shadcn components ด้วยมือ (ใช้ CLI เท่านั้น)
