import { InferSelectModel } from 'drizzle-orm';
import { transactions, users, monthlyGoals, transactionTypeEnum } from '@/lib/db/schema';

// User type from database schema
export type User = InferSelectModel<typeof users>;

// Transaction type from database schema
export type Transaction = InferSelectModel<typeof transactions>;

// Monthly goals type from database schema
export type MonthlyGoal = InferSelectModel<typeof monthlyGoals>;

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

// Dashboard summary
export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  incomeCount: number;
  expenseCount: number;
  recentTransactions: Transaction[];
}

// History filters
export interface HistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: 'income' | 'expense' | 'all';
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
}
