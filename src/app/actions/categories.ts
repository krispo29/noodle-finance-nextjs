'use server';

import { randomUUID } from 'crypto';
import { asc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { transactionCategories, transactions } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/jwt';
import { DEFAULT_TRANSACTION_CATEGORIES } from '@/lib/utils/categories';
import {
  categoryActionIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from '@/lib/validations/category';
import type { TransactionCategory } from '@/types';

type CategoryActionResult = {
  success: boolean;
  error?: string;
};

function revalidateCategoryConsumers() {
  revalidatePath('/');
  revalidatePath('/add');
  revalidatePath('/history');
  revalidatePath('/monthly');
  revalidatePath('/profile');
  revalidatePath('/profile/categories');
}

async function ensureDefaultCategories(userId: string) {
  const existingRows = await db
    .select({ id: transactionCategories.id })
    .from(transactionCategories)
    .where(eq(transactionCategories.userId, userId));

  const existingIds = new Set(existingRows.map((row) => row.id));
  const missingCategories = DEFAULT_TRANSACTION_CATEGORIES.filter(
    (category) => !existingIds.has(category.id)
  );

  if (missingCategories.length === 0) {
    return;
  }

  await db.insert(transactionCategories).values(
    missingCategories.map((category) => ({
      userId,
      id: category.id,
      type: category.type,
      label: category.label,
      iconName: category.iconName,
      sortOrder: category.sortOrder,
      isDefault: true,
      isActive: true,
    }))
  );
}

async function getCategoryCounts(userId: string) {
  const rows = await db
    .select({
      category: transactions.category,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(transactions.category);

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.category] = Number(row.count || 0);
    return acc;
  }, {});
}

export async function getTransactionCategories(
  includeInactive = false
): Promise<TransactionCategory[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    await ensureDefaultCategories(user.userId);

    const rows = await db
      .select()
      .from(transactionCategories)
      .where(eq(transactionCategories.userId, user.userId))
      .orderBy(asc(transactionCategories.type), asc(transactionCategories.sortOrder));
    const categoryCounts = await getCategoryCounts(user.userId);

    return rows
      .filter((row) => includeInactive || row.isActive)
      .map((row) => ({
        id: row.id,
        type: row.type,
        label: row.label,
        iconName: row.iconName,
        sortOrder: row.sortOrder,
        isDefault: row.isDefault,
        isActive: row.isActive,
        transactionCount: categoryCounts[row.id] ?? 0,
      }));
  } catch (error) {
    console.error('Get transaction categories error:', error);
    return [];
  }
}

export async function createTransactionCategory(input: unknown): Promise<CategoryActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบ' };
    }

    const parsed = createCategorySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || 'ข้อมูลหมวดหมู่ไม่ถูกต้อง',
      };
    }

    await ensureDefaultCategories(user.userId);

    const sortOrderResult = await db
      .select({
        maxSortOrder: sql<number>`COALESCE(MAX(${transactionCategories.sortOrder}), -1)`,
      })
      .from(transactionCategories)
      .where(eq(transactionCategories.userId, user.userId));

    await db.insert(transactionCategories).values({
      userId: user.userId,
      id: `custom_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
      type: parsed.data.type,
      label: parsed.data.label.trim(),
      iconName: parsed.data.iconName,
      sortOrder: Number(sortOrderResult[0]?.maxSortOrder ?? -1) + 1,
      isDefault: false,
      isActive: true,
    });

    revalidateCategoryConsumers();
    return { success: true };
  } catch (error) {
    console.error('Create transaction category error:', error);
    return { success: false, error: 'สร้างหมวดหมู่ไม่สำเร็จ' };
  }
}

export async function updateTransactionCategory(input: unknown): Promise<CategoryActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบ' };
    }

    const parsed = updateCategorySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || 'ข้อมูลหมวดหมู่ไม่ถูกต้อง',
      };
    }

    await db
      .update(transactionCategories)
      .set({
        label: parsed.data.label.trim(),
        iconName: parsed.data.iconName,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(
        sql`${transactionCategories.userId} = ${user.userId} AND ${transactionCategories.id} = ${parsed.data.id}`
      );

    revalidateCategoryConsumers();
    return { success: true };
  } catch (error) {
    console.error('Update transaction category error:', error);
    return { success: false, error: 'บันทึกหมวดหมู่ไม่สำเร็จ' };
  }
}

export async function deleteTransactionCategory(input: unknown): Promise<CategoryActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบ' };
    }

    const parsed = categoryActionIdSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'ไม่พบหมวดหมู่ที่ต้องการลบ' };
    }

    const categoryRows = await db
      .select({
        isDefault: transactionCategories.isDefault,
      })
      .from(transactionCategories)
      .where(
        sql`${transactionCategories.userId} = ${user.userId} AND ${transactionCategories.id} = ${parsed.data.id}`
      )
      .limit(1);

    if (categoryRows.length === 0) {
      return { success: false, error: 'ไม่พบหมวดหมู่ที่ต้องการลบ' };
    }

    const usageRows = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(sql`${transactions.userId} = ${user.userId} AND ${transactions.category} = ${parsed.data.id}`);
    const usageCount = Number(usageRows[0]?.count || 0);

    if (usageCount > 0 || categoryRows[0].isDefault) {
      await db
        .update(transactionCategories)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(
          sql`${transactionCategories.userId} = ${user.userId} AND ${transactionCategories.id} = ${parsed.data.id}`
        );
    } else {
      await db
        .delete(transactionCategories)
        .where(
          sql`${transactionCategories.userId} = ${user.userId} AND ${transactionCategories.id} = ${parsed.data.id}`
        );
    }

    revalidateCategoryConsumers();
    return { success: true };
  } catch (error) {
    console.error('Delete transaction category error:', error);
    return { success: false, error: 'ลบหมวดหมู่ไม่สำเร็จ' };
  }
}
