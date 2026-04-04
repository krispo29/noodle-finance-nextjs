# 🚀 คู่มือการ Deploy บน Vercel

## 📋 สิ่งที่ต้องเตรียมก่อน Deploy

### 1. บัญชีที่จำเป็น
- ✅ บัญชี **GitHub** → https://github.com
- ✅ บัญชี **Vercel** (สมัครด้วย GitHub ได้) → https://vercel.com
- ✅ ฐานข้อมูล **PostgreSQL** บน Cloud (เลือกอย่างใดอย่างหนึ่งด้านล่าง)

---

## 🗄️ ขั้นตอนที่ 1: เตรียมฐานข้อมูลบน Cloud

เนื่องจาก Vercel ไม่มีฐานข้อมูลใน-built ต้องใช้บริการ Database แยก

### ตัวเลือกที่ 1: Neon (แนะนำ - ง่ายที่สุด) ⭐

**ขั้นตอน:**
1. ไปที่ https://neon.tech/
2. กด **"Sign Up"** → เลือก "Continue with GitHub"
3. กด **"New Project"**
4. ตั้งชื่อ Project: `noodle-finance`
5. ตั้งชื่อ Database: `noodle_finance`
6. กด **"Create Project"**
7. คัดลอก **Connection String** (รูปแบบ: `postgresql://...`)

**ตัวอย่าง Connection String:**
```
postgresql://noodle_finance_user:password@ep-xyz123.ap-southeast-1.aws.neon.tech/noodle_finance?sslmode=require
```

### ตัวเลือกที่ 2: Supabase

**ขั้นตอน:**
1. ไปที่ https://supabase.com/
2. กด **"Start your project"** → Login ด้วย GitHub
3. กด **"New Project"**
4. ตั้งชื่อ: `noodle-finance`
5. ตั้ง Database Password (จำไว้!)
6. เลือก Region: Southeast Asia (Singapore)
7. กด **"Create new project"**
8. ไปที่ Settings → Database → คัดลอก **Connection string** (URI mode)

### ตัวเลือกที่ 3: Railway

**ขั้นตอน:**
1. ไปที่ https://railway.app/
2. Login ด้วย GitHub
3.กด **"New Project"** → **"Provision PostgreSQL"**
4. รอให้ database พร้อม
5. ไปที่ PostgreSQL → Connect → คัดลอก **Connection URL**

### ตัวเลือกที่ 4: Aiven

**ขั้นตอน:**
1. ไปที่ https://aiven.io/
2. สมัครบัญชี (มี free tier)
3. Create Service → PostgreSQL
4. เลือก Region: Singapore
5. คัดลอก **Service URI**

---

## 🔐 ขั้นตอนที่ 2: สร้าง JWT Secret

เปิด **PowerShell** แล้วรันคำสั่งนี้:

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**ตัวอย่างผลลัพธ์:**
```
xK9mP2nQ5rS8tU1vW3xY6zA7bC4dE0fG9hI2jK5lM8nO1pQ4rS7tU0vW3xY6z
```

**คัดลอกเก็บไว้** - จะต้องใช้ในขั้นตอนถัดไป

---

## 📦 ขั้นตอนที่ 3: Push Code ขึ้น GitHub

### 3.1 สร้าง Git Repository (ถ้ายังไม่มี)

```bash
# ในโฟลเดอร์โปรเจกต์
git init
git add .
git commit -m "Initial commit - Noodle Finance App"
```

### 3.2 สร้าง Repository บน GitHub

1. ไปที่ https://github.com/new
2. ตั้งชื่อ: `noodle-finance-nextjs`
3. เลือก **Private** (แนะนำ)
4. กด **"Create repository"**

### 3.3 Push Code

```bash
# เชื่อมต่อกับ GitHub (เปลี่ยน username และ repo-name)
git remote add origin https://github.com/YOUR_USERNAME/noodle-finance-nextjs.git

# Push ขึ้น GitHub
git branch -M main
git push -u origin main
```

**ตรวจสอบ:** เปิด GitHub repository ของคุณ → ควรเห็นไฟล์ทั้งหมด

---

## 🚀 ขั้นตอนที่ 4: Deploy บน Vercel

### วิธีที่ 1: Deploy ผ่าน GitHub (แนะนำ) ⭐

**ขั้นตอน:**

1. **Login Vercel**
   - ไปที่ https://vercel.com
   - กด **"Log in"** → เลือก "Continue with GitHub"

