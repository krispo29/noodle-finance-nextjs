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
    <div className="flex min-h-screen items-center justify-center bg-background p-6 md:p-12">
      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] space-y-10"
      >
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[48px] md:text-[64px]"
          >
            🍜
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-[34px] md:text-[40px] font-semibold tracking-tight leading-tight text-foreground">
              เข้าสู่ระบบร้าน
            </h1>
            <p className="text-[17px] text-muted-foreground font-medium uppercase tracking-widest">
              Noodle Finance System
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Apple ID (Email)"
                disabled={isLoading}
                className={`w-full bg-light-gray dark:bg-near-black border-none rounded-2xl py-4 px-6 text-[17px] font-medium text-foreground focus:ring-4 focus:ring-apple-blue/20 transition-all outline-none placeholder:text-muted-foreground ${
                  errors.email ? 'ring-2 ring-rose-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-[14px] text-rose-600 font-medium px-2">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Password"
                  disabled={isLoading}
                  className={`w-full bg-light-gray dark:bg-near-black border-none rounded-2xl py-4 px-6 pr-14 text-[17px] font-medium text-foreground focus:ring-4 focus:ring-apple-blue/20 transition-all outline-none placeholder:text-muted-foreground ${
                    errors.password ? 'ring-2 ring-rose-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[14px] text-rose-600 font-medium px-2">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 text-sm font-medium text-center border border-rose-200 dark:border-rose-900/20"
            >
              {serverError}
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-full text-[17px] font-bold tracking-tight transition-all shadow-xl ${
                isLoading
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-apple-blue hover:bg-apple-blue/90 text-white active:scale-[0.98]'
              }`}
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'ลงชื่อเข้าใช้'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-8 space-y-4">
           <p className="text-[14px] font-medium text-muted-foreground">
             ลืมรหัสผ่าน? ติดตามความช่วยเหลือได้ที่นี่
           </p>
           <div className="flex items-center justify-center gap-4 text-[12px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
             <span>Privacy</span>
             <span>Terms</span>
             <span>Support</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
