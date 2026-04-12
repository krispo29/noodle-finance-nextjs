import { z } from 'zod';
import { CATEGORY_ICON_NAMES, CategoryIconName } from '@/lib/utils/categories';

export const categoryTypeSchema = z.enum([
  'income',
  'expense',
  'owner_withdrawal',
  'owner_topup',
]);

export const categoryIconNameSchema = z.string().refine(
  (value) => CATEGORY_ICON_NAMES.includes(value as CategoryIconName),
  'ไอคอนหมวดหมู่ไม่ถูกต้อง'
);

export const categoryIdSchema = z.string().min(1).max(80);

export const createCategorySchema = z.object({
  type: categoryTypeSchema,
  label: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่').max(40, 'ชื่อหมวดหมู่ยาวเกินไป'),
  iconName: categoryIconNameSchema,
});

export const updateCategorySchema = z.object({
  id: categoryIdSchema,
  label: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่').max(40, 'ชื่อหมวดหมู่ยาวเกินไป'),
  iconName: categoryIconNameSchema,
  isActive: z.boolean(),
});

export const categoryActionIdSchema = z.object({
  id: categoryIdSchema,
});
