'use client';

import { useState } from 'react';
import ThaiDateLabel from '@/components/shared/ThaiDateLabel';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { PlusCircle, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function DashboardPage() {
  const today = new Date();
  const dateISO = format(today, 'yyyy-MM-dd');

  // Placeholder data - will be replaced with real data from TanStack Query in Phase 2
  const [summary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    profit: 0,
    incomeCount: 0,
    expenseCount: 0,
    recentTransactions: [] as any[],
  });

  const [isLoading] = useState(false);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-brand-600 text-white rounded-xl p-4 shadow-md"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold font-prompt">บัญชีร้านก๋วยเตี๋ยว</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ThaiDateLabel date={today} className="text-sm opacity-90" />
          </div>
        </div>
      </motion.div>

      {/* Summary Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold mb-3 font-prompt"
        >
          สรุปวันนี้
        </motion.h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="income-card rounded-xl p-4 h-28 animate-pulse" />
            <div className="expense-card rounded-xl p-4 h-28 animate-pulse" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {/* Income Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="income-card rounded-xl p-4 card-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-muted-foreground">รายได้</span>
                </div>
                <p className="text-2xl font-bold font-prompt text-emerald-700 dark:text-emerald-400">
                  <CurrencyDisplay amount={summary.totalIncome} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.incomeCount} รายการ
                </p>
              </motion.div>

              {/* Expense Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="expense-card rounded-xl p-4 card-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span className="text-sm text-muted-foreground">ค่าใช้จ่าย</span>
                </div>
                <p className="text-2xl font-bold font-prompt text-rose-700 dark:text-rose-400">
                  <CurrencyDisplay amount={summary.totalExpense} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.expenseCount} รายการ
                </p>
              </motion.div>
            </div>

            {/* Profit Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`mt-3 rounded-xl p-4 border card-shadow ${
                summary.profit >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">กำไร</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {summary.profit >= 0 ? '😊' : '😟'}
                  </span>
                  <p
                    className={`text-2xl font-bold font-prompt ${
                      summary.profit >= 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    <CurrencyDisplay amount={summary.profit} />
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </section>

      {/* Recent Transactions */}
      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="text-lg font-semibold mb-3 font-prompt"
        >
          รายการล่าสุด
        </motion.h2>

        {summary.recentTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12 text-muted-foreground"
          >
            <div className="text-6xl mb-4">🍜</div>
            <p className="text-lg font-medium">ยังไม่มีรายการวันนี้</p>
            <p className="text-sm mt-2">บันทึกรายการแรกเลย!</p>
          </motion.div>
        ) : (
          <motion.div className="space-y-2">
            {summary.recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-card border border-border card-shadow"
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : 'bg-rose-100 dark:bg-rose-900/30'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                  )}
                </div>

                {/* Category + Note */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {transaction.category}
                  </p>
                  {transaction.note && (
                    <p className="text-xs text-muted-foreground truncate">
                      {transaction.note}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p
                    className={`font-bold font-prompt ${
                      transaction.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    <CurrencyDisplay
                      amount={
                        transaction.type === 'income'
                          ? Number(transaction.amount)
                          : -Number(transaction.amount)
                      }
                      showSign
                    />
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* FAB Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <Link
          href="/add"
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 w-14 h-14 bg-brand-600 hover:bg-brand-700 active:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all touch-target"
          aria-label="เพิ่มรายการ"
        >
          <PlusCircle className="w-7 h-7" />
        </Link>
      </motion.div>
    </div>
  );
}
