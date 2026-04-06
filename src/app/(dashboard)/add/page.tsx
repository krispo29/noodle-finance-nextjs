'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { z } from 'zod';
import { addTransaction } from '@/app/actions/transactions';
import { transactionSchema } from '@/lib/validations/transaction';
import {
  getCategoriesByTransactionType,
  getTransactionTypeMeta,
  TRANSACTION_TYPE_OPTIONS,
} from '@/lib/utils/categories';
import { useAppStore } from '@/stores/useAppStore';

type TransactionFormData = z.infer<typeof transactionSchema>;

const toneClasses = {
  emerald: {
    selected: 'bg-apple-blue text-white shadow-lg',
    button: 'btn-primary',
    badge: 'bg-apple-blue/10 text-apple-blue',
  },
  rose: {
    selected: 'bg-near-black text-white dark:bg-white dark:text-near-black shadow-lg',
    button: 'btn-secondary',
    badge: 'bg-near-black/5 text-near-black dark:bg-white/10 dark:text-white',
  },
  amber: {
    selected: 'bg-near-black text-white dark:bg-white dark:text-near-black shadow-lg',
    button: 'btn-secondary',
    badge: 'bg-near-black/5 text-near-black dark:bg-white/10 dark:text-white',
  },
  sky: {
    selected: 'bg-apple-blue text-white shadow-lg',
    button: 'btn-primary',
    badge: 'bg-apple-blue/10 text-apple-blue',
  },
} as const;

