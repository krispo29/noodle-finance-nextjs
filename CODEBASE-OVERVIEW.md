# 🍜 Noodle Finance Next.js - Codebase Overview

เอกสารนี้สรุปโครงสร้าง สถาปัตยกรรม และเทคโนโลยีที่ใช้ในโปรเจกต์ "บัญชีร้านก๋วยเตี๋ยว" (Noodle Finance Tracker) เพื่อให้ง่ายต่อการทำความเข้าใจและพัฒนาต่อ

---

## 🛠️ Tech Stack (เทคโนโลยีที่ใช้)

**Frontend:**
- **Framework:** Next.js 16.x (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **State Management:** Zustand (Global State) + TanStack React Query (Server State/Caching)
- **Forms & Validation:** `react-hook-form` คู่กับ `zod`

**Backend & Database:**
- **Database:** PostgreSQL (โฮสต์บน Neon)
- **ORM:** Drizzle ORM (`drizzle-kit` สำหรับ Migration และ Studio)
- **Authentication:** Custom JWT-based auth ใช้ไลบรารี `jose` คู่กับ HTTP-only Cookies
- **Password Hashing:** `bcryptjs`

---

## 🗂️ Project Structure (โครงสร้างโปรเจกต์)

โปรเจกต์ใช้โครงสร้าง **Next.js App Router** โดยจัดระเบียบไฟล์หลักๆ ไว้ในโฟลเดอร์ `src/`:

```text
src/
├── app/                        # Next.js App Router (Pages & API)
│   ├── (auth)/                 # Route Group สำหรับหน้า Authentication
│   │   ├── login/page.tsx      # หน้า Login UI
│   │   └── layout.tsx          # Layout ของหน้า Auth
│   ├── (dashboard)/            # Route Group สำหรับระบบหลัก (Protected Routes)
│   │   ├── page.tsx            # Dashboard (สรุปวันนี้)
│   │   ├── add/page.tsx        # หน้าเพิ่มรายการ (รายรับ/รายจ่าย)
│   │   ├── history/page.tsx    # ประวัติการทำรายการ
│   │   ├── monthly/page.tsx    # สรุปรายเดือน
│   │   └── layout.tsx          # AppShell Layout (มี Sidebar/BottomNav)
│   ├── actions/                # Server Actions (เรียกใช้จาก Client)
│   │   ├── auth.ts             # จัดการ Login, Logout, Register
│   │   └── transactions.ts     # CRUD ข้อมูลรายการบัญชี
│   ├── api/auth/session/       # API Route ตรวจสอบ Session ปัจจุบัน
│   └── globals.css             # Global Tailwind Styles
├── components/                 # UI Components ที่ใช้งานซ้ำ
│   ├── layout/                 # Layout Components (Sidebar, BottomNav, AppShell)
│   └── shared/                 # Shared UI (LoadingSpinner, CurrencyDisplay, ฯลฯ)
├── hooks/                      # Custom React Hooks
│   ├── useAuth.ts              # Hook จัดการ Auth state บน Client
│   └── useTransactions.ts      # TanStack Query hooks ดึงข้อมูลบัญชี
├── lib/                        # Utilities & Core Libraries
│   ├── auth/                   # ระบบสร้าง/ตรวจสอบ JWT Token (`jwt.ts`)
│   ├── db/                     # ระบบ Database (Drizzle Client และ Schema)
│   ├── utils/                  # Helper functions ทั่วไป (เช่น Format เงิน, วันที่)
│   └── validations/            # Zod Schemas สำหรับ Validate Form Input
├── stores/                     # Zustand State Store
│   └── useAppStore.ts          # เก็บ State ของ UI (เช่น Tab ปัจจุบัน, หมวดหมู่)
├── middleware.ts               # Next.js Middleware ป้องกัน Route ที่ต้อง Login
└── types/                      # TypeScript Interfaces/Types
```

---

## 🗄️ Database Schema (ฐานข้อมูล)

กำหนดไว้ใน `src/lib/db/schema.ts` และจัดการโดย **Drizzle ORM** ประกอบด้วย 3 ตารางหลัก:

1. **`users` (ผู้ใช้งาน):**
   - `id` (UUID, Primary Key)
   - `shopName`, `ownerName` (ชื่อร้าน, ชื่อเจ้าของ)
   - `email` (Unique)
   - `passwordHash` (รหัสผ่านที่เข้ารหัสด้วย bcrypt)
   - `createdAt`

2. **`transactions` (รายการบัญชี):**
   - `id` (UUID, Primary Key)
   - `userId` (Foreign Key -> `users.id`)
   - `type` (Enum: 'income', 'expense')
   - `category` (หมวดหมู่รายการ)
   - `amount` (จำนวนเงิน)
   - `note` (บันทึกช่วยจำ)
   - `transactionDate` (วันที่ทำรายการ)
   - `createdAt`

3. **`monthly_goals` (เป้าหมายรายเดือน - สำหรับอนาคต):**
   - `id` (UUID)
   - `userId` (Foreign Key -> `users.id`)
   - `year`, `month`
   - `incomeGoal` (เป้าหมายรายได้)
   - `expenseLimit` (จำกัดรายจ่าย)

---

## 🔐 Authentication Flow (ระบบยืนยันตัวตน)

โปรเจกต์นี้ไม่ได้ใช้ NextAuth แต่เขียนระบบ **Custom JWT Authentication** เพื่อความยืดหยุ่นและเบา:

1. **Login (`src/app/actions/auth.ts`):** 
   - ผู้ใช้กรอกฟอร์ม ระบบจะเรียก Server Action `loginAction`
   - ตรวจสอบอีเมลและรหัสผ่านด้วย `bcrypt.compare`
   - หากสำเร็จ จะสร้าง JWT Token ด้วยไลบรารี `jose` (`src/lib/auth/jwt.ts`)
   - นำ Token ไปบันทึกลงใน **HTTP-only Cookie** ป้องกันการโดนขโมยผ่าน JavaScript (XSS)
2. **Route Protection (`src/middleware.ts`):** 
   - Middleware จะดักจับ Request ทุุกครั้ง ยกเว้น `/login`
   - ตรวจสอบ Cookie หากไม่มี Token หรือ Token หมดอายุ/ไม่ถูกต้อง จะทำการ Redirect ไปที่หน้า `/login`
3. **Logout:** 
   - เรียก Server Action `logoutAction` เพื่อสั่งลบ Cookie

---

## 🚀 Current Status (สถานะการพัฒนาปัจจุบัน)

อ้างอิงจาก `PHASE-0-CHECKLIST.md` และ `PHASE-1-CHECKLIST.md`:

- ✅ **Phase 0 (Project Scaffold):** เสร็จสมบูรณ์ โครงสร้างโปรเจกต์, UI Layout พื้นฐาน, Component กลางพร้อมใช้งาน
- ✅ **Phase 1 (Authentication):** เสร็จสมบูรณ์ ระบบ Login/Logout ทำงานได้แล้ว, Database Setup สำเร็จ, Middleware ทำงานถูกต้อง
- ⏳ **Phase 2 (Dashboard & Add Transaction):** **(กำลังดำเนินการพัฒนาต่อจากนี้)** จะเริ่มทำหน้าสรุปรายวัน และฟอร์มกรอกรายรับ-รายจ่าย

---

*สร้างขึ้นโดยระบบอัตโนมัติเพื่อใช้เป็น Overview ของโครงสร้างโปรเจกต์*
