# 🍜 ร้านก๋วยเตี๋ยว Finance Tracker

ระบบบัญชีสำหรับร้านก๋วยเตี๋ยว สร้างด้วย Next.js 16

## 🚀 เริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น
- Node.js 20+ 
- PostgreSQL database

### การติดตั้ง

1. คัดลอกไฟล์ environment:
```bash
copy .env.example .env.local
```

2. แก้ไขค่า `.env.local`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/noodle_finance
JWT_SECRET=your-secret-here-change-this-in-production
NEXT_PUBLIC_APP_NAME=บัญชีร้านก๋วยเตี๋ยว
```

3. ติดตั้ง dependencies:
```bash
npm install
```

4. สร้างฐานข้อมูล:
```bash
npm run db:push
```

5. รัน development server:
```bash
npm run dev
```

6. เปิดเบราว์เซอร์ไปที่: http://localhost:3000

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login)
│   ├── (dashboard)/         # Protected routes
│   ├── api/                 # API routes
│   └── actions/             # Server Actions
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── layout/              # Layout components
│   └── shared/              # Shared components
├── lib/
│   ├── db/                  # Database & Drizzle
│   ├── auth/                # Authentication
│   ├── validations/         # Zod schemas
│   └── utils/               # Utilities
├── stores/                  # Zustand stores
├── hooks/                   # Custom React hooks
└── types/                   # TypeScript types
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS 4, Framer Motion
- **State**: TanStack Query, Zustand
- **Icons**: Lucide React
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL, Drizzle ORM
- **Auth**: JWT (jose), HTTP-only cookies
- **Validation**: Zod

## 📋 Phase 0 Checklist

✅ Project structure created
✅ TypeScript strict mode configured
✅ Database schema defined (users, transactions, monthly_goals)
✅ Environment file created
✅ Providers configured (QueryClientProvider, ThemeProvider)
✅ Zustand store created
✅ Shared utilities created (formatCurrency, formatThaiDate)
✅ Shared components created (CurrencyDisplay, ThaiDateLabel, LoadingSpinner, ErrorBoundary)
✅ JWT auth utilities created
✅ Middleware for route protection created
✅ Zod validation schemas created
✅ Placeholder pages created
✅ Layout components created (BottomNav, Sidebar, AppShell)
✅ Tailwind CSS configured with dark mode support
✅ Categories defined (INCOME_CATEGORIES, EXPENSE_CATEGORIES)
✅ Custom hooks created (useAuth, useTransactions)
✅ Server actions created (auth, transactions)
✅ Session API route created
✅ Drizzle ORM configured

## 📝 หมายเหตุ

นี่คือ Phase 0 - โครงสร้างพื้นฐาน ยังต้องทำ:
- Phase 1: Authentication (Login/Logout)
- Phase 2: Dashboard & Add Transaction
- Phase 3: History & Monthly Summary
- Phase 4: Navigation Shell, Polish & Dark Mode
