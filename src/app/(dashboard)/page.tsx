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
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 rounded-xl bg-brand-600 p-4 text-white shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-prompt">บัญชีร้านก๋วยเตี๋ยว</h1>
            <p className="text-sm text-white/85">ดูให้ชัดว่าเงินร้านเหลือจริงเท่าไร</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ThaiDateLabel date={dateISO} className="text-sm opacity-90" />
          </div>
        </div>
      </motion.div>

      <section className="space-y-3">
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-brand-200 bg-white p-4 card-shadow dark:border-brand-800 dark:bg-card"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Goal className="h-5 w-5 text-brand-600" />
                  <h2 className="text-base font-semibold font-prompt">เป้ายอดขายขั้นต่ำต่อวัน</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  ตั้งไว้ครั้งเดียว แล้วหน้าแรกจะบอกทันทีว่าวันนี้ถึงเป้าหรือยัง
                </p>
                {safeSummary.dailySalesGoal > 0 ? (
                  <div className="text-sm">
                    <span className="text-muted-foreground">เป้าวันนี้: </span>
                    <span className="font-bold font-prompt text-foreground">
                      <CurrencyDisplay amount={safeSummary.dailySalesGoal} />
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">ยังไม่ได้ตั้งเป้ายอดขายรายวัน</p>
                )}
              </div>

              <div className="w-full max-w-sm space-y-3">
                {isEditingGoal ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">เป้าขั้นต่ำต่อวัน</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ฿
                        </span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={goalInput}
                          onChange={(event) => setGoalInput(event.target.value)}
                          className="w-full rounded-lg border border-border bg-white py-2 pl-8 pr-3 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-card"
                          placeholder="เช่น 2500"
                          disabled={isSavingGoal}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveGoal}
                        disabled={isSavingGoal}
                        className="touch-target inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" />
                        {isSavingGoal ? 'กำลังบันทึก' : 'บันทึก'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingGoal(false);
                        setGoalInput(
                          safeSummary.dailySalesGoal > 0
                            ? String(Math.round(safeSummary.dailySalesGoal))
                            : ''
                        );
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingGoal(true)}
                    className="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-accent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent/80"
                  >
                    <Pencil className="h-4 w-4" />
                    {safeSummary.dailySalesGoal > 0 ? 'แก้ไขเป้ารายวัน' : 'ตั้งเป้ารายวัน'}
                  </button>
                )}

                {goalMessage && <p className="text-sm text-muted-foreground">{goalMessage}</p>}
              </div>
            </div>

            <div
              className={`mt-4 rounded-xl border px-4 py-3 ${
                safeSummary.goalReached
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
              }`}
            >
              {safeSummary.dailySalesGoal > 0 ? (
                safeSummary.goalReached ? (
                  <p className="font-medium">
                    วันนี้ถึงเป้าแล้ว ยอดขายเกินขั้นต่ำ{' '}
                    <span className="font-bold font-prompt">
                      <CurrencyDisplay amount={safeSummary.totalIncome - safeSummary.dailySalesGoal} />
                    </span>
                  </p>
                ) : (
                  <p className="font-medium">
                    วันนี้ยังขาดอีก{' '}
                    <span className="font-bold font-prompt">
                      <CurrencyDisplay amount={safeSummary.remainingToGoal} />
                    </span>{' '}
                    ถึงเป้าขั้นต่ำ
                  </p>
                )
              ) : (
                <p className="font-medium">ตั้งเป้ารายวันก่อน แล้วระบบจะช่วยบอกทันทีว่าวันนี้ขายพอหรือยัง</p>
              )}
            </div>
          </motion.div>
        )}

        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="rounded-xl border border-border bg-white p-4 card-shadow dark:bg-card"
          >
            <div className="mb-4 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-semibold font-prompt">สรุป 7 วันล่าสุด</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <p className="text-xs text-muted-foreground">รายรับรวม</p>
                <p className="mt-1 font-bold font-prompt text-emerald-700 dark:text-emerald-400">
                  <CurrencyDisplay amount={safeSummary.currentWeek.income} />
                </p>
              </div>
              <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
                <p className="text-xs text-muted-foreground">รายจ่ายรวม</p>
                <p className="mt-1 font-bold font-prompt text-rose-700 dark:text-rose-400">
                  <CurrencyDisplay amount={safeSummary.currentWeek.expense} />
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <p className="text-xs text-muted-foreground">ถอนใช้ส่วนตัว</p>
                <p className="mt-1 font-bold font-prompt text-amber-700 dark:text-amber-400">
                  <CurrencyDisplay amount={safeSummary.currentWeek.ownerWithdrawal} />
                </p>
              </div>
              <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-900/20">
                <p className="text-xs text-muted-foreground">เติมเข้าร้าน</p>
                <p className="mt-1 font-bold font-prompt text-sky-700 dark:text-sky-400">
                  <CurrencyDisplay amount={safeSummary.currentWeek.ownerTopup} />
                </p>
              </div>
              <div
                className={`rounded-lg p-3 ${
                  safeSummary.currentWeek.netProfit >= 0
                    ? 'bg-brand-50 dark:bg-brand-900/20'
                    : 'bg-rose-50 dark:bg-rose-900/20'
                }`}
              >
                <p className="text-xs text-muted-foreground">กำไรสุทธิ</p>
                <p
                  className={`mt-1 font-bold font-prompt ${
                    safeSummary.currentWeek.netProfit >= 0
                      ? 'text-brand-700 dark:text-brand-300'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  <CurrencyDisplay amount={safeSummary.currentWeek.netProfit} showSign />
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-accent/40 p-3">
                <p className="text-xs text-muted-foreground">ค่าวัตถุดิบเฉลี่ยต่อวัน</p>
                <p className="mt-1 font-bold font-prompt text-foreground">
                  <CurrencyDisplay amount={safeSummary.currentWeek.averageIngredientExpensePerDay} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  สัปดาห์ก่อนเฉลี่ย{' '}
                  <span className="font-semibold">
                    <CurrencyDisplay amount={safeSummary.previousWeek.averageIngredientExpensePerDay} />
                  </span>
                </p>
              </div>

              <div className="rounded-lg border border-border bg-accent/40 p-3">
                <p className="text-xs text-muted-foreground">สรุปแนวโน้ม</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {safeSummary.weeklyTrendMessage}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!isLoading && safeSummary.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-semibold font-prompt">สัญญาณที่ควรจับตา</h2>
            </div>

            <div className="grid gap-3">
              {safeSummary.alerts.map((alert) => {
                const isWarning = alert.level === 'warning';
                const Icon = isWarning ? AlertTriangle : Info;

                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4 card-shadow ${
                      isWarning
                        ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                        : 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-900/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                          isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-foreground">{alert.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-semibold font-prompt"
        >
          สรุปวันนี้
        </motion.h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="h-28 rounded-xl bg-accent animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              const amount = safeSummary[card.key];
              const count = safeSummary[card.countKey];

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className={`rounded-xl p-4 card-shadow ${card.className}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                    <span className="text-sm text-muted-foreground">{card.label}</span>
                  </div>
                  <p className={`text-2xl font-bold font-prompt ${card.valueClassName}`}>
                    <CurrencyDisplay amount={amount} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{count} รายการ</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`rounded-xl border p-5 card-shadow ${
              safeSummary.actualCashBalance >= 0
                ? 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/20'
                : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20'
            }`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-brand-700 dark:text-brand-300" />
                  <span className="text-sm font-medium text-muted-foreground">เงินคงเหลือจริงวันนี้</span>
                </div>
                <p
                  className={`text-3xl font-bold font-prompt ${
                    safeSummary.actualCashBalance >= 0
                      ? 'text-brand-700 dark:text-brand-300'
                      : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  <CurrencyDisplay amount={safeSummary.actualCashBalance} showSign />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  คิดจาก รายรับ + เติมเงินเข้าร้าน - รายจ่ายร้าน - ถอนใช้ส่วนตัว
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white/80 p-3 dark:bg-black/10">
                  <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <PiggyBank className="h-4 w-4" />
                    กำไรของร้าน
                  </div>
                  <p
                    className={`text-xl font-bold font-prompt ${
                      safeSummary.profit >= 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    <CurrencyDisplay amount={safeSummary.profit} showSign />
                  </p>
                </div>

                <div className="rounded-lg bg-white/80 p-3 dark:bg-black/10">
                  <p className="text-sm text-muted-foreground">สรุปสั้น ๆ</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {safeSummary.ownerWithdrawal > 0
                      ? 'วันนี้มีเงินออกไปใช้ส่วนตัวแล้ว'
                      : 'วันนี้ยังไม่มีการถอนเงินไปใช้ส่วนตัว'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      <section>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-3 text-lg font-semibold font-prompt"
        >
          รายการล่าสุด
        </motion.h2>

        {!isLoading && safeSummary.recentTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="py-12 text-center text-muted-foreground"
          >
            <div className="mb-4 text-6xl">🍜</div>
            <p className="text-lg font-medium">วันนี้ยังไม่มีรายการ</p>
            <p className="mt-2 text-sm">เริ่มบันทึกรายรับ รายจ่าย หรือการถอนใช้ส่วนตัวได้เลย</p>
          </motion.div>
        ) : (
          <motion.div className="space-y-2">
            {safeSummary.recentTransactions.map((transaction, index) => {
              const meta = getTransactionTypeMeta(transaction.type);
              const Icon = meta.icon;
              const amount =
                transaction.type === 'income' || transaction.type === 'owner_topup'
                  ? Number(transaction.amount)
                  : -Number(transaction.amount);

              const toneMap = {
                emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
                rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30',
                amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
                sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30',
              } as const;

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 card-shadow dark:bg-card"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${toneMap[meta.tone]}`}
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

                  <div className="text-right">
                    <p className="font-bold font-prompt">
                      <CurrencyDisplay amount={amount} showSign />
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <Link
          href="/add"
          className="touch-target fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all hover:bg-brand-700 active:bg-brand-700 md:bottom-8 md:right-8"
          aria-label="เพิ่มรายการ"
        >
          <PlusCircle className="h-7 w-7" />
        </Link>
      </motion.div>
    </div>
  );
}
