'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, PlusCircle, Trash2, Undo2 } from 'lucide-react';
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import { deleteTransaction, getTransactionHistory } from '@/app/actions/transactions';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import ThaiDateLabel from '@/components/shared/ThaiDateLabel';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useTransactionCategories } from '@/hooks/useCategories';
import {
  DEFAULT_TRANSACTION_CATEGORIES,
  getTransactionTypeMeta,
  TRANSACTION_TYPE_OPTIONS,
} from '@/lib/utils/categories';
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
  emerald: {
    selected: 'bg-emerald-50 text-emerald-700 shadow-md dark:bg-emerald-950/30 dark:text-emerald-400',
    subtle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  rose: {
    selected: 'bg-rose-50 text-rose-700 shadow-md dark:bg-rose-950/30 dark:text-rose-400',
    subtle: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    text: 'text-rose-700 dark:text-rose-400',
  },
  amber: {
    selected: 'bg-amber-600 text-white shadow-md',
    subtle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-400',
  },
  sky: {
    selected: 'bg-sky-600 text-white shadow-md',
    subtle: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    text: 'text-sky-700 dark:text-sky-400',
  },
} as const;

const springTap = { type: 'spring', stiffness: 400, damping: 17 } as const;

const defaultCategoryLabelById = DEFAULT_TRANSACTION_CATEGORIES.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.id] = category.label;
    return acc;
  },
  {}
);

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState(4);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [deletedTransactions, setDeletedTransactions] = useState<Transaction[]>([]);
  const { data: transactionCategories = [] } = useTransactionCategories(true);
  const categoryLabelById = useMemo(
    () => ({
      ...defaultCategoryLabelById,
      ...transactionCategories.reduce<Record<string, string>>((acc, category) => {
        acc[category.id] = category.label;
        return acc;
      }, {}),
    }),
    [transactionCategories]
  );

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-10 pb-32 pt-8 px-4 md:px-8"
    >
      {/* Header Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">Transaction History</span>
          <ThemeToggle />
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold leading-tight text-foreground">
          ประวัติรายการ
        </h1>
        <p className="text-[21px] text-muted-foreground font-medium max-w-lg leading-snug">
          ตรวจสอบทุกความเคลื่อนไหว <br className="hidden md:block" />
          เพื่อความโปร่งใสของธุรกิจคุณ
        </p>
      </section>

      {/* Filters Section */}
      <section className="space-y-6">
        <div className="space-y-3">
           <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">ช่วงเวลา</label>
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterPresets.map((preset, index) => (
              <motion.button
                key={preset.label}
                onClick={() => setActiveFilter(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={springTap}
                className={`min-h-[44px] whitespace-nowrap rounded-full px-6 py-2 text-[15px] font-semibold transition-all ${
                  activeFilter === index
                    ? 'bg-apple-blue text-white shadow-md'
                    : 'bg-light-gray text-muted-foreground dark:bg-near-black hover:bg-border/30'
                }`}
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">ประเภท</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              onClick={() => setTypeFilter('all')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={springTap}
              className={`min-h-[44px] rounded-full px-6 py-2 text-[15px] font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'bg-near-black text-white dark:bg-white dark:text-near-black shadow-md'
                  : 'bg-light-gray text-muted-foreground dark:bg-near-black hover:bg-border/30'
              }`}
            >
              ทั้งหมด
            </motion.button>
            {TRANSACTION_TYPE_OPTIONS.map((type) => (
              <motion.button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={springTap}
                className={`min-h-[44px] rounded-full px-6 py-2 text-[15px] font-semibold transition-all ${
                  typeFilter === type.id
                    ? toneMap[type.tone].selected
                    : 'bg-light-gray text-muted-foreground dark:bg-near-black hover:bg-border/30'
                }`}
              >
                {type.shortLabel}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Transactions List */}
      <section className="space-y-8">
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 w-32 bg-light-gray dark:bg-near-black rounded" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 w-full bg-light-gray dark:bg-near-black rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <div className="apple-card flex flex-col items-center justify-center gap-3 border border-dashed border-border/50 py-24 text-center text-muted-foreground">
             <ClipboardList className="h-14 w-14 rounded-full bg-apple-blue/10 p-4 text-apple-blue" />
             <p className="text-[21px] font-bold text-foreground">ไม่พบรายการ</p>
             <p className="text-[17px] font-medium">ลองเปลี่ยนช่วงเวลาหรือเริ่มบันทึกรายการแรก</p>
             <Link href="/add">
               <motion.span
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.97 }}
                 transition={springTap}
                 className="btn-primary mt-2 min-h-[44px] rounded-lg px-5"
               >
                 <PlusCircle className="mr-2 h-4 w-4" />
                 เพิ่มรายการ
               </motion.span>
             </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <AnimatePresence>
              {Object.entries(groupedByDate).map(([date, dateTransactions]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-border/30 pb-2">
                    <ThaiDateLabel date={date} className="text-[17px] font-bold" />
                    <span className="text-[14px] font-medium text-muted-foreground">{dateTransactions.length} รายการ</span>
                  </div>

                  <div className="space-y-3">
                    {dateTransactions.map((tx) => {
                      const isDeleted = deletedTransactions.some((dt) => dt.id === tx.id);
                      const meta = getTransactionTypeMeta(tx.type);
                      const Icon = meta.icon;
                      const isPlus = tx.type === 'income' || tx.type === 'owner_topup';
                      const amount = isPlus ? Number(tx.amount) : -Number(tx.amount);
                      const tone = toneMap[meta.tone];

                      return (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isDeleted ? 0.3 : 1, x: 0 }}
                          className="apple-card p-4 group flex items-center gap-4 hover:apple-shadow border border-border/10"
                        >
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-background border border-border/30">
                            <Icon className={`h-5 w-5 ${tone.text}`} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-[17px] font-semibold text-foreground truncate">
                                {categoryLabelById[tx.category] ?? tx.category}
                              </p>
                              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${tone.subtle}`}>
                                {meta.shortLabel}
                              </span>
                            </div>
                            <p className="text-[14px] text-muted-foreground font-medium truncate">
                              {tx.note || 'ไม่มีหมายเหตุ'}
                            </p>
                          </div>

                          <div className="text-right mr-2">
                            <p className={`text-[17px] font-bold ${tone.text}`}>
                              <CurrencyDisplay amount={amount} showSign />
                            </p>
                          </div>

                          {!isDeleted ? (
                            <motion.button
                              onClick={() => handleDelete(tx)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              transition={springTap}
                              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-900/20"
                            >
                              <Trash2 className="h-5 w-5" />
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => handleUndoDelete(tx)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              transition={springTap}
                              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-apple-blue hover:bg-apple-blue/10"
                            >
                              <Undo2 className="h-5 w-5" />
                            </motion.button>
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
      </section>
    </motion.div>
  );
}
