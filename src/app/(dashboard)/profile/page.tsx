'use client';

import { motion } from 'framer-motion';
import { LogOut, User, Store, Shield, ChevronRight, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      await logout();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between py-4"
      >
        <div>
          <h1 className="text-xl font-bold font-prompt">โปรไฟล์</h1>
          <p className="text-sm text-muted-foreground">จัดการบัญชีและตั้งค่าการใช้งาน</p>
        </div>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-6 shadow-sm border border-border dark:bg-card overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-600" />
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-prompt truncate">
              {user?.shopName || 'ก๋วยเตี๋ยวรสเด็ด'}
            </h2>
            <p className="text-sm text-muted-foreground">บัญชีร้านค้า</p>
          </div>
        </div>
      </motion.div>

      {/* Options List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white shadow-sm border border-border dark:bg-card overflow-hidden"
      >
        {/* Appearance Section */}
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
            การแสดงผล
          </h3>
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </div>
              <span className="font-medium">โหมดมืด</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Account Section */}
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
            บัญชี
          </h3>
          <div className="space-y-1">
            <button className="flex w-full items-center justify-between rounded-xl px-2 py-3 transition hover:bg-accent group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                  <Store className="h-5 w-5" />
                </div>
                <span className="font-medium">ข้อมูลร้านค้า</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex w-full items-center justify-between rounded-xl px-2 py-3 transition hover:bg-accent group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="font-medium">ความลับและความปลอดภัย</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-900/20 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 group-hover:scale-110 transition-transform">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </motion.div>

      {/* Version Info */}
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground">Noodle Finance v1.0.0</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Made with 🍜 for Street Food Heroes</p>
      </div>
    </div>
  );
}
