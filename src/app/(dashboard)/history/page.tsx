'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Trash2, Undo2 } from 'lucide-react';
import ThaiDateLabel from '@/components/shared/ThaiDateLabel';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import ThemeToggle from '@/components/shared/ThemeToggle';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getTransactionHistory, deleteTransaction } from '@/app/actions/transactions';
import { Transaction, HistoryFilters } from '@/types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

type FilterPreset = {
  label: string;
  getDateRange: () => { dateFrom: string; dateTo: string };
};

const filterPresets: FilterPreset[] = [
  {
    label: 'วันนี้',
    getDateRange: () => ({
      dateFrom: format(new Date(), 'yyyy-MM-dd'),
      dateTo: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'เมื่อวาน',
    getDateRange: () => ({
      dateFrom: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      dateTo: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    }),
  },
  {
    label: '7 วันล่าสุด',
    getDateRange: () => ({
      dateFrom: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
      dateTo: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'เดือนนี้',
    getDateRange: () => ({
      dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'ทั้งหมด',
    getDateRange: () => ({ dateFrom: '', dateTo: '' }),
  },
];

/**
 * History page with filters and transaction list
 */
export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState(4); // Default to "ทั้งหมด"
  const [typeFilter, setTypeFilter] = useState<'income' | 'expense' | 'all'>('all');
  const [deletedTransactions, setDeletedTransactions] = useState<Transaction[]>([]);

  // Build filters
  const filters: HistoryFilters = useMemo(() => {
    const preset = filterPresets[activeFilter];
    const dateRange = preset.getDateRange();
    return {
      dateFrom: dateRange.dateFrom || undefined,
      dateTo: dateRange.dateTo || undefined,
      type: typeFilter,
    };
  }, [activeFilter, typeFilter]);

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', 'history', filters],
    queryFn: () => getTransactionHistory(filters),
  });

  // Filter out deleted transactions
  const visibleTransactions = useMemo(() => {
    return transactions.filter(
      (t) => !deletedTransactions.some((dt) => dt.id === t.id)
    );
  }, [transactions, deletedTransactions]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    visibleTransactions.forEach((transaction) => {
      const date = transaction.transactionDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    return groups;
  }, [visibleTransactions]);

  // Delete transaction with undo
  const handleDelete = async (transaction: Transaction) => {
    // Optimistic update
    setDeletedTransactions((prev) => [...prev, transaction]);

    // Try to delete
    try {
      const result = await deleteTransaction(transaction.id);
      if (result.success) {
        // Invalidate query
        queryClient.invalidateQueries({ queryKey: ['transactions', 'history'] });
      } else {
        // Rollback on error
        setDeletedTransactions((prev) =>
          prev.filter((t) => t.id !== transaction.id)
        );
      }
    } catch {
      // Rollback on error
      setDeletedTransactions((prev) =>
        prev.filter((t) => t.id !== transaction.id)
      );
    }
  };

  // Undo delete
  const handleUndoDelete = (transaction: Transaction) => {
    setDeletedTransactions((prev) =>
      prev.filter((t) => t.id !== transaction.id)
    );
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sticky top-0 z-10 bg-app-bg/80 backdrop-blur-lg py-4 flex items-center justify-between"
      >
        <h1 className="text-xl font-bold font-prompt">ประวัติรายการ</h1>
        <ThemeToggle />
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {/* Date filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {filterPresets.map((preset, index) => (
            <button
              key={preset.label}
              onClick={() => setActiveFilter(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all touch-target ${
                activeFilter === index
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Type filters */}
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all touch-target ${
                typeFilter === type
                  ? type === 'income'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-brand-600 text-white shadow-md'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80'
              }`}
            >
              {type === 'all' ? 'ทั้งหมด' : type === 'income' ? 'รายได้' : 'ค่าใช้จ่าย'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 bg-accent rounded animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-accent rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-muted-foreground"
        >
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg font-medium">ไม่มีรายการ</p>
          <p className="text-sm mt-2">ลองเปลี่ยนตัวกรอง</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {Object.entries(groupedByDate).map(([date, dateTransactions]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Date header */}
                <div className="sticky top-20 z-10 bg-app-bg/90 backdrop-blur-sm py-2 px-3 rounded-lg mb-2 flex items-center justify-between">
                  <ThaiDateLabel date={date} className="font-semibold text-sm" />
                  <div className="text-xs text-muted-foreground">
                    {dateTransactions.length} รายการ
                  </div>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  {dateTransactions.map((transaction) => {
                    const isDeleted = deletedTransactions.some(
                      (dt) => dt.id === transaction.id
                    );

                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: isDeleted ? 0 : 1,
                          x: isDeleted ? 100 : 0,
                        }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-card border border-border card-shadow group"
                      >
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                        <div className="text-right flex-shrink-0">
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

                        {/* Delete button (show on hover for desktop, always for mobile) */}
                        {!isDeleted && (
                          <button
                            onClick={() => handleDelete(transaction)}
                            className="opacity-0 group-hover:opacity-100 md:opacity-100 p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all touch-target"
                            aria-label="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Undo button */}
                        {isDeleted && (
                          <button
                            onClick={() => handleUndoDelete(transaction)}
                            className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all touch-target"
                            aria-label="ยกเลิก"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
