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
    <div className="mx-auto max-w-4xl space-y-10 pb-32 pt-8 px-4 md:px-8">
      {/* Header Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">Transaction History</span>
          <ThemeToggle />
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-tight text-foreground">
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
              <button
                key={preset.label}
                onClick={() => setActiveFilter(index)}
                className={`whitespace-nowrap rounded-full px-6 py-2 text-[15px] font-semibold transition-all ${
                  activeFilter === index
                    ? 'bg-apple-blue text-white shadow-md'
                    : 'bg-light-gray text-muted-foreground dark:bg-near-black hover:bg-border/30'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">ประเภท</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-full px-6 py-2 text-[15px] font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'bg-near-black text-white dark:bg-white dark:text-near-black shadow-md'
                  : 'bg-light-gray text-muted-foreground dark:bg-near-black hover:bg-border/30'
              }`}
            >
              ทั้งหมด
            </button>
            {TRANSACTION_TYPE_OPTIONS.map((type) => (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`rounded-full px-6 py-2 text-[15px] font-semibold transition-all ${
                  typeFilter === type.id
                    ? type.tone === 'emerald' || type.tone === 'sky'
                      ? 'bg-apple-blue text-white shadow-md'
                      : 'bg-near-black text-white dark:bg-white dark:text-near-black shadow-md'
                    : 'bg-light-gray text-muted-foreground dark:bg-near-black hover:bg-border/30'
                }`}
              >
                {type.shortLabel}
              </button>
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
          <div className="apple-card py-24 text-center text-muted-foreground border border-dashed border-border/50">
             <div className="text-[48px] mb-4">📋</div>
             <p className="text-[21px] font-bold tracking-tight mb-2">ไม่พบรายการ</p>
             <p className="text-[17px] font-medium">ลองเปลี่ยนช่วงเวลาหรือประเภทที่กรองไว้</p>
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
                    <ThaiDateLabel date={date} className="text-[17px] font-bold tracking-tight" />
                    <span className="text-[14px] font-medium text-muted-foreground">{dateTransactions.length} รายการ</span>
                  </div>

                  <div className="space-y-3">
                    {dateTransactions.map((tx) => {
                      const isDeleted = deletedTransactions.some((dt) => dt.id === tx.id);
                      const meta = getTransactionTypeMeta(tx.type);
                      const Icon = meta.icon;
                      const isPlus = tx.type === 'income' || tx.type === 'owner_topup';
                      const amount = isPlus ? Number(tx.amount) : -Number(tx.amount);

                      return (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isDeleted ? 0.3 : 1, x: 0 }}
                          className="apple-card p-4 group flex items-center gap-4 hover:apple-shadow border border-border/10"
                        >
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-background border border-border/30">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-[17px] font-semibold text-foreground truncate">{tx.category}</p>
                              <span className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground bg-light-gray dark:bg-near-black px-2 py-0.5 rounded">
                                {meta.shortLabel}
                              </span>
                            </div>
                            <p className="text-[14px] text-muted-foreground font-medium truncate">
                              {tx.note || 'ไม่มีหมายเหตุ'}
                            </p>
                          </div>

                          <div className="text-right mr-2">
                            <p className={`text-[17px] font-bold tracking-tight ${isPlus ? 'text-apple-blue dark:text-bright-blue' : 'text-foreground'}`}>
                              <CurrencyDisplay amount={amount} showSign />
                            </p>
                          </div>

                          {!isDeleted ? (
                            <button
                              onClick={() => handleDelete(tx)}
                              className="p-2 rounded-full text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUndoDelete(tx)}
                              className="p-2 rounded-full text-apple-blue hover:bg-apple-blue/10"
                            >
                              <Undo2 className="h-5 w-5" />
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
      </section>
    </div>
  );
}