2. **Import Repository**
   - กด **"Add New..."** → **"Project"**
   - เลือก **"Import Git Repository"**
   - หารายชื่อ `noodle-finance-nextjs`
   - กด **"Import"**

3. **ตั้งค่า Project**
   - **Project Name**: `noodle-finance`
   - **Framework Preset**: Next.js (ควรถูกเลือกอัตโนมัติ)
   - **Root Directory**: `./` (ไม่ต้องเปลี่ยน)

4. **ตั้งค่า Environment Variables** ⚠️ (สำคัญมาก!)
   
   กด **"Environment Variables"** แล้วเพิ่มทีละตัว:

   #### ตัวที่ 1: DATABASE_URL
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```
   **ตัวอย่าง:**
   ```
   DATABASE_URL=postgresql://noodle_finance_user:abc123@ep-xyz123.ap-southeast-1.aws.neon.tech/noodle_finance?sslmode=require
   ```

   #### ตัวที่ 2: JWT_SECRET
   ```
   JWT_SECRET=xK9mP2nQ5rS8tU1vW3xY6zA7bC4dE0fG9hI2jK5lM8nO1pQ4rS7tU0vW3xY6z
   ```
   (ใช้ค่าที่สร้างไว้ในขั้นตอนที่ 2)

   #### ตัวที่ 3: NEXT_PUBLIC_APP_NAME
   ```
   NEXT_PUBLIC_APP_NAME=บัญชีร้านก๋วยเตี๋ยว
   ```

   **ตัวอย่างหน้าจอ Environment Variables:**
   ```
   ┌─────────────────────────────────────────────┐
   │ Key                  │ Value                │
   ├─────────────────────────────────────────────┤
   │ DATABASE_URL         │ postgresql://...     │
   │ JWT_SECRET           │ xK9mP2nQ5rS8t...     │
   │ NEXT_PUBLIC_APP_NAME │ บัญชีร้านก๋วยเตี๋ยว      │
   └─────────────────────────────────────────────┘
   ```

5. **Deploy**
   - กด **"Deploy"**
   - รอ 2-3 นาที
   - Vercel จะ build และ deploy อัตโนมัติ

6. **เสร็จสิ้น!**
   - เมื่อเห็นหน้าจอ "🎉 Congratulations!"
   - กด **"Continue to Dashboard"**
   - กด **"Visit"** เพื่อดูเว็บไซต์ที่ deploy แล้ว

---

### วิธีที่ 2: Deploy ผ่าน Vercel CLI

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

**เมื่อถามหา Environment Variables:**
```
? Set up and deploy "D:\Works\noodle-finance-nextjs"? [Y/n] Y
? Which scope do you want to deploy to? [เลือก your account]
? Link to existing project? [N]
? What's your project's name? [noodle-finance]
? In which directory is your code located? [./]
? Want to modify these settings? [Y]
? Environment Variable Name: DATABASE_URL
? Environment Variable Value: postgresql://...
? Save as [x] Production, [x] Preview, [x] Development? Y

? Environment Variable Name: JWT_SECRET
? Environment Variable Value: xK9mP2nQ5rS8...
? Save as [x] Production, [x] Preview, [x] Development? Y

? Environment Variable Name: NEXT_PUBLIC_APP_NAME
? Environment Variable Value: บัญชีร้านก๋วยเตี๋ยว
? Save as [x] Production, [x] Preview, [x] Development? Y
```

---

## 🗄️ ขั้นตอนที่ 5: สร้างตารางฐานข้อมูล

หลังจาก deploy สำเร็จ ต้องสร้างตารางข้อมูล:

### วิธีที่ 1: ใช้ Vercel CLI (แนะนำ)

```bash
# รัน db:push บน production
DATABASE_URL=postgresql://... npm run db:push
```

### วิธีที่ 2: ใช้ Database Client เชื่อมต่อ

**ใช้ psql:**
```bash
psql "postgresql://username:password@host:port/database?sslmode=require"

