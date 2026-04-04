'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginSchema } from '@/lib/validations/transaction';
import { loginAction } from '@/app/actions/auth';
import type { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

const initialState = {
  success: false,
  error: '',
};

/**
 * Login page with glass card design
 */
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const formData = new FormData();
      formData.set('email', data.email);
      formData.set('password', data.password);

      const result = await loginAction(initialState, formData);

      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setServerError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 text-6xl">🍜</div>
          <div className="absolute top-40 right-32 text-4xl">🍜</div>
          <div className="absolute bottom-32 left-40 text-5xl">🍜</div>
          <div className="absolute bottom-20 right-20 text-6xl">🍜</div>
        </div>
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
        className={`relative w-full max-w-md rounded-2xl bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-border dark:border-border-dark shadow-md p-8 ${
          serverError ? 'border-rose-500 dark:border-rose-500' : ''
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="text-6xl mb-4"
          >
            🍜
          </motion.div>
          <h1 className="text-2xl font-bold font-prompt text-foreground mb-2">
            บัญชีร้านก๋วยเตี๋ยว
          </h1>
          <p className="text-sm text-muted-foreground">
            ระบบบัญชีสำหรับร้านของคุณ
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="your@email.com"
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-surface/50 text-foreground placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.email
                  ? 'border-rose-500'
                  : 'border-border dark:border-border-dark'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-2 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white/50 dark:bg-surface/50 text-foreground placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                  errors.password
                    ? 'border-rose-500'
                    : 'border-border dark:border-border-dark'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-target flex items-center justify-center"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-2 text-sm text-rose-600 dark:text-rose-400"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Error message */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                },
              }}
              className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
            >
              <p className="text-sm text-rose-700 dark:text-rose-300">
                {serverError}
              </p>
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.99 }}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 touch-target ${
              isLoading
                ? 'bg-brand-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </motion.button>
        </form>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          ระบบบัญชีสำหรับร้านก๋วยเตี๋ยว
        </p>
      </motion.div>
    </div>
  );
}
