'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    selected: 'bg-emerald-500 border-emerald-500 text-white shadow-md',
    button: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-600',
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  rose: {
    selected: 'bg-rose-500 border-rose-500 text-white shadow-md',
    button: 'bg-rose-500 hover:bg-rose-600 active:bg-rose-600',
    badge: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  amber: {
    selected: 'bg-amber-500 border-amber-500 text-white shadow-md',
    button: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-600',
    badge: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  sky: {
    selected: 'bg-sky-500 border-sky-500 text-white shadow-md',
    button: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-600',
    badge: 'bg-sky-50 border-sky-200 text-sky-700',
  },
} as const;

export default function AddPage() {
  const router = useRouter();
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
      <div className="flex min-h-[80vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
          >
            <Check className="h-12 w-12 text-emerald-600" />
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold font-prompt text-foreground">
            บันทึกรายการสำเร็จ
          </h2>
          <p className="text-muted-foreground">กำลังกลับไปหน้าหลัก...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sticky top-0 z-10 flex items-center gap-3 bg-app-bg/80 py-4 backdrop-blur-lg"
      >
        <button
          onClick={() => router.back()}
          className="touch-target rounded-lg p-2 transition-colors hover:bg-accent"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-prompt">บันทึกรายการ</h1>
          <p className="text-sm text-muted-foreground">แยกให้ชัดว่าเป็นเงินร้านหรือเงินส่วนตัว</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-foreground">ประเภทรายการ</label>
          <div className="grid grid-cols-2 gap-2">
            {TRANSACTION_TYPE_OPTIONS.map((type) => {
              const Icon = type.icon;
              const isSelected = activeType === type.id;
              const typeTone = toneClasses[type.tone];

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onSelectType(type.id)}
                  className={`rounded-xl border-2 px-4 py-3 text-left transition-all touch-target ${
                    isSelected
                      ? typeTone.selected
                      : 'border-border bg-white text-foreground hover:border-brand-300 dark:bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{type.shortLabel}</p>
                      <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                        {type.label}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-xl border px-4 py-3 text-sm ${activeTone.badge}`}
        >
          {activeType === 'owner_withdrawal' && 'รายการนี้ใช้เมื่อหยิบเงินจากร้านไปใช้ในบ้านหรือใช้ส่วนตัว'}
          {activeType === 'owner_topup' && 'รายการนี้ใช้เมื่อเอาเงินส่วนตัวเติมกลับเข้าร้านเพื่อหมุนเงิน'}
          {activeType === 'income' && 'รายการนี้นับเป็นรายรับของร้านและเอาไปคำนวณกำไร'}
          {activeType === 'expense' && 'รายการนี้นับเป็นรายจ่ายของร้านและเอาไปคำนวณกำไร'}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="mb-3 block text-sm font-medium text-foreground">หมวดหมู่</label>
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence mode="wait">
              {categories.map((category, index) => {
                const Icon = category.icon;
                const isSelected = watchedCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setValue('category', category.id);
                    }}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all touch-target ${
                      isSelected
                        ? activeTone.selected
                        : 'border-border bg-white hover:border-brand-300 dark:bg-card'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left text-sm font-medium">{category.label}</span>
                    {isSelected && <Check className="h-5 w-5" />}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          {errors.category && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{errors.category.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="mb-3 block text-sm font-medium text-foreground">จำนวนเงิน</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-prompt text-muted-foreground">
              ฿
            </span>
            <input
              type="number"
              inputMode="decimal"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0"
              disabled={isSubmitting}
              className={`w-full rounded-xl border bg-white py-6 pl-12 pr-4 text-3xl font-bold font-prompt text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-card ${
                errors.amount ? 'border-rose-500' : 'border-border dark:border-border-dark'
              } ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
            />
          </div>
          {errors.amount && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{errors.amount.message}</p>
          )}

          <div className="mt-3 grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setValue('amount', amount)}
                disabled={isSubmitting}
                className="touch-target rounded-lg bg-accent px-2 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent/80 disabled:opacity-50"
              >
                +{amount.toLocaleString()}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="mb-3 block text-sm font-medium text-foreground">หมายเหตุ (ไม่บังคับ)</label>
          <input
            type="text"
            {...register('note')}
            placeholder="เช่น จ่ายค่าวัตถุดิบเพิ่ม หรือถอนไปซื้อของที่บ้าน"
            disabled={isSubmitting}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-card ${
              errors.note ? 'border-rose-500' : 'border-border dark:border-border-dark'
            } ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          {errors.note && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{errors.note.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="mb-3 block text-sm font-medium text-foreground">วันที่</label>
          <input
            type="date"
            {...register('transactionDate')}
            disabled={isSubmitting}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-card ${
              errors.transactionDate ? 'border-rose-500' : 'border-border dark:border-border-dark'
            } ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          {errors.transactionDate && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
              {errors.transactionDate.message}
            </p>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20"
          >
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting || !watchedAmount || !watchedCategory}
          whileHover={{ scale: isSubmitting || !watchedAmount || !watchedCategory ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting || !watchedAmount || !watchedCategory ? 1 : 0.99 }}
          className={`touch-target w-full rounded-xl px-6 py-4 text-lg font-bold text-white shadow-md transition-all ${
            isSubmitting || !watchedAmount || !watchedCategory
              ? 'cursor-not-allowed bg-muted'
              : `${activeTone.button} hover:shadow-lg`
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              กำลังบันทึก...
            </span>
          ) : (
            'บันทึกรายการ'
          )}
        </motion.button>
      </form>
    </div>
  );
}