# รันคำสั่งสร้างตาราง
\i drizzle/0000_initial.sql
```

**ใช้ TablePlus/pgAdmin/DBeaver:**
1. เปิดโปรแกรม
2. New Connection → PostgreSQL
3. ใส่ข้อมูลจาก `DATABASE_URL`:
   - Host: `ep-xyz123.ap-southeast-1.aws.neon.tech`
   - Port: `5432`
   - Database: `noodle_finance`
   - User: `noodle_finance_user`
   - Password: `your_password`
   - SSL: Required
4. Connect
5. Run SQL migration files

### วิธีที่ 3: ใช้ Neon Dashboard (ถ้าใช้ Neon)

1. ไปที่ https://console.neon.tech/
2. เลือก project ของคุณ
3. กด **"SQL Editor"**
4. คัดลอก SQL schema จากไฟล์ `src/lib/db/schema.ts` มาเขียนเป็น SQL
5. Execute

---

## 👤 ขั้นตอนที่ 6: สร้างผู้ใช้คนแรก

### วิธีที่ 1: ใช้ SQL Editor

```sql
-- สร้างผู้ใช้ทดสอบ (รหัสผ่าน: test123)
-- ⚠️ ต้อง hash รหัสผ่านใหม่! ใช้วิธีที่ 2 ดีกว่า

-- วิธีที่ดีกว่า: สร้าง hash ด้วย Node.js
```

### วิธีที่ 2: ใช้ Script สร้าง Hash

**สร้างไฟล์ `create-user.js`:**
```javascript
const bcrypt = require('bcryptjs');

const password = 'test123'; // เปลี่ยนเป็นรหัสผ่านที่ต้องการ
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('-- SQL สำหรับสร้างผู้ใช้ --');
console.log(`
INSERT INTO users (id, shop_name, owner_name, email, password_hash) 
VALUES (
  gen_random_uuid(),
  'ร้านก๋วยเตี๋ยวทดสอบ',
  'ทดสอบ',
  'test@example.com',
  '${hashedPassword}'
);
`);
```

**รัน:**
```bash
node create-user.js
```

**คัดลอก SQL ที่ได้ไปรันใน Database**

### วิธีที่ 3: ใช้ Vercel Postgres API (ถ้าใช้ Vercel Storage)

```bash
curl -X POST "https://api.vercel.com/v1/postgres/..." \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d "INSERT INTO users ..."
```

---

## ✅ ขั้นตอนที่ 7: ตรวจสอบว่า Deploy สำเร็จ

### 1. เข้าเว็บไซต์

```
https://noodle-finance.vercel.app
```
(เปลี่ยนตามชื่อ project ของคุณ)

### 2. ทดสอบ Login

- ควร redirect ไป `/login` อัตโนมัติ
- กรอกอีเมล/รหัสผ่านของผู้ใช้ที่สร้างไว้
- ควรเข้า Dashboard ได้

### 3. ทดสอบฟีเจอร์ต่างๆ

- ✅ เพิ่มรายการ
- ✅ ดูประวัติ
- ✅ ดูสรุปเดือน
- ✅ Dark mode
- ✅ Responsive บนมือถือ

### 4. ตรวจสอบ Logs (ถ้ามีปัญหา)

1. ไปที่ Vercel Dashboard
2. เลือก Project
3. กด **"Logs"**
4. ดู Runtime Logs และ Deployment Logs

---

## 🔧 การตั้งค่าเพิ่มเติม

### ตั้ง Custom Domain

1. ไปที่ Vercel Dashboard → Project
2. กด **"Settings"** → **"Domains"**
3. ใส่ domain ของคุณ (เช่น `finance.yourshop.com`)
4. ทำตามขั้นตอนการตั้งค่า DNS

### ตั้ง Auto-Deploy

เมื่อ push code ขึ้น `main` branch → Vercel จะ deploy อัตโนมัติ!

```bash
git add .
git commit -m "เพิ่มฟีเจอร์ใหม่"
git push origin main
# Vercel จะ deploy อัตโนมัติภายใน 1-2 นาที
```

### ตั้ง Environment Variables สำหรับ Preview

หากต้องการทดสอบก่อน merge:
1. Vercel Dashboard → Settings → Environment Variables
2. เพิ่มตัวแปรเดิม แต่เลือก Preview environment
3. ทุกครั้งที่สร้าง PR → Vercel จะสร้าง preview URL ให้ทดสอบ

---

## 🐛 แก้ปัญหาที่พบบ่อย

### ปัญหา: Build Failed

**สาเหตุที่เป็นไปได้:**
1. TypeScript errors
2. Missing dependencies
3. Environment variables ไม่ถูกต้อง

**วิธีแก้:**
```bash
# ทดสอบ build ในเครื่องก่อน
npm run build

