'use server';

import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { addDays, format, subDays } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { transactions, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/jwt';
import { transactionSchema } from '@/lib/validations/transaction';
import {
  DashboardAlert,
  DashboardSummary,
  HistoryFilters,
  MonthlyReport,
  Transaction,
  TransactionInput,
} from '@/types';

/**
 * Add a new transaction
 */
export async function addTransaction(
  data: TransactionInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'กรุณาเข้าสู่ระบบ',
      };
    }

    const validated = transactionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'ข้อมูลไม่ถูกต้อง',
      };
    }

    await db.insert(transactions).values({
      userId: user.userId,
      type: validated.data.type,
      category: validated.data.category,
      amount: validated.data.amount.toString(),
      note: validated.data.note || null,
      transactionDate: validated.data.transactionDate,
    });

    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/monthly');

    return { success: true };
  } catch (error) {
    console.error('Add transaction error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    };
  }
}

function emptyDashboardSummary(): DashboardSummary {
  return {
    totalIncome: 0,
    totalExpense: 0,
    ownerWithdrawal: 0,
    ownerTopup: 0,
    actualCashBalance: 0,
    profit: 0,
    dailySalesGoal: 0,
    remainingToGoal: 0,
    goalReached: false,
    currentWeekExpenseTotal: 0,
    previousWeekExpenseTotal: 0,
    currentWeekIngredientExpense: 0,
    previousWeekIngredientExpense: 0,
    currentWeekProfitMargin: 0,
    previousWeekProfitMargin: 0,
    currentWeekIngredientShare: 0,
    currentWeekIngredientCostRate: 0,
    currentWeek: {
      income: 0,
      expense: 0,
      ownerWithdrawal: 0,
      ownerTopup: 0,
      netProfit: 0,
      averageIngredientExpensePerDay: 0,
    },
    previousWeek: {
      income: 0,
      expense: 0,
      ownerWithdrawal: 0,
      ownerTopup: 0,
      netProfit: 0,
      averageIngredientExpensePerDay: 0,
    },
    dailySummaries: [],
    expenseByCategory: [],
    topExpenseCategory: { category: '', total: 0, count: 0, percentage: 0 },
    weeklyTrendMessage: '',
    alerts: [],
    incomeCount: 0,
    expenseCount: 0,
    ownerWithdrawalCount: 0,
    ownerTopupCount: 0,
    recentTransactions: [],
  };
}

/**
 * Get dashboard summary for a specific date
 */
