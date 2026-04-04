import { z } from 'zod';

// Transaction validation schema
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'กรุณาเลือกประเภทรายการ',
  }),
  category: z.string({
    required_error: 'กรุณาเลือกหมวดหมู่',
  }).min(1, 'กรุณาเลือกหมวดหมู่'),
  amount: z.coerce
    .number({
      required_error: 'กรุณาระบุจำนวนเงิน',
      invalid_type_error: 'จำนวนเงินต้องเป็นตัวเลข',
    })
    .positive('จำนวนเงินต้องมากกว่า 0')
    .max(999999999.99, 'จำนวนเงินสูงเกินไป'),
  note: z.string().optional().nullable(),
  transactionDate: z.string({
    required_error: 'กรุณาระบุวันที่',
  }).min(1, 'กรุณาระบุวันที่'),
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string({
    required_error: 'กรุณาระบุอีเมล',
  }).email('อีเมลไม่ถูกต้อง'),
  password: z.string({
    required_error: 'กรุณาระบุรหัสผ่าน',
  }).min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

// User registration schema
export const registerSchema = z.object({
  shopName: z.string({
    required_error: 'กรุณาระบุชื่อร้าน',
  }).min(2, 'ชื่อร้านต้องมีอย่างน้อย 2 ตัวอักษร'),
  ownerName: z.string({
    required_error: 'กรุณาระบุชื่อเจ้าของ',
  }).min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string({
    required_error: 'กรุณาระบุอีเมล',
  }).email('อีเมลไม่ถูกต้อง'),
  password: z.string({
    required_error: 'กรุณาระบุรหัสผ่าน',
  }).min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});
