import { InferSelectModel } from 'drizzle-orm';
import {
  monthlyGoals,
  transactionCategories,
  transactionTypeEnum,
  transactions,
  users,
} from '@/lib/db/schema';

// User type from database schema
export type User = InferSelectModel<typeof users>;

// Transaction type from database schema
export type Transaction = InferSelectModel<typeof transactions>;

// Monthly goals type from database schema
export type MonthlyGoal = InferSelectModel<typeof monthlyGoals>;

// Transaction category type from database schema
export type TransactionCategoryRow = InferSelectModel<typeof transactionCategories>;

// Transaction type enum
export type TransactionType = typeof transactionTypeEnum.enumValues[number];

// Transaction input (for creating new transactions)
export interface TransactionInput {
  type: TransactionType;
  category: string;
  amount: number;
  note?: string;
  transactionDate: string;
}

export interface TransactionCategory {
  id: string;
  type: TransactionType;
  label: string;
  iconName: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  transactionCount: number;
}

export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  level: 'warning' | 'info';
}

export interface WeeklyTrendSummary {
  income: number;
  expense: number;
  ownerWithdrawal: number;
  ownerTopup: number;
  netProfit: number;
  averageIngredientExpensePerDay: number;
}

export interface DashboardDailySummary {
  date: string;
  income: number;
  expense: number;
  profit: number;
}

export interface DashboardCategoryTotal {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

// Dashboard summary
export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  ownerWithdrawal: number;
  ownerTopup: number;
  actualCashBalance: number;
  profit: number;
  dailySalesGoal: number;
  remainingToGoal: number;
  goalReached: boolean;
  currentWeekExpenseTotal: number;
  previousWeekExpenseTotal: number;
  currentWeekIngredientExpense: number;
  previousWeekIngredientExpense: number;
  currentWeekProfitMargin: number;
  previousWeekProfitMargin: number;
  currentWeekIngredientShare: number;
  currentWeekIngredientCostRate: number;
  currentWeek: WeeklyTrendSummary;
  previousWeek: WeeklyTrendSummary;
  dailySummaries: DashboardDailySummary[];
  expenseByCategory: DashboardCategoryTotal[];
  topExpenseCategory: DashboardCategoryTotal;
  weeklyTrendMessage: string;
  alerts: DashboardAlert[];
  incomeCount: number;
  expenseCount: number;
  ownerWithdrawalCount: number;
  ownerTopupCount: number;
  recentTransactions: Transaction[];
}

// History filters
export interface HistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType | 'all';
  category?: string;
}

// Monthly report
export interface MonthlyReport {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  incomeByCategory: { category: string; total: number }[];
  expenseByCategory: { category: string; total: number }[];
  dailySummaries: { date: string; income: number; expense: number }[];
  averageDailyIncome: number;
  topExpenseCategory: { category: string; total: number };
}

// Auth session
export interface Session {
  userId: string;
  shopName: string;
  expiresAt: string;
  expiresIn: number;
  isAuthenticated: boolean;
}