export async function getDashboardSummary(date: string): Promise<DashboardSummary> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return emptyDashboardSummary();
    }

    const currentWeekStart = format(subDays(new Date(date), 6), 'yyyy-MM-dd');
    const previousWeekStart = format(subDays(new Date(date), 13), 'yyyy-MM-dd');
    const previousWeekEnd = format(subDays(new Date(date), 7), 'yyyy-MM-dd');

    const userRecord = await db
      .select({ dailySalesGoal: users.dailySalesGoal })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    const summaryRows = await db
      .select({
        type: transactions.type,
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.transactionDate, date)
        )
      )
      .groupBy(transactions.type);

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

    const currentWeekExpenseResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'expense'),
          gte(transactions.transactionDate, currentWeekStart),
          lte(transactions.transactionDate, date)
        )
      );

    const previousWeekExpenseResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'expense'),
          gte(transactions.transactionDate, previousWeekStart),
          lte(transactions.transactionDate, previousWeekEnd)
        )
      );

    const currentWeekRows = await db
      .select({
        type: transactions.type,
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          gte(transactions.transactionDate, currentWeekStart),
          lte(transactions.transactionDate, date)
        )
      )
      .groupBy(transactions.type);

    const previousWeekRows = await db
      .select({
        type: transactions.type,
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          gte(transactions.transactionDate, previousWeekStart),
          lte(transactions.transactionDate, previousWeekEnd)
        )
      )
      .groupBy(transactions.type);

    const currentWeekIngredientResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'expense'),
          eq(transactions.category, 'ingredients'),
          gte(transactions.transactionDate, currentWeekStart),
          lte(transactions.transactionDate, date)
        )
      );

    const previousWeekIngredientResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'expense'),
          eq(transactions.category, 'ingredients'),
          gte(transactions.transactionDate, previousWeekStart),
          lte(transactions.transactionDate, previousWeekEnd)
        )
      );

    const currentWeekDailyRows = await db
      .select({
        date: transactions.transactionDate,
        type: transactions.type,
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          gte(transactions.transactionDate, currentWeekStart),
          lte(transactions.transactionDate, date)
        )
      )
      .groupBy(transactions.transactionDate, transactions.type);

    const currentWeekExpenseByCategoryRows = await db
      .select({
        category: transactions.category,
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          eq(transactions.type, 'expense'),
          gte(transactions.transactionDate, currentWeekStart),
          lte(transactions.transactionDate, date)
        )
      )
      .groupBy(transactions.category);

    const totalsByType = summaryRows.reduce<Record<string, { total: number; count: number }>>(
      (acc, row) => {
        acc[row.type] = {
          total: Number(row.total || 0),
          count: Number(row.count || 0),
        };
        return acc;
      },
      {}
    );

    const totalIncome = totalsByType.income?.total || 0;
    const totalExpense = totalsByType.expense?.total || 0;
    const ownerWithdrawal = totalsByType.owner_withdrawal?.total || 0;
    const ownerTopup = totalsByType.owner_topup?.total || 0;
    const dailySalesGoal = Number(userRecord[0]?.dailySalesGoal || 0);
    const remainingToGoal = Math.max(dailySalesGoal - totalIncome, 0);
    const currentWeekExpenseTotal = Number(currentWeekExpenseResult[0]?.total || 0);
    const previousWeekExpenseTotal = Number(previousWeekExpenseResult[0]?.total || 0);
    const currentWeekIngredientExpense = Number(currentWeekIngredientResult[0]?.total || 0);
    const previousWeekIngredientExpense = Number(previousWeekIngredientResult[0]?.total || 0);
    const alerts: DashboardAlert[] = [];
    const currentWeekByType = currentWeekRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.type] = Number(row.total || 0);
      return acc;
    }, {});
    const previousWeekByType = previousWeekRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.type] = Number(row.total || 0);
      return acc;
    }, {});
    const currentWeek = {
      income: currentWeekByType.income || 0,
      expense: currentWeekByType.expense || 0,
      ownerWithdrawal: currentWeekByType.owner_withdrawal || 0,
      ownerTopup: currentWeekByType.owner_topup || 0,
      netProfit: (currentWeekByType.income || 0) - (currentWeekByType.expense || 0),
      averageIngredientExpensePerDay: currentWeekIngredientExpense / 7,
    };
    const previousWeek = {
      income: previousWeekByType.income || 0,
      expense: previousWeekByType.expense || 0,
      ownerWithdrawal: previousWeekByType.owner_withdrawal || 0,
      ownerTopup: previousWeekByType.owner_topup || 0,
      netProfit: (previousWeekByType.income || 0) - (previousWeekByType.expense || 0),
      averageIngredientExpensePerDay: previousWeekIngredientExpense / 7,
    };
    const currentWeekProfitMargin =
      currentWeek.income > 0 ? Math.round((currentWeek.netProfit / currentWeek.income) * 100) : 0;
    const previousWeekProfitMargin =
      previousWeek.income > 0 ? Math.round((previousWeek.netProfit / previousWeek.income) * 100) : 0;
    const currentWeekIngredientShare =
      currentWeekExpenseTotal > 0
        ? Math.round((currentWeekIngredientExpense / currentWeekExpenseTotal) * 100)
        : 0;
    const currentWeekIngredientCostRate =
      currentWeek.income > 0 ? Math.round((currentWeekIngredientExpense / currentWeek.income) * 100) : 0;
    const dailySummaryMap = currentWeekDailyRows.reduce<
      Record<string, { income: number; expense: number }>
    >((acc, row) => {
      const rowDate = String(row.date);
      if (!acc[rowDate]) {
        acc[rowDate] = { income: 0, expense: 0 };
      }
      if (row.type === 'income') {
        acc[rowDate].income = Number(row.total || 0);
      }
      if (row.type === 'expense') {
        acc[rowDate].expense = Number(row.total || 0);
      }
      return acc;
    }, {});
    const dailySummaries = Array.from({ length: 7 }, (_, index) => {
      const summaryDate = format(addDays(new Date(currentWeekStart), index), 'yyyy-MM-dd');
      const summary = dailySummaryMap[summaryDate] ?? { income: 0, expense: 0 };
      return {
        date: summaryDate,
        income: summary.income,
        expense: summary.expense,
        profit: summary.income - summary.expense,
      };
    });
    const expenseByCategory = currentWeekExpenseByCategoryRows
      .map((row) => {
        const total = Number(row.total || 0);
        return {
          category: row.category,
          total,
          count: Number(row.count || 0),
          percentage: currentWeekExpenseTotal > 0 ? Math.round((total / currentWeekExpenseTotal) * 100) : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
    const topExpenseCategory =
      expenseByCategory[0] ?? { category: '', total: 0, count: 0, percentage: 0 };
    let weeklyTrendMessage = 'เริ่มบันทึกต่อเนื่องอีกหน่อย แล้วระบบจะสรุปแนวโน้มให้ชัดขึ้น';

    if (currentWeek.income > 0 || currentWeek.expense > 0 || previousWeek.income > 0 || previousWeek.expense > 0) {
      if (currentWeek.income > previousWeek.income && currentWeek.netProfit >= previousWeek.netProfit) {
        weeklyTrendMessage = '7 วันล่าสุดรายรับดีขึ้น และกำไรยังไม่บางลง';
      } else if (currentWeek.income < previousWeek.income && currentWeek.expense >= previousWeek.expense) {
        weeklyTrendMessage = '7 วันล่าสุดรายรับลดลง แต่รายจ่ายยังสูงอยู่ ควรจับตาใกล้ ๆ';
      } else if (currentWeek.netProfit < previousWeek.netProfit) {
        weeklyTrendMessage = '7 วันล่าสุดกำไรสุทธิบางลง แม้ยอดขายอาจไม่ได้ลดมาก';
      } else if (currentWeek.ownerWithdrawal > previousWeek.ownerWithdrawal) {
        weeklyTrendMessage = '7 วันล่าสุดมีการถอนใช้ส่วนตัวมากขึ้น ลองแยกเงินร้านกับเงินบ้านให้ชัดต่อไป';
      } else {
        weeklyTrendMessage = 'ภาพรวม 7 วันล่าสุดยังทรงตัว ร้านยังคุมรายรับรายจ่ายได้ใกล้เคียงเดิม';
      }
    }

    if (previousWeekIngredientExpense > 0) {
      const ingredientGrowth =
        ((currentWeekIngredientExpense - previousWeekIngredientExpense) /
          previousWeekIngredientExpense) *
        100;

      if (ingredientGrowth >= 15) {
        alerts.push({
          id: 'ingredient-cost-spike',
          title: 'ค่าวัตถุดิบสูงขึ้น',
          message: `7 วันล่าสุดค่าวัตถุดิบสูงขึ้น ${Math.round(
            ingredientGrowth
          )}% จากสัปดาห์ก่อน`,
          level: 'warning',
        });
      }
    } else if (currentWeekIngredientExpense > 0) {
      alerts.push({
        id: 'ingredient-cost-new',
        title: 'เริ่มมีค่าวัตถุดิบในระบบแล้ว',
        message: 'ตอนนี้ระบบเริ่มเห็นต้นทุนวัตถุดิบของร้านแล้ว ลองดูต่อเนื่องอีกไม่กี่วันเพื่อเทียบแนวโน้ม',
        level: 'info',
      });
    }

    if (previousWeekExpenseTotal > 0) {
      const expenseGrowth =
        ((currentWeekExpenseTotal - previousWeekExpenseTotal) / previousWeekExpenseTotal) * 100;

      if (expenseGrowth >= 20) {
        alerts.push({
          id: 'expense-spike',
          title: 'รายจ่ายร้านสูงกว่าปกติ',
          message: `รายจ่าย 7 วันล่าสุดสูงขึ้น ${Math.round(
            expenseGrowth
          )}% เมื่อเทียบกับ 7 วันก่อนหน้า`,
          level: 'warning',
        });
      }
    }

    if (currentWeekExpenseTotal > 0 && currentWeekIngredientExpense > currentWeekExpenseTotal * 0.6) {
      alerts.push({
        id: 'ingredient-share-high',
        title: 'วัตถุดิบกินสัดส่วนสูง',
        message: 'ค่าวัตถุดิบคิดเป็นสัดส่วนมากของรายจ่ายร้านช่วง 7 วันล่าสุด ลองเช็กต้นทุนที่ซื้อบ่อย',
        level: 'info',
      });
    }

    return {
      totalIncome,
      totalExpense,
      ownerWithdrawal,
      ownerTopup,
      actualCashBalance: totalIncome + ownerTopup - totalExpense - ownerWithdrawal,
      profit: totalIncome - totalExpense,
      dailySalesGoal,
      remainingToGoal,
      goalReached: dailySalesGoal > 0 && totalIncome >= dailySalesGoal,
      currentWeekExpenseTotal,
      previousWeekExpenseTotal,
      currentWeekIngredientExpense,
      previousWeekIngredientExpense,
      currentWeekProfitMargin,
      previousWeekProfitMargin,
      currentWeekIngredientShare,
      currentWeekIngredientCostRate,
      currentWeek,
      previousWeek,
      dailySummaries,
      expenseByCategory,
      topExpenseCategory,
      weeklyTrendMessage,
      alerts,
      incomeCount: totalsByType.income?.count || 0,
      expenseCount: totalsByType.expense?.count || 0,
      ownerWithdrawalCount: totalsByType.owner_withdrawal?.count || 0,
      ownerTopupCount: totalsByType.owner_topup?.count || 0,
      recentTransactions: recentTransactions as Transaction[],
    };
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    return emptyDashboardSummary();
  }
}

export async function updateDailySalesGoal(
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'กรุณาเข้าสู่ระบบ',
      };
    }

    if (!Number.isFinite(amount) || amount < 0 || amount > 999999999.99) {
      return {
        success: false,
        error: 'จำนวนเป้าหมายไม่ถูกต้อง',
      };
    }

    await db
      .update(users)
      .set({
        dailySalesGoal: amount === 0 ? null : amount.toString(),
      })
      .where(eq(users.id, user.userId));

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Update daily sales goal error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    };
  }
}

