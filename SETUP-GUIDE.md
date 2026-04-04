# 🚀 คู่มือการติดตั้งและใช้งาน - ร้านก๋วยเตี๋ยว Finance Tracker

## 📋 สิ่งที่ต้องเตรียมก่อนใช้งาน

### 1. ข้อกำหนดเบื้องต้น (Prerequisites)

#### ซอฟต์แวร์ที่ต้องติดตั้งก่อน:
- **Node.js** เวอร์ชัน 20.x ขึ้นไป → ดาวน์โหลดจาก https://nodejs.org/
- **PostgreSQL** ฐานข้อมูลเวอร์ชัน 14 ขึ้นไป → ดาวน์โหลดจาก https://www.postgresql.org/download/
- **npm** (มากับ Node.js) หรือ **pnpm/yarn** (เลือกใช้)

#### ตรวจสอบว่าติดตั้งแล้ว:
```bash
node --version
npm --version
psql --version
```

---

## 🔧 ขั้นตอนการติดตั้ง (Step-by-Step Setup)

### ขั้นตอนที่ 1: ติดตั้ง Dependencies

```bash
npm install
```

**คำสั่งนี้จะติดตั้ง:**
- Next.js 16
- React 19
- Tailwind CSS 4
- Drizzle ORM
- Framer Motion
- Recharts
- react-hook-form
- Zod
- และ libraries อื่นๆ ที่จำเป็น

---

### ขั้นตอนที่ 2: ตั้งค่าไฟล์ Environment

1. **คัดลอกไฟล์ตัวอย่าง:**
```bash
copy .env.example .env.local
```

2. **แก้ไขไฟล์ `.env.local`:**

เปิดไฟล์ `.env.local` แล้วแก้ไขดังนี้:

```env
# Database URL - เปลี่ยนค่าตามการตั้งค่า PostgreSQL ของคุณ
DATABASE_URL=postgresql://username:password@localhost:5432/noodle-finance-db

# JWT Secret - เปลี่ยนเป็นค่าที่ปลอดภัย (ใช้สำหรับเข้ารหัส Token)
# แนะนำให้ใช้ random string ยาวอย่างน้อย 32 ตัวอักษร
JWT_SECRET=your-secret-here-change-this-in-production-must-be-long-random-string

# ชื่อแอพพลิเคชัน (แสดงใน UI)
NEXT_PUBLIC_APP_NAME=บัญชีร้านก๋วยเตี๋ยว
```

#### 🔐 วิธีสร้าง JWT Secret ที่ปลอดภัย:

**Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**macOS/Linux:**
```bash
openssl rand -base64 64
```

---

### ขั้นตอนที่ 3: สร้างฐานข้อมูล

#### 3.1 สร้างฐานข้อมูลใน PostgreSQL

**วิธีที่ 1: ใช้ pgAdmin (แนะนำสำหรับผู้เริ่มต้น)**
1. เปิด pgAdmin
2. คลิกขวาที่ "Databases" → "Create" → "Database"
3. ตั้งชื่อ: `noodle-finance-db`
4. กด "Save"

**วิธีที่ 2: ใช้ Command Line**
```bash
# เข้าสู่ระบบ PostgreSQL
psql -U postgres

# สร้างฐานข้อมูล
CREATE DATABASE noodle-finance-db;

# ออกจากระบบ
\q
```

#### 3.2 สร้างตารางข้อมูลด้วย Drizzle

```bash
# สร้างตารางอัตโนมัติ
npm run db:push
```

**คำสั่งนี้จะ:**
- เชื่อมต่อกับฐานข้อมูลที่ระบุใน `.env.local`
- สร้างตาราง `users`, `transactions`, `monthly_goals` ตาม schema
- สร้าง enum types ที่จำเป็น
- ไม่ลบข้อมูลที่มีอยู่

#### 3.3 (ทางเลือก) ตรวจสอบฐานข้อมูล

