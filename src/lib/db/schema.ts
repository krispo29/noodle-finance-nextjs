import { pgTable, uuid, text, timestamp, numeric, date, pgEnum } from 'drizzle-orm/pg-core';

// Enum for transaction types
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopName: text('shop_name').notNull(),
  ownerName: text('owner_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: transactionTypeEnum('type').notNull(),
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  transactionDate: date('transaction_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Monthly goals table (for future phase)
export const monthlyGoals = pgTable('monthly_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  year: numeric('year').notNull(),
  month: numeric('month').notNull(),
  incomeGoal: numeric('income_goal', { precision: 10, scale: 2 }),
  expenseLimit: numeric('expense_limit', { precision: 10, scale: 2 }),
});