/**
 * Get transaction history with filters
 */
export async function getTransactionHistory(
  filters: HistoryFilters
): Promise<Transaction[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

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
export async function getMonthlyReport(
  year: number,
  month: number
): Promise<MonthlyReport> {
  try {
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

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const monthlyRows = await db
      .select({
        type: transactions.type,
        category: transactions.category,
        date: transactions.transactionDate,
        total: sql<number>`COALESCE(SUM(CAST(amount AS FLOAT)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.userId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .groupBy(transactions.type, transactions.category, transactions.transactionDate);

    const dailySummaryMap: Record<string, { income: number; expense: number }> = {};
    const incomeByCategoryMap: Record<string, number> = {};
    const expenseByCategoryMap: Record<string, number> = {};

    const totalsByType = monthlyRows.reduce<Record<string, number>>((acc, row) => {
      const amount = Number(row.total || 0);
      const rowType = row.type;
      const rowDate = String(row.date);

      acc[rowType] = (acc[rowType] || 0) + amount;

      if (!dailySummaryMap[rowDate]) {
        dailySummaryMap[rowDate] = { income: 0, expense: 0 };
      }

      if (rowType === 'income') {
        dailySummaryMap[rowDate].income += amount;
        incomeByCategoryMap[row.category] = (incomeByCategoryMap[row.category] || 0) + amount;
      }

      if (rowType === 'expense') {
        dailySummaryMap[rowDate].expense += amount;
        expenseByCategoryMap[row.category] = (expenseByCategoryMap[row.category] || 0) + amount;
      }

      return acc;
    }, {});

    const totalIncome = totalsByType.income || 0;
    const totalExpense = totalsByType.expense || 0;
    const profit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? Math.round((profit / totalIncome) * 100) : 0;
    const dailySummaries = Array.from({ length: daysInMonth }, (_, index) => {
      const summaryDate = `${year}-${String(month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
      const summary = dailySummaryMap[summaryDate] ?? { income: 0, expense: 0 };

      return {
        date: summaryDate,
        income: summary.income,
        expense: summary.expense,
      };
    });
    const incomeByCategory = Object.entries(incomeByCategoryMap)
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total);
    const expenseByCategory = Object.entries(expenseByCategoryMap)
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total);
    const topExpenseCategory = expenseByCategory[0] ?? { category: '', total: 0 };

    return {
      totalIncome,
      totalExpense,
      profit,
      profitMargin,
      incomeByCategory,
      expenseByCategory,
      dailySummaries,
      averageDailyIncome: daysInMonth > 0 ? totalIncome / daysInMonth : 0,
      topExpenseCategory,
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
export async function deleteTransaction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'กรุณาเข้าสู่ระบบ',
      };
    }

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

    await db.delete(transactions).where(eq(transactions.id, id));

    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/monthly');

    return { success: true };
  } catch (error) {
    console.error('Delete transaction error:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    };
  }
}