```bash
# เปิด Drizzle Studio (UI สำหรับดู/แก้ไขข้อมูล)
npm run db:studio
```

จากนั้นเปิดเบราว์เซอร์ไปที่: http://localhost:4567

---

### ขั้นตอนที่ 4: สร้างผู้ใช้ทดสอบ (Optional)

หากต้องการทดสอบระบบ Login ต้องสร้างผู้ใช้ก่อน:

#### วิธีที่ 1: ใช้ SQL โดยตรง

```sql
-- สร้างผู้ใช้ทดสอบ (รหัสผ่าน: test123)
INSERT INTO users (shop_name, owner_name, email, password_hash) 
VALUES (
  'ร้านก๋วยเตี๋ยวทดสอบ',
  'ทดสอบ',
  'test@example.com',
  '$2a$10$Zs8Vx9YqK5pL2mN3oP4qR6sT7uV8wX9yA0bC1dE2fG3hI4jK5lM6n'
);
```

⚠️ **หมายเหตุ**: ต้อง hash รหัสผ่านใหม่ด้วย bcrypt เพราะ hash ข้างต้นเป็นแค่ตัวอย่าง

#### วิธีที่ 2: ใช้ Registration (เมื่อพัฒนาเสร็จ)

เพิ่มหน้าสมัครสมาชิกที่ `/register` หรือใช้ API:

```bash
# สร้างไฟล์ test-user.js
const bcrypt = require('bcryptjs');

const password = 'test123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Hashed password:', hashedPassword);
console.log('\n-- SQL --');
console.log(`
INSERT INTO users (shop_name, owner_name, email, password_hash) 
VALUES (
  'ร้านก๋วยเตี๋ยวทดสอบ',
  'ทดสอบ',
  'test@example.com',
  '${hashedPassword}'
);
`);
```

รัน:
```bash
node test-user.js
```

จากนั้นนำ SQL ที่ได้ไปรันใน PostgreSQL

---

### ขั้นตอนที่ 5: รันแอพพลิเคชัน

#### รันในโหมด Development:

```bash
npm run dev
```

**ผลลัพธ์ที่ควรเห็น:**
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Starting...
✓ Ready in 2.5s
```

เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

---

## ✅ ตรวจสอบว่าติดตั้งสำเร็จ

### 1. ทดสอบเข้าหน้า Login
- เปิดเบราว์เซอร์ → http://localhost:3000
- ควร redirect ไปหน้า `/login` อัตโนมัติ
- เห็นหน้า Login ที่มี 🍜 และฟอร์มกรอกอีเมล/รหัสผ่าน

### 2. ทดสอบ Login
- กรอกอีเมลและรหัสผ่านของผู้ใช้ที่สร้างไว้
- กด "เข้าสู่ระบบ"
- ควร redirect ไปหน้า Dashboard

### 3. ทดสอบ Dashboard
- เห็นหัวข้อ "สรุปวันนี้"
- เห็นการ์ดรายได้/ค่าใช้จ่าย
- เห็นปุ่ม FAB (+) มุมขวาล่าง

### 4. ทดสอบเพิ่มรายการ
- กดปุ่ม FAB (+)
- กรอกฟอร์ม:
  - เลือกประเภทรายการ (รายได้/ค่าใช้จ่าย)
  - เลือกหมวดหมู่
  - ระบุจำนวนเงิน
  - กดบันทึก
- ควรแสดงหน้าสำเร็จพร้อม redirect กลับ Dashboard

### 5. ทดสอบ Dark Mode
- กดปุ่มพระอาทิตย์/พระจันทร์บน Header
- หน้าจอควรสลับเป็น Dark/Light mode

### 6. ทดสอบ Responsive
- ย่อ/ขยายหน้าจอมองว่า layout ปรับตามหรือไม่
- บนมือถือ (< 768px) → แสดง BottomNav
- บน Desktop (≥ 768px) → แสดง Sidebar

---

## 🗂️ คำสั่ง NPM Scripts ที่ใช้งานได้

```bash
# รัน development server
npm run dev

