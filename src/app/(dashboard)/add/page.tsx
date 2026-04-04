'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { transactionSchema } from '@/lib/validations/transaction';
import { addTransaction } from '@/app/actions/transactions';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/utils/categories';
import { useAppStore } from '@/stores/useAppStore';
import { format } from 'date-fns';
import type { z } from 'zod';

type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Add Transaction Page
 * Full-featured form to create new transactions
 */
export default function AddPage() {
  const router = useRouter();
  const { transactionType, setTransactionType, selectedCategory, setSelectedCategory } = useAppStore();
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

  const watchedType = watch('type');
  const watchedAmount = watch('amount');
  const watchedCategory = watch('category');

  // Sync with store
  useEffect(() => {
    setValue('type', transactionType);
  }, [transactionType, setValue]);

  useEffect(() => {
    if (selectedCategory) {
      setValue('category', selectedCategory);
    }
  }, [selectedCategory, setValue]);

  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    setError('');
    try {
      // Convert null to undefined for compatibility with TransactionInput
      const transactionData = {
        ...data,
        note: data.note || undefined,
      };
      
      const result = await addTransaction(transactionData);

      if (result.success) {
        setIsSuccess(true);
        // Redirect after success animation
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Add transaction error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick amount buttons
  const quickAmounts = [50, 100, 500, 1000];

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold font-prompt text-foreground mb-2">
            บันทึกรายการสำเร็จ!
          </h2>
          <p className="text-muted-foreground">กำลังกลับไปยังหน้าหลัก...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 sticky top-0 z-10 bg-app-bg/80 backdrop-blur-lg py-4"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-accent transition-colors touch-target"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold font-prompt">บันทึกรายการ</h1>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Income/Expense Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-accent rounded-xl p-1"
        >
          <div className="grid grid-cols-2 gap-1 relative">
            <motion.button
              type="button"
              onClick={() => {
                setTransactionType('income');
                setValue('type', 'income');
                setSelectedCategory('');
                setValue('category', '');
              }}
              className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all touch-target ${
                transactionType === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-muted-foreground'
              }`}
            >
              รายได้
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                setTransactionType('expense');
                setValue('type', 'expense');
                setSelectedCategory('');
                setValue('category', '');
              }}
              className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all touch-target ${
                transactionType === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-muted-foreground'
              }`}
            >
              ค่าใช้จ่าย
            </motion.button>
          </div>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-foreground mb-3">
            หมวดหมู่
          </label>
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence mode="wait">
              {categories.map((category, index) => {
                const Icon = category.icon;
                const isSelected = watchedCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setValue('category', category.id);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all touch-target ${
                      isSelected
                        ? transactionType === 'income'
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                          : 'bg-rose-500 border-rose-500 text-white shadow-md'
                        : 'bg-white dark:bg-card border-border hover:border-brand-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm flex-1 text-left">
                      {category.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          {errors.category && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
              {errors.category.message}
            </p>
          )}
        </motion.div>

        {/* Amount Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="block text-sm font-medium text-foreground mb-3">
            จำนวนเงิน
          </label>
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
              className={`w-full pl-12 pr-4 py-6 text-3xl font-bold font-prompt rounded-xl border bg-white dark:bg-card text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.amount
                  ? 'border-rose-500'
                  : 'border-border dark:border-border-dark'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          {errors.amount && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
              {errors.amount.message}
            </p>
          )}

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setValue('amount', amount)}
                disabled={isSubmitting}
                className="py-3 px-2 rounded-lg bg-accent hover:bg-accent/80 text-foreground font-semibold text-sm transition-colors touch-target disabled:opacity-50"
              >
                +{amount.toLocaleString()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Note Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-foreground mb-3">
            หมายเหตุ (ไม่บังคับ)
          </label>
          <input
            type="text"
            {...register('note')}
            placeholder="เช่น ขายเช้า, ค่าเส้น..."
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-card text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
              errors.note
                ? 'border-rose-500'
                : 'border-border dark:border-border-dark'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.note && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
              {errors.note.message}
            </p>
          )}
        </motion.div>

        {/* Date Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="block text-sm font-medium text-foreground mb-3">
            วันที่
          </label>
          <input
            type="date"
            {...register('transactionDate')}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-card text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
              errors.transactionDate
                ? 'border-rose-500'
                : 'border-border dark:border-border-dark'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.transactionDate && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
              {errors.transactionDate.message}
            </p>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
          >
            <p className="text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !watchedAmount || !watchedCategory}
          whileHover={{ scale: isSubmitting || !watchedAmount || !watchedCategory ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting || !watchedAmount || !watchedCategory ? 1 : 0.99 }}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all shadow-md touch-target ${
            isSubmitting || !watchedAmount || !watchedCategory
              ? 'bg-muted cursor-not-allowed'
              : transactionType === 'income'
              ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-600 hover:shadow-lg'
              : 'bg-rose-500 hover:bg-rose-600 active:bg-rose-600 hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              กำลังบันทึก...
            </span>
          ) : (
            `บันทึกรายการ`
          )}
        </motion.button>
      </form>
    </div>
  );
}
