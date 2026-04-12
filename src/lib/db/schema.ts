import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Enum for transaction types
export const transactionTypeEnum = pgEnum('transaction_type', [
  'income',
  'expense',
  'owner_withdrawal',
  'owner_topup',
]);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopName: text('shop_name').notNull(),
  ownerName: text('owner_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  dailySalesGoal: numeric('daily_sales_goal', { precision: 10, scale: 2 }),
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

// User-managed transaction categories
export const transactionCategories = pgTable(
  'transaction_categories',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    id: text('id').notNull(),
    type: transactionTypeEnum('type').notNull(),
    label: text('label').notNull(),
    iconName: text('icon_name').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.id] }),
  })
);

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