export default function AddPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { transactionType, setTransactionType, selectedCategory, setSelectedCategory } =
    useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transactionType,
      category: selectedCategory || '',
      amount: 0,
      note: '',
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const watchedAmount = watch('amount');
  const watchedCategory = watch('category');
  const activeType = watch('type');
  const activeTypeMeta = getTransactionTypeMeta(activeType);
  const categories = getCategoriesByTransactionType(activeType);
  const activeTone = toneClasses[activeTypeMeta.tone];

  useEffect(() => {
    setValue('type', transactionType);
  }, [setValue, transactionType]);

  useEffect(() => {
    if (selectedCategory) {
      setValue('category', selectedCategory);
    }
  }, [selectedCategory, setValue]);

  const onSelectType = (type: TransactionFormData['type']) => {
    setTransactionType(type);
    setValue('type', type);
    setSelectedCategory('');
    setValue('category', '');
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const result = await addTransaction({
        ...data,
        note: data.note || undefined,
      });

      if (result.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
          queryClient.invalidateQueries({ queryKey: ['transactions', 'history'] }),
          queryClient.invalidateQueries({ queryKey: ['monthly'] }),
        ]);
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
        return;
      }

      setError(result.error || 'เกิดข้อผิดพลาด');
    } catch (submitError) {
      console.error('Add transaction error:', submitError);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [50, 100, 500, 1000];

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-apple-blue/10"
          >
            <Check className="h-12 w-12 text-apple-blue" />
          </motion.div>
          <h2 className="mb-2 text-[32px] font-bold tracking-tight text-foreground leading-tight">
            บันทึกเรียบร้อย
          </h2>
          <p className="text-[17px] text-muted-foreground font-medium">กำลังพาคุณกลับไปที่หน้าหลัก</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-12 pb-32 pt-8 px-4 md:px-8">
      {/* Navigation Header */}
      <section className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-apple-blue font-semibold text-[17px] hover:underline"
        >
          <ArrowLeft className="h-5 w-5" />
          ย้อนกลับ
        </button>
        <h1 className="text-[40px] font-semibold tracking-tight leading-tight text-foreground">
          บันทึกรายการ
        </h1>
        <p className="text-[21px] text-muted-foreground font-medium">
          คัดกรองทุกรายการให้แม่นยำ <br /> เพื่อสรุปผลกำไรที่แท้จริง
        </p>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Type Selection */}
        <section className="space-y-4">
          <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">ประเภทรายการ</label>
          <div className="grid grid-cols-2 gap-3">
            {TRANSACTION_TYPE_OPTIONS.map((type) => {
              const Icon = type.icon;
              const isSelected = activeType === type.id;
              const typeTone = toneClasses[type.tone];

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onSelectType(type.id)}
                  className={`apple-card p-4 text-left border border-border/30 transition-all ${
                    isSelected ? typeTone.selected : 'hover:bg-light-gray dark:hover:bg-near-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-background border border-border/20'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[17px] tracking-tight">{type.shortLabel}</p>
                      <p className={`text-[12px] font-medium tracking-tight ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {type.label}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className={`p-4 rounded-md text-[14px] font-medium leading-relaxed ${activeTone.badge}`}>
            {activeType === 'owner_withdrawal' && 'ถอนเงินจากร้านไปใช้ส่วนตัว — รายการนี้ไม่นับเป็นรายจ่ายร้านแต่มีผลกับเงินสดในมือ'}
            {activeType === 'owner_topup' && 'เติมเงินส่วนตัวเข้าร้าน — รายการนี้ไม่นับเป็นรายรับร้านแต่มีผลกับเงินสดในมือ'}
            {activeType === 'income' && 'รายได้จากการขายของ — รายการนี้จะนำไปรวมคำนวณกำไรของร้าน'}
            {activeType === 'expense' && 'รายจ่ายเพื่อธุรกิจ (เช่น ค่าแก๊ส, ค่าของ) — รายการนี้จะนำไปหักลบเพื่อหากำไร'}
          </div>
        </section>

        {/* Category Selection */}
        <section className="space-y-4">
          <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">หมวดหมู่</label>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="wait">
              {categories.map((category, index) => {
                const Icon = category.icon;
                const isSelected = watchedCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setValue('category', category.id);
                    }}
                    className={`apple-card p-4 flex items-center gap-3 border border-border/30 transition-all ${
                      isSelected ? activeTone.selected : 'hover:bg-light-gray dark:hover:bg-near-black'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold text-[15px]">{category.label}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          {errors.category && (
            <p className="text-[14px] text-rose-600 font-medium">{errors.category.message}</p>
          )}
        </section>

        {/* Amount Section */}
        <section className="space-y-4">
          <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">จำนวนเงิน</label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[32px] font-bold text-muted-foreground transition-colors group-focus-within:text-apple-blue">
              ฿
            </span>
            <input
              type="number"
              inputMode="decimal"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0"
              disabled={isSubmitting}
              className={`w-full bg-light-gray dark:bg-near-black border-none rounded-2xl py-8 pl-14 pr-6 text-[48px] font-bold tracking-tighter text-foreground focus:ring-4 focus:ring-apple-blue/20 transition-all outline-none ${
                errors.amount ? 'ring-2 ring-rose-500' : ''
              }`}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setValue('amount', (watchedAmount || 0) + amount)}
                disabled={isSubmitting}
                className="py-3 px-2 rounded-lg bg-light-gray dark:bg-near-black text-[14px] font-bold hover:bg-border/30 transition-colors"
              >
                +{amount.toLocaleString()}
              </button>
            ))}
          </div>
          {errors.amount && (
            <p className="text-[14px] text-rose-600 font-medium">{errors.amount.message}</p>
          )}
        </section>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">หมายเหตุ</label>
            <input
              type="text"
              {...register('note')}
              placeholder="บันทึกช่วยจำ (ถ้ามี)"
              className="w-full apple-card bg-light-gray dark:bg-near-black border-none focus:ring-2 focus:ring-apple-blue outline-none p-4 font-medium text-[17px]"
            />
          </section>

          <section className="space-y-4">
            <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">วันที่</label>
            <input
              type="date"
              {...register('transactionDate')}
              className="w-full apple-card bg-light-gray dark:bg-near-black border-none focus:ring-2 focus:ring-apple-blue outline-none p-4 font-medium text-[17px]"
            />
          </section>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 font-medium text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !watchedAmount || !watchedCategory}
          className={`w-full py-5 rounded-2xl text-[21px] font-bold tracking-tight transition-all shadow-xl ${
            isSubmitting || !watchedAmount || !watchedCategory
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : `${activeTone.button} hover:scale-[1.02] active:scale-[0.98]`
          }`}
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
        </button>
      </form>
    </div>
  );
}
