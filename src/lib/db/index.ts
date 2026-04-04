import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// โหลด environment variables จาก .env.local ถ้าไม่ได้อยู่ใน production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

// ตรวจสอบว่ามี DATABASE_URL หรือไม่
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// สร้าง Connection Pool สำหรับ Local PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// สร้าง Drizzle client
export const db = drizzle(pool, { schema });

// Export type สำหรับใช้งาน
export type Database = typeof db;
