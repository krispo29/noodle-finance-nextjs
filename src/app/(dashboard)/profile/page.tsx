'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LogOut, User, Store, Shield, ChevronRight, Moon, Sun, Tags } from 'lucide-react';
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
  const springTap = { type: 'spring', stiffness: 400, damping: 17 } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-12 pb-32 pt-8 px-4 md:px-8"
    >
      {/* Header Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">Account Settings</span>
          <ThemeToggle />
        </div>
        <h1 className="text-[40px] md:text-[56px] font-semibold leading-tight text-foreground">
          โปรไฟล์
        </h1>
        <p className="text-[21px] text-muted-foreground font-medium max-w-lg leading-snug">
          จัดการข้อมูลร้านค้า <br className="hidden md:block" />
          และปรับแต่งการใช้งานส่วนตัว
        </p>
      </section>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="apple-card p-8 flex flex-col md:flex-row items-center gap-8 bg-light-gray/50 dark:bg-near-black/50"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-apple-blue text-white shadow-xl">
          <User className="h-12 w-12" />
        </div>
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-[32px] font-bold text-foreground leading-tight">
            {user?.shopName || 'ก๋วยเตี๋ยวรสเด็ด'}
          </h2>
          <p className="text-[17px] text-muted-foreground font-medium uppercase">บัญชีเจ้าของร้าน</p>
        </div>
      </motion.div>

      <Link
        href="/profile/categories"
        className="block"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={springTap}
          className="apple-card flex items-center justify-between gap-4 bg-apple-blue text-white hover:opacity-95"
        >
          <div className="space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-white/70">
              Quick access
            </p>
            <p className="text-[24px] font-bold">จัดการหมวดหมู่รายการ</p>
            <p className="text-[15px] font-medium text-white/80">
              เพิ่ม แก้ไข ปิดใช้งาน หรือลบหมวดหมู่ได้จากหน้านี้
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <Tags className="h-6 w-6" />
          </div>
        </motion.div>
      </Link>

      {/* Options List */}
      <section className="space-y-6">
        {/* Appearance Section */}
        <div className="space-y-4">
           <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">การแสดงผล</label>
           <div className="apple-card divide-y divide-border/20 border border-border/10 p-0 overflow-hidden">
             <div className="flex items-center justify-between px-6 py-4 hover:bg-light-gray/30 dark:hover:bg-near-black/30 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-background border border-border/30">
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </div>
                  <span className="text-[17px] font-semibold">โหมดมืด</span>
               </div>
               <ThemeToggle />
             </div>
           </div>
        </div>

        {/* Account Settings Section */}
        <div className="space-y-4">
          <label className="text-[14px] font-semibold text-muted-foreground uppercase tracking-widest block">บัญชี</label>
          <div className="apple-card divide-y divide-border/20 border border-border/10 p-0 overflow-hidden">
             <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={springTap}
              className="group flex min-h-[44px] w-full items-center justify-between px-6 py-4 transition-colors hover:bg-light-gray/30 dark:hover:bg-near-black/30"
             >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-background border border-border/30">
                    <Store className="h-5 w-5" />
                  </div>
                  <span className="text-[17px] font-semibold">ข้อมูลร้านค้า</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
             </motion.button>
             <Link
              href="/profile/categories"
              className="group block"
             >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={springTap}
                className="flex min-h-[44px] w-full items-center justify-between px-6 py-4 transition-colors hover:bg-light-gray/30 dark:hover:bg-near-black/30"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-background border border-border/30">
                    <Tags className="h-5 w-5" />
                  </div>
                  <span className="text-[17px] font-semibold">จัดการหมวดหมู่</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </motion.div>
             </Link>
             <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={springTap}
              className="group flex min-h-[44px] w-full items-center justify-between px-6 py-4 transition-colors hover:bg-light-gray/30 dark:hover:bg-near-black/30"
             >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-background border border-border/30">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="text-[17px] font-semibold">ความปลอดภัย</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
             </motion.button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6">
           <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={springTap}
            className="w-full apple-card min-h-[44px] bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 font-bold text-[17px] flex items-center justify-center gap-3 transition-all border border-rose-200 dark:border-rose-900/30"
          >
            <LogOut className="h-5 w-5" />
            ออกจากระบบ
          </motion.button>
        </div>
      </section>

      {/* Version Info */}
      <footer className="text-center pt-12">
        <p className="text-[14px] font-semibold text-muted-foreground uppercase">Noodle Finance v1.0.0</p>
        <p className="text-[12px] text-muted-foreground/60 mt-1 font-medium">Built for Street Food Heroes</p>
      </footer>
    </motion.div>
  );
}
