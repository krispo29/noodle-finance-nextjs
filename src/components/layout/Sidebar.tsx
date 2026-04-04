'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  PlusCircle,
  List,
  BarChart2,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'ภาพรวม', icon: Home, href: '/' },
  { label: 'บันทึก', icon: PlusCircle, href: '/add' },
  { label: 'ประวัติ', icon: List, href: '/history' },
  { label: 'รายเดือน', icon: BarChart2, href: '/monthly' },
];

/**
 * Desktop sidebar navigation component
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-card border-r border-border hidden md:flex md:flex-col z-20">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Noodle Finance Logo"
              fill
              className="object-contain"
              priority
              sizes="40px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user?.shopName || 'ร้านก๋วยเตี๋ยว'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              บัญชีร้านก๋วยเตี๋ยว
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-target group"
            >
              {isActive ? (
                <>
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-brand-50 dark:bg-brand-900/20 rounded-xl"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-600 rounded-r-full" />
                </>
              ) : (
                <div className="absolute inset-0 bg-transparent group-hover:bg-accent rounded-xl transition-colors" />
              )}
              <Icon
                className={`w-5 h-5 flex-shrink-0 relative z-10 transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-500'
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}
              />
              <span
                className={`font-medium relative z-10 transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-500'
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all touch-target group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="font-medium">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
