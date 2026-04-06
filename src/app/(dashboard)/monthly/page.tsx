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
    <div className="mx-auto max-w-4xl space-y-12 pb-32 pt-8 px-4 md:px-8">
      {/* Header with month navigation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
           <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">Monthly Report</span>
           <ThemeToggle />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-tight text-foreground">
              {monthName} {thaiYear}
            </h1>
            <p className="text-[21px] text-muted-foreground font-medium max-w-lg leading-snug">
              วิเคราะห์ความแข็งแกร่ง <br className="hidden md:block" />
              ของกระแสเงินสดในรอบเดือน
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-3 rounded-full bg-light-gray dark:bg-near-black hover:bg-border/30 transition-all"
              aria-label="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextMonth}
              className="p-3 rounded-full bg-light-gray dark:bg-near-black hover:bg-border/30 transition-all"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Summary Highlights */}
      {!isLoading && report && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="apple-card p-6 space-y-4 bg-light-gray/50 dark:bg-near-black/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/30">
                <TrendingUp className="h-5 w-5 text-apple-blue" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-muted-foreground uppercase tracking-tight">รายได้รวม</p>
                <p className="text-[32px] font-bold tracking-tight text-apple-blue dark:text-bright-blue">
                  <CurrencyDisplay amount={report.totalIncome} />
                </p>
              </div>
           </div>

           <div className="apple-card p-6 space-y-4 bg-light-gray/50 dark:bg-near-black/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/30">
                <TrendingDown className="h-5 w-5 text-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-muted-foreground uppercase tracking-tight">รายจ่ายรวม</p>
                <p className="text-[32px] font-bold tracking-tight text-foreground">
                  <CurrencyDisplay amount={report.totalExpense} />
                </p>
              </div>
           </div>

           <div className={`apple-card p-6 space-y-4 ${report.profit >= 0 ? 'bg-apple-blue/5 dark:bg-bright-blue/5' : 'bg-rose-50 dark:bg-rose-900/10'}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border/30">
                <DollarSign className={`h-5 w-5 ${report.profit >= 0 ? 'text-apple-blue' : 'text-rose-600'}`} />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-muted-foreground uppercase tracking-tight">กำไรสุทธิ</p>
                <p className={`text-[32px] font-bold tracking-tight ${report.profit >= 0 ? 'text-apple-blue dark:text-bright-blue' : 'text-rose-600'}`}>
                  <CurrencyDisplay amount={report.profit} showSign />
                </p>
              </div>
           </div>
        </section>
      )}

      {/* Chart Section */}
      <section className="space-y-4">
        <h2 className="text-[21px] font-semibold tracking-tight">สรุปรายวัน</h2>
        <div className="apple-card p-6 pt-10 border border-border/30">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center bg-light-gray/20 rounded-xl animate-pulse">
              <LoadingSpinner />
            </div>
          ) : chartData.some((d) => d.income > 0 || d.expense > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.5 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.5 }}
                />
                <Tooltip
                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass p-3 rounded-lg border border-border/50 shadow-xl">
                          <p className="text-[12px] font-bold text-muted-foreground uppercase mb-2">วันที่ {payload[0].payload.date}</p>
                          <div className="space-y-1">
                            {payload.map((entry, idx) => (
                              <p key={idx} className="text-[14px] font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}: <CurrencyDisplay amount={Number(entry.value)} />
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="income"
                  fill="#0071e3"
                  radius={[4, 4, 4, 4]}
                  name="รายได้"
                  barSize={12}
                />
                <Bar
                  dataKey="expense"
                  fill="#1d1d1f"
                  radius={[4, 4, 4, 4]}
                  name="รายจ่าย"
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-xl">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-[17px] font-medium">ไม่มีข้อมูลสำหรับเดือนนี้</p>
            </div>
          )}
        </div>
      </section>

      {/* Category Breakdown */}
      {(incomeCategories.length > 0 || expenseCategories.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Income Categories */}
           <div className="space-y-4">
              <h3 className="text-[17px] font-bold tracking-tight uppercase text-muted-foreground">รายได้แยกตามหมวดหมู่</h3>
              <div className="space-y-4">
                {incomeCategories.map((cat) => {
                   const category = INCOME_CATEGORIES.find((c) => c.id === cat.category);
                   const Icon = category?.icon || TrendingUp;
                   return (
                     <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-apple-blue/10 text-apple-blue">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-[15px]">{cat.category}</span>
                           </div>
                           <p className="font-bold text-[15px]"><CurrencyDisplay amount={cat.total} /></p>
                        </div>
                        <div className="h-1.5 w-full bg-light-gray dark:bg-near-black rounded-full overflow-hidden">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.percentage}%` }}
                              className="h-full bg-apple-blue rounded-full"
                           />
                        </div>
                     </div>
                   );
                })}
              </div>
           </div>

           {/* Expense Categories */}
           <div className="space-y-4">
              <h3 className="text-[17px] font-bold tracking-tight uppercase text-muted-foreground">ค่าใช้จ่ายแยกตามหมวดหมู่</h3>
              <div className="space-y-4">
                {expenseCategories.map((cat) => {
                   const category = EXPENSE_CATEGORIES.find((c) => c.id === cat.category);
                   const Icon = category?.icon || TrendingDown;
                   return (
                     <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-near-black/5 dark:bg-white/10 text-foreground">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-[15px]">{cat.category}</span>
                           </div>
                           <p className="font-bold text-[15px]"><CurrencyDisplay amount={cat.total} /></p>
                        </div>
                        <div className="h-1.5 w-full bg-light-gray dark:bg-near-black rounded-full overflow-hidden">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.percentage}%` }}
                              className="h-full bg-foreground rounded-full"
                           />
                        </div>
                     </div>
                   );
                })}
              </div>
           </div>
        </section>
      )}

      {/* Analysis Section */}
      {!isLoading && report && (report.totalIncome > 0 || report.totalExpense > 0) && (
        <section className="space-y-4">
          <h2 className="text-[21px] font-semibold tracking-tight">วิเคราะห์เดือนนี้</h2>
          <div className="apple-card p-8 bg-apple-blue dark:bg-near-black text-white space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[14px] font-bold uppercase tracking-widest text-white/60">กำไรสุทธิ</p>
                   <p className="text-[32px] font-bold tracking-tight">
                     {report.profitMargin}% <span className="text-[17px] font-medium text-white/70">ของรายได้</span>
                   </p>
                </div>
                <div className="space-y-1">
                   <p className="text-[14px] font-bold uppercase tracking-widest text-white/60">รายได้เฉลี่ยรายวัน</p>
                   <p className="text-[32px] font-bold tracking-tight">
                     <CurrencyDisplay amount={report.averageDailyIncome} />
                   </p>
                </div>
             </div>
             
             <div className="pt-6 border-t border-white/10">
                <p className="text-[17px] font-medium leading-relaxed">
                   {report.profit >= 0 
                     ? `ยินดีด้วย! เดือนนี้ธุรกิจของคุณมีผลกำไร และรักษาระดับกำไรไว้ได้ที่ ${report.profitMargin}% ซึ่งเป็นสัญญาณที่ดีของสุขภาพทางการเงิน`
                     : 'เดือนนี้ธุรกิจมีค่าใช้จ่ายสูงกว่ารายได้ โปรดตรวจสอบหมวดหมู่ค่าใช้จ่ายที่สูงที่สุดเพื่อหาทางลดต้นทุนในเดือนถัดไป'}
                </p>
             </div>
          </div>
        </section>
      )}
    </div>
  );
}
