'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  Goal,
  Info,
  LineChart,
  Package,
  PiggyBank,
  PlusCircle,
  Receipt,
  Save,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { updateDailySalesGoal } from '@/app/actions/transactions';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import ThaiDateLabel from '@/components/shared/ThaiDateLabel';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useTransactionCategories } from '@/hooks/useCategories';
import { useDashboardSummary } from '@/hooks/useTransactions';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  OWNER_TOPUP_CATEGORIES,
  OWNER_WITHDRAWAL_CATEGORIES,
  getTransactionTypeMeta,
} from '@/lib/utils/categories';

const transactionToneClasses = {
  income: 'text-emerald-700 dark:text-emerald-400',
  expense: 'text-rose-700 dark:text-rose-400',
  owner_topup: 'text-sky-700 dark:text-sky-400',
  owner_withdrawal: 'text-amber-700 dark:text-amber-400',
} as const;

const defaultCategoryLabelById = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
  ...OWNER_WITHDRAWAL_CATEGORIES,
  ...OWNER_TOPUP_CATEGORIES,
].reduce<Record<string, string>>((acc, category) => {
  acc[category.id] = category.label;
  return acc;
}, {});

function formatPercent(value: number) {
  return `${value}%`;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const dateISO = format(new Date(), 'yyyy-MM-dd');
  const { data: summary, isLoading } = useDashboardSummary(dateISO);
  const [goalInput, setGoalInput] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalMessage, setGoalMessage] = useState('');
  const { data: transactionCategories = [] } = useTransactionCategories(true);

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
    currentWeekProfitMargin: 0,
    previousWeekProfitMargin: 0,
    currentWeekIngredientShare: 0,
    currentWeekIngredientCostRate: 0,
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
    dailySummaries: [],
    expenseByCategory: [],
    topExpenseCategory: { category: '', total: 0, count: 0, percentage: 0 },
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

  const weeklyChartData = useMemo(
    () =>
      safeSummary.dailySummaries.map((day) => ({
        ...day,
        label: day.date.slice(-2),
      })),
    [safeSummary.dailySummaries]
  );
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
  const getCategoryLabel = (category: string) => categoryLabelById[category] ?? category;

  const salaryExpense = safeSummary.expenseByCategory.find((item) => item.category === 'salary');
  const primeCost = safeSummary.currentWeekIngredientExpense + (salaryExpense?.total ?? 0);
  const primeCostRate =
    safeSummary.currentWeek.income > 0
      ? Math.round((primeCost / safeSummary.currentWeek.income) * 100)
      : 0;
  const todayHasData = safeSummary.incomeCount + safeSummary.expenseCount > 0;
  const weekHasData = weeklyChartData.some((day) => day.income > 0 || day.expense > 0);
  const profitTrend = safeSummary.currentWeekProfitMargin - safeSummary.previousWeekProfitMargin;
  const healthLabel = safeSummary.profit >= 0 ? 'วันนี้ยังมีกำไร' : 'วันนี้รายจ่ายนำอยู่';
  const topExpenseLabel = safeSummary.topExpenseCategory.category
    ? getCategoryLabel(safeSummary.topExpenseCategory.category)
    : 'ยังไม่มีรายจ่าย';

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
    <div className="mx-auto max-w-5xl space-y-10 px-4 pb-28 pt-8 md:px-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <ThaiDateLabel
            date={dateISO}
            className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground"
          />
          <ThemeToggle />
        </div>
        <div className="max-w-3xl space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
            Restaurant dashboard
          </p>
          <h1 className="text-[40px] font-semibold leading-[1.07] tracking-tight text-foreground md:text-[56px]">
            ดูยอดขาย ต้นทุน และเงินสดของร้านในที่เดียว
          </h1>
          <p className="max-w-2xl text-[21px] font-medium leading-snug text-muted-foreground">
            โฟกัสตัวเลขที่ร้านอาหารใช้จริง: ยอดขาย กำไร รายจ่ายวัตถุดิบ และหมวดต้นทุนที่ต้องจับตา
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="apple-card flex min-h-80 items-center justify-center text-muted-foreground">
          กำลังสรุปข้อมูลร้าน...
        </div>
      ) : (
        <>
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="apple-card apple-shadow overflow-hidden bg-light-gray p-6 dark:bg-near-black md:p-8"
          >
            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Wallet className="h-5 w-5" />
                  <span className="text-[17px] font-medium">เงินสดจริงวันนี้</span>
                </div>
                <div className="space-y-3">
                  <p
                    className={`text-[52px] font-bold leading-none tracking-tighter md:text-[72px] ${
                      safeSummary.actualCashBalance >= 0
                        ? 'text-foreground'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <CurrencyDisplay amount={safeSummary.actualCashBalance} showSign />
                  </p>
                  <p className="text-[14px] font-medium text-muted-foreground">
                    รายรับ + เติมเงิน - รายจ่าย - ถอนใช้ส่วนตัว
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/add" className="btn-primary min-h-11 rounded-lg px-5">
                    เพิ่มรายการ
                  </Link>
                  <Link href="/monthly" className="btn-outline min-h-11 rounded-lg px-5">
                    รายงานเดือน
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-background p-5 dark:bg-black/30">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold uppercase tracking-tight text-muted-foreground">
                        กำไรวันนี้
                      </p>
                      <p
                        className={`mt-1 text-[32px] font-bold tracking-tight ${
                          safeSummary.profit >= 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        <CurrencyDisplay amount={safeSummary.profit} showSign />
                      </p>
                    </div>
                    <PiggyBank
                      className={`h-8 w-8 ${
                        safeSummary.profit >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    />
                  </div>
                  <p className="mt-3 text-[14px] font-medium text-muted-foreground">
                    {todayHasData ? healthLabel : 'เริ่มบันทึกรายการวันนี้เพื่อดูสถานะร้าน'}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-5 dark:bg-black/30">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold uppercase tracking-tight text-muted-foreground">
                        วัตถุดิบ / ยอดขาย 7 วัน
                      </p>
                      <p className="mt-1 text-[32px] font-bold tracking-tight text-foreground">
                        {formatPercent(safeSummary.currentWeekIngredientCostRate)}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                  </div>
                  <p className="mt-3 text-[14px] font-medium text-muted-foreground">
                    วัตถุดิบคิดเป็น {formatPercent(safeSummary.currentWeekIngredientShare)} ของรายจ่ายร้าน
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: 'ยอดขายวันนี้',
                value: safeSummary.totalIncome,
                helper: `${safeSummary.incomeCount} รายการ`,
                icon: TrendingUp,
                className: 'text-emerald-700 dark:text-emerald-400',
              },
              {
                label: 'รายจ่ายวันนี้',
                value: safeSummary.totalExpense,
                helper: `${safeSummary.expenseCount} รายการ`,
                icon: TrendingDown,
                className: 'text-rose-700 dark:text-rose-400',
              },
              {
                label: 'กำไร 7 วัน',
                value: safeSummary.currentWeek.netProfit,
                helper: `Margin ${formatPercent(safeSummary.currentWeekProfitMargin)}`,
                icon: LineChart,
                className:
                  safeSummary.currentWeek.netProfit >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400',
                showSign: true,
              },
              {
                label: 'ต้นทุนหลัก 7 วัน',
                value: primeCost,
                helper: `วัตถุดิบ + ค่าแรง ${formatPercent(primeCostRate)}`,
                icon: Receipt,
                className: 'text-foreground',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="apple-card space-y-4 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background dark:bg-black/30">
                    <Icon className={`h-5 w-5 ${card.className}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="truncate text-[14px] font-semibold uppercase tracking-tight text-muted-foreground">
                      {card.label}
                    </p>
                    <p className={`truncate text-[24px] font-bold tracking-tight ${card.className}`}>
                      <CurrencyDisplay amount={card.value} showSign={card.showSign} />
                    </p>
                    <p className="truncate text-[12px] font-semibold text-muted-foreground">{card.helper}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="apple-card space-y-6 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                    7-day trend
                  </p>
                  <h2 className="text-[28px] font-semibold tracking-tight">ยอดขายเทียบรายจ่าย</h2>
                </div>
                <div className="flex items-center gap-2 text-[14px] font-semibold text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  กำไรต่างจากรอบก่อน {formatPercent(profitTrend)}
                </div>
              </div>

              {weekHasData ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChartData} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="currentColor" opacity={0.08} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.55 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.55 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'currentColor', opacity: 0.05 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="glass rounded-lg border border-border/50 p-3 shadow-xl">
                                <p className="mb-2 text-[12px] font-bold uppercase text-muted-foreground">
                                  วันที่ {payload[0].payload.label}
                                </p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="flex items-center gap-2 text-[14px] font-bold">
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    {entry.name}: <CurrencyDisplay amount={Number(entry.value)} />
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="income" fill="#059669" radius={[4, 4, 4, 4]} name="รายรับ" barSize={14} />
                      <Bar dataKey="expense" fill="#e11d48" radius={[4, 4, 4, 4]} name="รายจ่าย" barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border/60 text-center text-[17px] font-medium text-muted-foreground">
                  ยังไม่มีข้อมูลพอสำหรับกราฟ 7 วัน
                </div>
              )}
            </div>

            <div className="apple-card space-y-6 p-6">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Cost control
                </p>
                <h2 className="text-[28px] font-semibold tracking-tight">หมวดที่กินต้นทุน</h2>
              </div>

              <div className="rounded-lg bg-background p-4 dark:bg-black/30">
                <p className="text-[14px] font-semibold text-muted-foreground">รายจ่ายสูงสุด 7 วัน</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-[24px] font-bold tracking-tight">{topExpenseLabel}</p>
                  <p className="text-[17px] font-bold text-rose-700 dark:text-rose-400">
                    <CurrencyDisplay amount={safeSummary.topExpenseCategory.total} />
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {safeSummary.expenseByCategory.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-[17px] font-medium text-muted-foreground">
                    ยังไม่มีรายจ่ายในช่วง 7 วันล่าสุด
                  </p>
                ) : (
                  safeSummary.expenseByCategory.slice(0, 5).map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold">{getCategoryLabel(category.category)}</p>
                          <p className="text-[12px] font-semibold text-muted-foreground">
                            {category.count} รายการ · {formatPercent(category.percentage)}
                          </p>
                        </div>
                        <p className="shrink-0 text-[15px] font-bold text-rose-700 dark:text-rose-400">
                          <CurrencyDisplay amount={category.total} />
                        </p>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-light-gray dark:bg-black/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${category.percentage}%` }}
                          className="h-full rounded-full bg-rose-600"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="apple-card space-y-5 p-6">
              <div className="flex items-center gap-3">
                <Goal className="h-5 w-5 text-apple-blue" />
                <h2 className="text-[21px] font-semibold tracking-tight">เป้ายอดขายวันนี้</h2>
              </div>

              {safeSummary.dailySalesGoal > 0 ? (
                <div className="space-y-2">
                  <p className="text-[14px] font-semibold text-muted-foreground">ตั้งไว้</p>
                  <p className="text-[32px] font-bold tracking-tight">
                    <CurrencyDisplay amount={safeSummary.dailySalesGoal} />
                  </p>
                  <p className="text-[14px] font-medium text-muted-foreground">
                    {safeSummary.goalReached
                      ? `เกินเป้าแล้ว ${Math.abs(
                          safeSummary.totalIncome - safeSummary.dailySalesGoal
                        ).toLocaleString()} บาท`
                      : `ขาดอีก ${safeSummary.remainingToGoal.toLocaleString()} บาท`}
                  </p>
                </div>
              ) : (
                <p className="text-[17px] font-medium text-muted-foreground">ยังไม่ได้ตั้งเป้ายอดขายรายวัน</p>
              )}

              {isEditingGoal ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={goalInput}
                      onChange={(event) => setGoalInput(event.target.value)}
                      className="min-h-11 w-36 rounded-lg border border-border bg-background px-4 py-2 text-[17px] font-medium outline-none transition-all focus:ring-2 focus:ring-apple-blue"
                      placeholder="2500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGoal}
                      disabled={isSavingGoal}
                      className="btn-primary min-h-11 rounded-lg px-4"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSavingGoal ? '...' : 'บันทึก'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingGoal(false)}
                    className="text-[14px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(true)}
                  className="btn-outline min-h-11 rounded-lg px-5"
                >
                  {safeSummary.dailySalesGoal > 0 ? 'แก้ไขเป้าหมาย' : 'ตั้งเป้าหมาย'}
                </button>
              )}
              {goalMessage && <p className="text-[14px] font-medium text-muted-foreground">{goalMessage}</p>}
            </div>

            <div className="apple-card space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Insights
                  </p>
                  <h2 className="text-[21px] font-semibold tracking-tight">สิ่งที่ควรจับตา</h2>
                </div>
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="rounded-lg bg-light-gray p-4 text-[17px] font-semibold leading-snug dark:bg-black/30">
                {safeSummary.weeklyTrendMessage || 'เริ่มบันทึกต่อเนื่องอีกหน่อย แล้วระบบจะสรุปแนวโน้มให้ชัดขึ้น'}
              </div>

              <div className="space-y-3">
                {safeSummary.alerts.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border/60 p-5 text-[15px] font-medium text-muted-foreground">
                    ยังไม่มีสัญญาณต้นทุนผิดปกติในข้อมูลล่าสุด
                  </p>
                ) : (
                  safeSummary.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded-lg p-4 ${
                        alert.level === 'warning'
                          ? 'bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-200'
                          : 'bg-light-gray text-foreground dark:bg-black/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-[15px] font-bold">{alert.title}</p>
                          <p className="text-[14px] font-medium leading-relaxed">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[21px] font-semibold tracking-tight">รายการล่าสุดวันนี้</h2>
              <Link href="/history" className="text-[14px] font-semibold text-apple-blue hover:underline">
                ดูทั้งหมด
              </Link>
            </div>

            {safeSummary.recentTransactions.length === 0 ? (
              <div className="apple-card border border-dashed border-border/50 py-14 text-center text-muted-foreground">
                <p className="text-[17px] font-medium">ยังไม่มีรายการวันนี้</p>
              </div>
            ) : (
              <div className="space-y-2">
                {safeSummary.recentTransactions.map((tx) => {
                  const meta = getTransactionTypeMeta(tx.type);
                  const Icon = meta.icon;
                  const isPlus = tx.type === 'income' || tx.type === 'owner_topup';
                  const toneClassName = transactionToneClasses[tx.type];

                  return (
                    <div key={tx.id} className="apple-card flex items-center gap-4 rounded-lg p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background dark:bg-black/30">
                        <Icon className={`h-5 w-5 ${toneClassName}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[17px] font-semibold text-foreground">
                          {getCategoryLabel(tx.category)}
                        </p>
                        <p className="truncate text-[14px] font-medium text-muted-foreground">
                          {tx.note || meta.shortLabel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[17px] font-bold tracking-tight ${toneClassName}`}>
                          <CurrencyDisplay amount={isPlus ? Number(tx.amount) : -Number(tx.amount)} showSign />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <Link
        href="/add"
        className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-apple-blue text-white shadow-xl transition-all hover:scale-105 active:scale-95 md:bottom-12 md:right-12"
      >
        <PlusCircle className="h-8 w-8" />
      </Link>
    </div>
  );
}
