'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Goal,
  Info,
  LineChart,
  Pencil,
  PiggyBank,
  PlusCircle,
  Save,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import { updateDailySalesGoal } from '@/app/actions/transactions';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import ThaiDateLabel from '@/components/shared/ThaiDateLabel';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useDashboardSummary } from '@/hooks/useTransactions';
import { getTransactionTypeMeta } from '@/lib/utils/categories';

const summaryCards = [
  {
    key: 'totalIncome',
    label: 'รายรับวันนี้',
    countKey: 'incomeCount',
    icon: TrendingUp,
    className: 'income-card',
    valueClassName: 'text-emerald-700 dark:text-emerald-400',
    iconClassName: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'totalExpense',
    label: 'รายจ่ายร้าน',
    countKey: 'expenseCount',
    icon: TrendingDown,
    className: 'expense-card',
    valueClassName: 'text-rose-700 dark:text-rose-400',
    iconClassName: 'text-rose-600 dark:text-rose-400',
  },
  {
    key: 'ownerWithdrawal',
    label: 'ถอนใช้ส่วนตัว',
    countKey: 'ownerWithdrawalCount',
    icon: ArrowUpRight,
    className: 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    valueClassName: 'text-amber-700 dark:text-amber-400',
    iconClassName: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'ownerTopup',
    label: 'เติมเงินเข้าร้าน',
    countKey: 'ownerTopupCount',
    icon: ArrowDownRight,
    className: 'bg-sky-50 border border-sky-200 dark:bg-sky-900/20 dark:border-sky-800',
    valueClassName: 'text-sky-700 dark:text-sky-400',
    iconClassName: 'text-sky-600 dark:text-sky-400',
  },
] as const;

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const dateISO = format(new Date(), 'yyyy-MM-dd');
  const { data: summary, isLoading } = useDashboardSummary(dateISO);
  const [goalInput, setGoalInput] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalMessage, setGoalMessage] = useState('');

  const safeSummary = summary ?? {
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
    weeklyTrendMessage: '',
    alerts: [],
    incomeCount: 0,
    expenseCount: 0,
    ownerWithdrawalCount: 0,
    ownerTopupCount: 0,
    recentTransactions: [],
  };

  useEffect(() => {
    setGoalInput(
      safeSummary.dailySalesGoal > 0 ? String(Math.round(safeSummary.dailySalesGoal)) : ''
    );
  }, [safeSummary.dailySalesGoal]);

  const handleSaveGoal = async () => {
    const parsedGoal = goalInput.trim() === '' ? 0 : Number(goalInput);
    setIsSavingGoal(true);
    setGoalMessage('');

    const result = await updateDailySalesGoal(parsedGoal);

    if (result.success) {
      setGoalMessage(parsedGoal > 0 ? 'บันทึกเป้ารายวันแล้ว' : 'ล้างเป้ารายวันแล้ว');
      setIsEditingGoal(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary', dateISO] });
    } else {
      setGoalMessage(result.error || 'บันทึกเป้าหมายไม่สำเร็จ');
    }

    setIsSavingGoal(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-24 pt-8 px-4 md:px-8">
      {/* Header Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <ThaiDateLabel date={dateISO} className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest" />
          <ThemeToggle />
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.07] text-foreground">
          สรุปบัญชีร้าน
        </h1>
        <p className="text-[21px] text-muted-foreground font-medium max-w-lg leading-snug">
          ดูแลกระแสเงินสดของคุณให้ชัดเจน <br className="hidden md:block" />
          เพื่อความมั่นคงของธุรกิจ
        </p>
      </section>

      {/* Main Balance Card */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`apple-card apple-shadow overflow-hidden ${
            safeSummary.actualCashBalance >= 0
              ? 'bg-light-gray dark:bg-near-black'
              : 'bg-rose-50 dark:bg-rose-900/10'
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Wallet className="h-5 w-5" />
              <span className="text-[17px] font-medium">เงินคงเหลือจริงวันนี้</span>
            </div>
            
            <div className="space-y-1">
              <p className={`text-[48px] md:text-[64px] font-bold tracking-tighter leading-none ${
                safeSummary.actualCashBalance >= 0
                  ? 'text-foreground'
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                <CurrencyDisplay amount={safeSummary.actualCashBalance} showSign />
              </p>
              <p className="text-[14px] text-muted-foreground font-medium">
                รายรับ + เติมเงิน - รายจ่าย - ถอนใช้ส่วนตัว
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[14px] text-muted-foreground font-medium uppercase tracking-tight">
                  <PiggyBank className="h-4 w-4" />
                  กำไรของร้าน
                </div>
                <p className={`text-[28px] font-bold ${
                  safeSummary.profit >= 0
                    ? 'text-apple-blue dark:text-bright-blue'
                    : 'text-rose-600'
                }`}>
                  <CurrencyDisplay amount={safeSummary.profit} showSign />
                </p>
              </div>
              <div className="flex items-center">
                <p className="text-[14px] text-muted-foreground font-medium leading-tight">
                  {safeSummary.ownerWithdrawal > 0
                    ? 'มีการถอนเงินไปใช้ส่วนตัวแล้ว'
                    : 'วันนี้ยังไม่มีการถอนเงินไปใช้ส่วนตัว'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goal Section */}
      {!isLoading && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Goal className="h-5 w-5 text-apple-blue" />
            <h2 className="text-[21px] font-semibold tracking-tight">เป้าหมายรายวัน</h2>
          </div>
          
          <div className="apple-card border border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                {safeSummary.dailySalesGoal > 0 ? (
                  <div className="space-y-1">
                    <p className="text-[14px] font-medium text-muted-foreground uppercase tracking-tight">ยอดขายขั้นต่ำที่ตั้งไว้</p>
                    <p className="text-[32px] font-bold tracking-tight">
                      <CurrencyDisplay amount={safeSummary.dailySalesGoal} />
                    </p>
                  </div>
                ) : (
                  <p className="text-[17px] text-muted-foreground">คุณยังไม่ได้กำหนดเป้าหมายยอดขายรายวัน</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {isEditingGoal ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="rounded-lg border border-border bg-background px-4 py-2 text-[17px] font-medium focus:ring-2 focus:ring-apple-blue outline-none transition-all w-32"
                        placeholder="2500"
                      />
                      <button onClick={handleSaveGoal} disabled={isSavingGoal} className="btn-primary">
                        {isSavingGoal ? '...' : 'บันทึก'}
                      </button>
                    </div>
                    <button onClick={() => setIsEditingGoal(false)} className="text-[14px] text-muted-foreground hover:text-foreground text-left px-2">
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingGoal(true)} className="btn-outline">
                    {safeSummary.dailySalesGoal > 0 ? 'แก้ไขเป้าหมาย' : 'ตั้งเป้าหมาย'}
                  </button>
                )}
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg text-center ${
              safeSummary.goalReached
                ? 'bg-apple-blue/10 text-apple-blue dark:bg-bright-blue/10 dark:text-bright-blue'
                : 'bg-light-gray text-muted-foreground dark:bg-near-black'
            }`}>
              <p className="text-[17px] font-semibold">
                {safeSummary.dailySalesGoal > 0 ? (
                  safeSummary.goalReached ? (
                    `ยอดขายเกินเป้าไปแล้ว ${Math.abs(safeSummary.totalIncome - safeSummary.dailySalesGoal).toLocaleString()} บาท!`
                  ) : (
                    `ขาดอีก ${safeSummary.remainingToGoal.toLocaleString()} บาท จะถึงเป้าวันนี้`
                  )
                ) : (
                  'เริ่มกำหนดเป้าหมายเพื่อติดตามความคืบหน้า'
                )}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Summary Grid */}
      <section className="space-y-4">
        <h2 className="text-[21px] font-semibold tracking-tight">สรุปยอดวันนี้</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const amount = safeSummary[card.key];
            const Icon = card.icon;
            
            return (
              <div key={card.key} className="apple-card p-5 space-y-4 hover:bg-light-gray/50 dark:hover:bg-near-black/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/30">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-medium text-muted-foreground truncate uppercase tracking-tight">{card.label}</p>
                  <p className="text-[21px] font-bold tracking-tight truncate">
                    <CurrencyDisplay amount={amount} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[21px] font-semibold tracking-tight">รายการล่าสุด</h2>
          <Link href="/history" className="text-[14px] font-medium text-apple-blue dark:text-bright-blue hover:underline">
            ดูทั้งหมด
          </Link>
        </div>

        {safeSummary.recentTransactions.length === 0 ? (
          <div className="apple-card py-16 text-center text-muted-foreground border border-dashed border-border/50">
             <div className="text-[40px] mb-4">🍜</div>
             <p className="text-[17px] font-medium">ยังไม่มีรายการวันนี้</p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeSummary.recentTransactions.map((tx) => {
              const meta = getTransactionTypeMeta(tx.type);
              const Icon = meta.icon;
              const isPlus = tx.type === 'income' || tx.type === 'owner_topup';
              
              return (
                <div key={tx.id} className="flex items-center gap-4 p-4 apple-card rounded-md hover:apple-shadow">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border/30`}>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-semibold text-foreground truncate">{tx.category}</p>
                    <p className="text-[14px] text-muted-foreground truncate font-medium">{tx.note || meta.shortLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[17px] font-bold tracking-tight ${isPlus ? 'text-apple-blue dark:text-bright-blue' : 'text-foreground'}`}>
                      <CurrencyDisplay amount={isPlus ? Number(tx.amount) : -Number(tx.amount)} showSign />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAB */}
      <Link
        href="/add"
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-50 h-16 w-16 bg-apple-blue text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        <PlusCircle className="h-8 w-8" />
      </Link>
    </div>
  );
}
