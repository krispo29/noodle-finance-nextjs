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
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'ภาพรวม', icon: Home, href: '/' },
  { label: 'บันทึก', icon: PlusCircle, href: '/add' },
  { label: 'ประวัติ', icon: List, href: '/history' },
  { label: 'รายเดือน', icon: BarChart2, href: '/monthly' },
];

/**
 * Mobile bottom navigation component
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-surface/80 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-2 w-1.5 h-1.5 bg-brand-600 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive
                    ? 'text-brand-600'
                    : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive
                    ? 'text-brand-600 font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Logout button - top right for mobile */}
      <button
        onClick={logout}
        className="absolute top-2 right-2 p-2 rounded-lg text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all touch-target"
        aria-label="ออกจากระบบ"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </nav>
  );
}
