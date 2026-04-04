'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import ThemeToggle from '@/components/shared/ThemeToggle';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getMonthlyReport } from '@/app/actions/transactions';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils/categories';
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, eachDayOfInterval } from 'date-fns';

/**
 * Monthly summary page with charts and analytics
 */
export default function MonthlyPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  // Fetch monthly report
  const { data: report, isLoading } = useQuery({
    queryKey: ['monthly', year, month],
    queryFn: () => getMonthlyReport(year, month),
  });

  // Generate chart data
  const chartData = useMemo(() => {
    if (!report || report.dailySummaries.length === 0) {
      // Generate empty data for the month
      const daysInMonth = getDaysInMonth(currentDate);
      const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: new Date(year, month - 1, daysInMonth),
      });

      return days.map((day) => ({
        date: format(day, 'd'),
        income: 0,
        expense: 0,
      }));
    }

    return report.dailySummaries.map((summary) => ({
      date: format(new Date(summary.date), 'd'),
      income: summary.income,
      expense: summary.expense,
    }));
  }, [report, currentDate]);

  // Category breakdown
  const incomeCategories = useMemo(() => {
    if (!report || report.incomeByCategory.length === 0) return [];
    const total = report.totalIncome || 1;
    return report.incomeByCategory
      .map((cat) => ({
        ...cat,
        percentage: Math.round((cat.total / total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [report]);

  const expenseCategories = useMemo(() => {
    if (!report || report.expenseByCategory.length === 0) return [];
    const total = report.totalExpense || 1;
    return report.expenseByCategory
      .map((cat) => ({
        ...cat,
        percentage: Math.round((cat.total / total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [report]);

  // Navigate months
  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  // Thai month name with Buddhist Era
  const thaiMonthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiYear = year + 543;
  const monthName = thaiMonthNames[currentDate.getMonth()];

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header with month navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-app-bg/80 backdrop-blur-lg py-4"
      >
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-accent transition-colors touch-target"
            aria-label="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h1 className="text-xl font-bold font-prompt">
            {monthName} {thaiYear}
          </h1>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-accent transition-colors touch-target"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {isLoading || !report ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-accent rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {/* Income Card */}
          <div className="income-card rounded-xl p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-muted-foreground">รายได้</span>
            </div>
            <p className="text-lg font-bold font-prompt text-emerald-700 dark:text-emerald-400">
              <CurrencyDisplay amount={report.totalIncome} />
            </p>
          </div>

          {/* Expense Card */}
          <div className="expense-card rounded-xl p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <span className="text-xs text-muted-foreground">ค่าใช้จ่าย</span>
            </div>
            <p className="text-lg font-bold font-prompt text-rose-700 dark:text-rose-400">
              <CurrencyDisplay amount={report.totalExpense} />
            </p>
          </div>

          {/* Profit Card */}
          <div
            className={`rounded-xl p-4 card-shadow ${
              report.profit >= 0
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign
                className={`w-5 h-5 ${
                  report.profit >= 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              />
              <span className="text-xs text-muted-foreground">กำไร</span>
            </div>
            <p
              className={`text-lg font-bold font-prompt ${
                report.profit >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              <CurrencyDisplay amount={report.profit} />
            </p>
          </div>
        </motion.div>
      )}

      {/* Bar Chart */}
      {isLoading || !report ? (
        <div className="h-52 bg-accent rounded-xl animate-pulse" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-card rounded-xl p-4 border border-border card-shadow"
        >
          <h2 className="text-lg font-semibold mb-4 font-prompt flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            สรุปแต่ละวัน
          </h2>

          {chartData.some((d) => d.income > 0 || d.expense > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : 0;
                    return [
                      new Intl.NumberFormat('th-TH', {
                        style: 'currency',
                        currency: 'THB',
                        minimumFractionDigits: 0,
                      }).format(numValue),
                      name === 'income' ? 'รายได้' : 'ค่าใช้จ่าย',
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '10px',
                  }}
                />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  name="รายได้"
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  name="ค่าใช้จ่าย"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-5xl mb-3">📊</div>
              <p>ยังไม่มีข้อมูลในเดือนนี้</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Category Breakdown */}
      {incomeCategories.length > 0 || expenseCategories.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Income by Category */}
          {incomeCategories.length > 0 && (
            <div className="bg-white dark:bg-card rounded-xl p-4 border border-border card-shadow">
              <h3 className="text-base font-semibold mb-4 font-prompt text-emerald-700 dark:text-emerald-400">
                รายได้แยกตามหมวดหมู่
              </h3>
              <div className="space-y-3">
                {incomeCategories.map((cat) => {
                  const category = INCOME_CATEGORIES.find(
                    (c) => c.id === cat.category
                  );
                  const Icon = category?.icon || TrendingUp;

                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">{cat.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold font-prompt">
                            <CurrencyDisplay amount={cat.total} />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cat.percentage}%
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-accent rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expense by Category */}
          {expenseCategories.length > 0 && (
            <div className="bg-white dark:bg-card rounded-xl p-4 border border-border card-shadow">
              <h3 className="text-base font-semibold mb-4 font-prompt text-rose-700 dark:text-rose-400">
                ค่าใช้จ่ายแยกตามหมวดหมู่
              </h3>
              <div className="space-y-3">
                {expenseCategories.map((cat) => {
                  const category = EXPENSE_CATEGORIES.find(
                    (c) => c.id === cat.category
                  );
                  const Icon = category?.icon || TrendingDown;

                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-rose-600" />
                          <span className="font-medium">{cat.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold font-prompt">
                            <CurrencyDisplay amount={cat.total} />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cat.percentage}%
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-accent rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-rose-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      ) : null}

      {/* Analysis Card */}
      {report &&
        (report.totalIncome > 0 || report.totalExpense > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 rounded-xl p-6 border border-brand-200 dark:border-brand-800 card-shadow"
          >
            <h2 className="text-lg font-semibold mb-4 font-prompt flex items-center gap-2">
              📈 วิเคราะห์เดือนนี้
            </h2>
            <div className="space-y-3">
              {/* Profit analysis */}
              {report.profit >= 0 ? (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-emerald-600">✅</span>
                  <span>
                    กำไร{' '}
                    <span className="font-bold font-prompt">
                      <CurrencyDisplay amount={report.profit} />
                    </span>{' '}
                    ({report.profitMargin}% ของรายได้)
                  </span>
                </motion.p>
              ) : (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-rose-600">⚠️</span>
                  <span>
                    ขาดทุน{' '}
                    <span className="font-bold font-prompt">
                      <CurrencyDisplay amount={Math.abs(report.profit)} />
                    </span>
                  </span>
                </motion.p>
              )}

              {/* Average daily income */}
              {report.averageDailyIncome > 0 && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-start gap-2"
                >
                  <span>📊</span>
                  <span>
                    รายได้เฉลี่ยต่อวัน:{' '}
                    <span className="font-bold font-prompt">
                      <CurrencyDisplay amount={report.averageDailyIncome} />
                    </span>
                  </span>
                </motion.p>
              )}

              {/* Top expense category */}
              {expenseCategories.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start gap-2"
                >
                  <span>💸</span>
                  <span>
                    ค่าใช้จ่ายสูงสุด:{' '}
                    <span className="font-bold">
                      {expenseCategories[0].category}
                    </span>{' '}
                    (
                    <span className="font-bold font-prompt">
                      <CurrencyDisplay amount={expenseCategories[0].total} />
                    </span>
                    )
                  </span>
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

      {/* Empty state */}
      {!isLoading &&
        (!report || (report.totalIncome === 0 && report.totalExpense === 0)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-muted-foreground"
          >
            <div className="text-6xl mb-4">🍜</div>
            <p className="text-lg font-medium">ยังไม่มีข้อมูลในเดือนนี้</p>
            <p className="text-sm mt-2">เริ่มบันทึกรายการเพื่อดูสรุป</p>
          </motion.div>
        )}
    </div>
  );
}
