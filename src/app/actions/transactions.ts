'use server';

import { eq, desc, gte, lte, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/jwt';
import { transactionSchema } from '@/lib/validations/transaction';
import { TransactionInput, Transaction, DashboardSummary, HistoryFilters, MonthlyReport } from '@/types';

/**
 * Add a new transaction
 */
export async function addTransaction(data: TransactionInput): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify auth
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'กรุณาเข้าสู่ระบบ',
      };
    }

    // Validate input
    const validated = transactionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'ข้อมูลไม่ถูกต้อง',
      };
    }

    // Insert transaction
    await db.insert(transactions).values({
      userId: user.userId,
      type: validated.data.type,
      category: validated.data.category,
      amount: validated.data.amount.toString(),
      note: validated.data.note || null,
      transactionDate: validated.data.transactionDate,
    });

    // Revalidate dashboard
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Add transaction error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    };
  }
}

/**
 * Get dashboard summary for a specific date
 */
export async function getDashboardSummary(date: string): Promise<DashboardSummary> {
  try {
    // Verify auth
    const user = await getCurrentUser();
    if (!user) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        profit: 0,
        incomeCount: 0,
        expenseCount: 0,
        recentTransactions: [],
      };
    }

    // Get income total
    const incomeResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'income'),
          eq(transactions.transactionDate, date)
        )
      );

    // Get expense total
    const expenseResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'expense'),
          eq(transactions.transactionDate, date)
        )
      );

    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.transactionDate, date)
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(8);

    const totalIncome = Number(incomeResult[0]?.total || 0);
    const totalExpense = Number(expenseResult[0]?.total || 0);

    return {
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      incomeCount: Number(incomeResult[0]?.count || 0),
      expenseCount: Number(expenseResult[0]?.count || 0),
      recentTransactions: recentTransactions as Transaction[],
    };
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      profit: 0,
      incomeCount: 0,
      expenseCount: 0,
      recentTransactions: [],
    };
  }
}

/**
 * Get transaction history with filters
 */
export async function getTransactionHistory(filters: HistoryFilters): Promise<Transaction[]> {
  try {
    // Verify auth
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    // Build conditions
    const conditions = [eq(transactions.userId, user.userId)];

    if (filters.dateFrom) {
      conditions.push(gte(transactions.transactionDate, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(transactions.transactionDate, filters.dateTo));
    }

    if (filters.type && filters.type !== 'all') {
      conditions.push(eq(transactions.type, filters.type));
    }

    if (filters.category) {
      conditions.push(eq(transactions.category, filters.category));
    }

    // Query transactions
    const result = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(100);

    return result as Transaction[];
  } catch (error) {
    console.error('Get transaction history error:', error);
    return [];
  }
}

/**
 * Get monthly report
 */
export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  try {
    // Verify auth
    const user = await getCurrentUser();
    if (!user) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        profit: 0,
        profitMargin: 0,
        incomeByCategory: [],
        expenseByCategory: [],
        dailySummaries: [],
        averageDailyIncome: 0,
        topExpenseCategory: { category: '', total: 0 },
      };
    }

    // Calculate date range for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`;

    // Get income total
    const incomeResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'income'),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      );

    // Get expense total
    const expenseResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'expense'),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      );

    const totalIncome = Number(incomeResult[0]?.total || 0);
    const totalExpense = Number(expenseResult[0]?.total || 0);
    const profit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? Math.round((profit / totalIncome) * 100) : 0;

    // For now, return basic report (will be enhanced in Phase 3)
    return {
      totalIncome,
      totalExpense,
      profit,
      profitMargin,
      incomeByCategory: [],
      expenseByCategory: [],
      dailySummaries: [],
      averageDailyIncome: daysInMonth > 0 ? totalIncome / daysInMonth : 0,
      topExpenseCategory: { category: '', total: 0 },
    };
  } catch (error) {
    console.error('Get monthly report error:', error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      profit: 0,
      profitMargin: 0,
      incomeByCategory: [],
      expenseByCategory: [],
      dailySummaries: [],
      averageDailyIncome: 0,
      topExpenseCategory: { category: '', total: 0 },
    };
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify auth
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'กรุณาเข้าสู่ระบบ',
      };
    }

    // Check ownership
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (transaction.length === 0) {
      return {
        success: false,
        error: 'ไม่พบรายการ',
      };
    }

    if (transaction[0].userId !== user.userId) {
      return {
        success: false,
        error: 'ไม่มีสิทธิ์ลบรายการนี้',
      };
    }

    // Delete transaction
    await db.delete(transactions).where(eq(transactions.id, id));

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/history');

    return { success: true };
  } catch (error) {
    console.error('Delete transaction error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    };
  }
}