# Build สำหรับ production
npm run build

# รัน production server
npm start

# ตรวจสอบ code with ESLint
npm run lint

# สร้าง migration files (Drizzle)
npm run db:generate

# รัน migrations
npm run db:migrate

# Push schema ไปยัง database (สำหรับ development)
npm run db:push

# เปิด Drizzle Studio (ดูข้อมูลใน DB)
npm run db:studio
```

---

## 🐛 แก้ปัญหาที่พบบ่อย

### ปัญหา: "Connection refused" เมื่อรัน db:push

**สาเหตุ:** PostgreSQL ไม่ทำงาน หรือ URL ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบว่า PostgreSQL กำลังทำงาน:
   ```bash
   # Windows
   services.msc
   # หา "postgresql-x64-xx" และดูว่าสถานะเป็น "Running"

   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. ตรวจสอบ `DATABASE_URL` ใน `.env.local` ให้ถูกต้อง:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/noodle-finance-db
   ```
   - `username`: ชื่อผู้ใช้ PostgreSQL (มักเป็น `postgres`)
   - `password`: รหัสผ่านที่ตั้งไว้ตอนติดตั้ง
   - `localhost`: ชื่อ server (ถ้าอยู่เครื่องอื่นให้เปลี่ยนเป็น IP)
   - `5432`: port ของ PostgreSQL
   - `noodle-finance-db`: ชื่อฐานข้อมูล

---

### ปัญหา: "Module not found" เมื่อ npm run dev

**สาเหตุ:** Dependencies ไม่ครบ หรือ node_modules เสียหาย

**วิธีแก้:**
```bash
# ลบ node_modules และ package-lock.json
rmdir /s /q node_modules
del package-lock.json