# แก้ errors ทั้งหมด
# แล้ว push ใหม่
git add .
git commit -m "fix build errors"
git push
```

---

### ปัญหา: "Database connection failed"

**สาเหตุ:**
1. `DATABASE_URL` ไม่ถูกต้อง
2. Database ไม่อนุญาต connection จาก Vercel
3. SSL ไม่ได้เปิดใช้

**วิธีแก้:**

1. **ตรวจสอบ DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   ```
   ⚠️ ต้องมี `?sslmode=require` ท้าย!

2. **อนุญาต connection จากทุกที่:**
   - Neon: อนุญาตอัตโนมัติ
   - Supabase: Settings → Database → Network → Allow all IPs
   - อื่นๆ: Whitelist Vercel IPs

3. **ทดสอบ connection:**
   ```bash
   psql "DATABASE_URL ของคุณ"
   ```

---

### ปัญหา: Login ไม่ได้

**สาเหตุ:**
1. JWT_SECRET ไม่ได้ตั้งใน Environment Variables
2. ตาราง `users` ยังไม่มีข้อมูล

**วิธีแก้:**
1. ตรวจสอบใน Vercel → Settings → Environment Variables
2. ต้องมี `JWT_SECRET` และ `DATABASE_URL`
3. สร้างผู้ใช้ด้วย SQL

---

### ปัญหา: 404 Not Found

**สาเหตุ:**
1. Routes ไม่ได้ generate ตอน build
2. Middleware redirect ผิดพลาด

**วิธีแก้:**
```bash
# ทดสอบ build ในเครื่อง
npm run build

# ดูที่ output ว่ามี routes ครบไหม
# ควรเห็น:
# Route (app)
# ├ ○ /
# ├ ○ /add
# ├ ƒ /api/auth/session
# ├ ○ /history
# ├ ○ /login
# ├ ○ /monthly
# └ ○ /_not-found
```

---

## 🔒 Security Checklist สำหรับ Production

- [x] `JWT_SECRET` เป็นค่าสุ่มยาว 64+ ตัวอักษร
- [x] `DATABASE_URL` ใช้ SSL (`?sslmode=require`)
- [x] รหัสผ่านผู้ใช้ hash ด้วย bcrypt แล้ว
- [x] ไม่เก็บ `.env.local` ใน Git
- [x] Repository เป็น Private (ไม่ใช่ Public)
- [ ] เปิดใช้ Vercel Password Protection (ถ้าต้องการ)
- [ ] ตั้ง Rate Limiting ที่ API routes

---

## 📊 Vercel Free Tier Limits

- ✅ **Deploy:** ไม่จำกัดจำนวนครั้ง
- ✅ **Bandwidth:** 100 GB/เดือน
- ✅ **Serverless Functions:** 100 GB-hours
- ✅ **Build Minutes:** 6,000 นาที/เดือน
- ✅ **Custom Domains:** ไม่จำกัด
- ⚠️ **Serverless Function Timeout:** 10 วินาที (เพียงพอสำหรับ app นี้)

---

## 📈 การ Monitor หลัง Deploy

### 1. Vercel Analytics
- ไปที่ Dashboard → Project → **Analytics**
- ดู: Visits, Visitors, Popular pages

### 2. Vercel Logs
- ไปที่ Dashboard → Project → **Logs**
- ดู: Errors, Warnings, API calls

### 3. Database Monitoring
- Neon/Supabase dashboard
- ดู: Connections, Query performance, Storage

---

## 🎉 เสร็จสิ้น!

หลังจากทำครบทุกขั้นตอนแล้ว แอพของคุณจะ online พร้อมใช้งาน!

**ตัวอย่าง URL:**
```
https://noodle-finance.vercel.app
```

**สิ่งที่ทำได้ต่อไป:**
- เพิ่มผู้ใช้จริง
- ใช้งานจริง
- เก็บข้อมูลรายได้/ค่าใช้จ่าย
- ดูรายงานประจำเดือน

---

## 📞 ต้องการความช่วยเหลือ?

1. อ่าน `SETUP-GUIDE.md` สำหรับการตั้งค่าในเครื่อง
2. อ่าน `PHASE-*-CHECKLIST.md` สำหรับรายละเอียดแต่ละฟีเจอร์
3. ดู Vercel Logs ถ้ามีปัญหา
4. ตรวจสอบ Database connection

---

**🚀 Happy Deploying!**
