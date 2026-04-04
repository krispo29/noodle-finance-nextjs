'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Undo2 } from 'lucide-react';
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import { deleteTransaction, getTransactionHistory } from '@/app/actions/transactions';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import ThaiDateLabel from '@/components/shared/ThaiDateLabel';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { getTransactionTypeMeta, TRANSACTION_TYPE_OPTIONS } from '@/lib/utils/categories';
import { HistoryFilters, Transaction, TransactionType } from '@/types';

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

type TypeFilter = 'all' | TransactionType;

const toneMap = {
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30',
} as const;

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState(4);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [deletedTransactions, setDeletedTransactions] = useState<Transaction[]>([]);

  const filters: HistoryFilters = useMemo(() => {
    const preset = filterPresets[activeFilter];
    const dateRange = preset.getDateRange();
    return {
      dateFrom: dateRange.dateFrom || undefined,
      dateTo: dateRange.dateTo || undefined,
      type: typeFilter,
    };
  }, [activeFilter, typeFilter]);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', 'history', filters],
    queryFn: () => getTransactionHistory(filters),
  });

  const visibleTransactions = useMemo(
    () => transactions.filter((t) => !deletedTransactions.some((dt) => dt.id === t.id)),
    [deletedTransactions, transactions]
  );

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    visibleTransactions.forEach((transaction) => {
      const date = transaction.transactionDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    return groups;
  }, [visibleTransactions]);

  const handleDelete = async (transaction: Transaction) => {
    setDeletedTransactions((prev) => [...prev, transaction]);

    try {
      const result = await deleteTransaction(transaction.id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['transactions', 'history'] });
        return;
      }
    } catch (error) {
      console.error('Delete transaction error:', error);
    }

    setDeletedTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
  };

  const handleUndoDelete = (transaction: Transaction) => {
    setDeletedTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sticky top-0 z-10 flex items-center justify-between bg-app-bg/80 py-4 backdrop-blur-lg"
      >
        <div>
          <h1 className="text-xl font-bold font-prompt">ประวัติรายการ</h1>
          <p className="text-sm text-muted-foreground">ดูย้อนหลังได้ครบทั้งเงินร้านและเงินที่ถอนใช้</p>
        </div>
        <ThemeToggle />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterPresets.map((preset, index) => (
            <button
              key={preset.label}
              onClick={() => setActiveFilter(index)}
              className={`touch-target whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeFilter === index
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setTypeFilter('all')}
            className={`touch-target rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              typeFilter === 'all'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-accent text-muted-foreground hover:bg-accent/80'
            }`}
          >
            ทั้งหมด
          </button>
          {TRANSACTION_TYPE_OPTIONS.map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`touch-target rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                typeFilter === type.id
                  ? type.tone === 'emerald'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : type.tone === 'rose'
                    ? 'bg-rose-500 text-white shadow-md'
                    : type.tone === 'amber'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-sky-500 text-white shadow-md'
                  : 'bg-accent text-muted-foreground hover:bg-accent/80'
              }`}
            >
              {type.shortLabel}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 rounded bg-accent animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-16 rounded bg-accent animate-pulse" />
            ))}
          </div>
        </div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center text-muted-foreground"
        >
          <div className="mb-4 text-6xl">📋</div>
          <p className="text-lg font-medium">ไม่พบรายการในช่วงนี้</p>
          <p className="mt-2 text-sm">ลองเปลี่ยนช่วงเวลาหรือประเภทที่กรองไว้</p>
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
                <div className="sticky top-20 z-10 mb-2 flex items-center justify-between rounded-lg bg-app-bg/90 px-3 py-2 backdrop-blur-sm">
                  <ThaiDateLabel date={date} className="text-sm font-semibold" />
                  <div className="text-xs text-muted-foreground">{dateTransactions.length} รายการ</div>
                </div>

                <div className="space-y-2">
                  {dateTransactions.map((transaction) => {
                    const isDeleted = deletedTransactions.some((dt) => dt.id === transaction.id);
                    const meta = getTransactionTypeMeta(transaction.type);
                    const Icon = meta.icon;
                    const signedAmount =
                      transaction.type === 'income' || transaction.type === 'owner_topup'
                        ? Number(transaction.amount)
                        : -Number(transaction.amount);

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
                        className="group flex items-center gap-3 rounded-xl border border-border bg-white p-3 card-shadow dark:bg-card"
                      >
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${toneMap[meta.tone]}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-foreground">{transaction.category}</p>
                            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">
                              {meta.shortLabel}
                            </span>
                          </div>
                          {transaction.note && (
                            <p className="truncate text-xs text-muted-foreground">{transaction.note}</p>
                          )}
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <p className="font-bold font-prompt">
                            <CurrencyDisplay amount={signedAmount} showSign />
                          </p>
                        </div>

                        {!isDeleted && (
                          <button
                            onClick={() => handleDelete(transaction)}
                            className="touch-target rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 md:opacity-100 dark:hover:bg-rose-900/20"
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        {isDeleted && (
                          <button
                            onClick={() => handleUndoDelete(transaction)}
                            className="touch-target rounded-lg p-2 text-brand-600 transition-all hover:bg-brand-50 dark:hover:bg-brand-900/20"
                            aria-label="ยกเลิก"
                          >
                            <Undo2 className="h-4 w-4" />
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