# ติดตั้งใหม่
npm install
```

---

### ปัญหา: หน้าจอว่างเปล่า หรือ White Screen

**สาเหตุ:** JavaScript error ในเบราว์เซอร์

**วิธีแก้:**
1. เปิด Developer Tools (F12)
2. ดูที่ Console Tab
3. อ่าน error message
4. ลอง clear cache และ reload (Ctrl+Shift+R)

---

### ปัญหา: Dark mode กระพริบตอนโหลด

**สาเหตุ:** Hydration mismatch

**วิธีแก้:**
- แก้ไขแล้วในโค้ด (ใช้ `suppressHydrationWarning` บน `<html>`)
- ตรวจสอบว่า `next-themes` ติดตั้งถูกต้อง

---

## 📦 โครงสร้างโปรเจกต์

```
noodle-finance-nextjs/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes
│   │   │   └── login/page.tsx        # หน้า Login
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── add/page.tsx          # เพิ่มรายการ
│   │   │   ├── history/page.tsx      # ประวัติ
│   │   │   └── monthly/page.tsx      # สรุปเดือน
│   │   ├── api/auth/session/         # API ตรวจสอบ session
│   │   ├── actions/                  # Server Actions
│   │   │   ├── auth.ts               # Login/Logout
│   │   │   └── transactions.ts       # CRUD รายการ
│   │   ├── layout.tsx                # Root layout
│   │   ├── Providers.tsx             # QueryClient provider
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── layout/                   # Layout components
│   │   │   ├── AppShell.tsx          # App shell
│   │   │   ├── BottomNav.tsx         # Mobile nav
│   │   │   └── Sidebar.tsx           # Desktop nav
│   │   └── shared/                   # Shared components
│   │       ├── CurrencyDisplay.tsx   # แสดงเงิน
│   │       ├── ThaiDateLabel.tsx     # แสดงวันที่ไทย
│   │       ├── ThemeToggle.tsx       # สลับโหมดมืด/สว่าง
│   │       └── LoadingSpinner.tsx    # Loading indicator
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle client
│   │   │   └── schema.ts             # Database schema
│   │   ├── auth/
│   │   │   └── jwt.ts                # JWT utilities
│   │   ├── validations/
│   │   │   └── transaction.ts        # Zod schemas
│   │   └── utils/
│   │       ├── formatCurrency.ts     # ฟอร์แมตเงิน
│   │       ├── formatThaiDate.ts     # ฟอร์แมตวันที่ไทย
│   │       └── categories.ts         # หมวดหมู่
│   ├── hooks/
│   │   ├── useAuth.ts                # Auth hook
│   │   └── useTransactions.ts        # Query hooks
│   ├── stores/
│   │   └── useAppStore.ts            # Zustand store
│   └── types/
│       └── index.ts                  # TypeScript types
├── .env.example                      # Environment template
├── .env.local                        # (ไม่อยู่ใน git) Environment จริง
├── drizzle.config.ts                 # Drizzle config
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
└── README.md                         # Documentation
```

---

## 🔒 Security Best Practices

### สำหรับ Production:

1. **เปลี่ยน JWT Secret ให้เป็นค่าที่สุ่มและยาว**
   ```env
   JWT_SECRET=<random-64-character-string>
   ```

2. **ใช้ HTTPS**
   - Deploy กับ platform ที่รองรับ HTTPS อัตโนมัติ
   - เช่น Vercel, Railway, Render

3. **ตั้งค่า Environment Variables ใน Production**
   - อย่าเก็บ `.env.local` ใน git
   - ใช้ dashboard ของ hosting provider ตั้งค่า

4. **ใช้ Password ที่แข็งแรง**
   - บังคับให้ผู้ใช้ใช้รหัสผ่านยาวอย่างน้อย 8 ตัว
   - มีตัวพิมพ์ใหญ่, พิมพ์เล็ก, ตัวเลข, สัญลักษณ์

5. **Database Connection Pooling**
   - สำหรับ production ที่มีผู้ใช้หลายคน
   - ใช้ PgBouncer หรือ connection pooler ของ hosting provider

6. **Rate Limiting**
   - จำกัดจำนวนครั้งในการ Login
   - ป้องกัน brute force attack

---

## 🌐 การ Deploy ไป Production

### วิธีที่ 1: Vercel (แนะนำ)

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy production
vercel --prod
```

**ตั้งค่า Environment Variables ใน Vercel Dashboard:**
1. ไปที่ Project Settings → Environment Variables
2. เพิ่ม:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_NAME`

### วิธีที่ 2: Railway

1. เชื่อมต่อ GitHub repository
2. Railway จะ detect Next.js อัตโนมัติ
3. เพิ่ม Environment Variables ใน dashboard
4. Deploy อัตโนมัติเมื่อ push

### วิธีที่ 3: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 การสนับสนุนเพิ่มเติม

หากมีปัญหาหรือคำถาม:
1. อ่าน `README.md` ในโปรเจกต์
2. อ่าน checklist ใน `PHASE-*-CHECKLIST.md`
3. ตรวจสอบ error logs: `npm run dev` แล้วดูที่ terminal

---

## ✅ Checklist การติดตั้ง

- [ ] ติดตั้ง Node.js 20+
- [ ] ติดตั้ง PostgreSQL 14+
- [ ] รัน `npm install`
- [ ] สร้างไฟล์ `.env.local` จาก `.env.example`
- [ ] ตั้งค่า `DATABASE_URL` และ `JWT_SECRET`
- [ ] สร้างฐานข้อมูล `noodle-finance-db`
- [ ] รัน `npm run db:push`
- [ ] สร้างผู้ใช้ทดสอบ
- [ ] รัน `npm run dev`
- [ ] ทดสอบเข้า http://localhost:3000
- [ ] ทดสอบ Login
- [ ] ทดสอบเพิ่มรายการ
- [ ] ทดสอบ Dark mode
- [ ] ทดสอบ Responsive

---

**🎉 หากทำครบทุกขั้นตอนแล้ว แอพพร้อมใช้งานแล้ว!**
