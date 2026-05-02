'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  PlusCircle,
  List,
  BarChart2,
  User,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'ภาพรวม', icon: Home, href: '/' },
  { label: 'บันทึก', icon: PlusCircle, href: '/add' },
  { label: 'ประวัติ', icon: List, href: '/history' },
  { label: 'รายเดือน', icon: BarChart2, href: '/monthly' },
  { label: 'โปรไฟล์', icon: User, href: '/profile' },
];

/**
 * Desktop sidebar navigation component
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border/50 hidden md:flex md:flex-col z-20">
      {/* Header */}
      <div className="p-8 border-b border-border/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 relative flex-shrink-0 bg-light-gray dark:bg-near-black rounded-lg p-2">
            <Image
              src="/logo.png"
              alt="Noodle Finance Logo"
              fill
              className="object-contain p-2"
              priority
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user?.shopName || 'ร้านก๋วยเตี๋ยว'}
            </p>
            <p className="text-[12px] text-muted-foreground font-medium truncate">
              บัญชีร้านก๋วยเตี๋ยว
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative block rounded-sm"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="relative flex min-h-[44px] items-center gap-3 px-4 py-3 rounded-sm transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-light-gray dark:bg-near-black rounded-sm"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 flex-shrink-0 relative z-10 transition-colors ${
                    isActive
                      ? 'text-apple-blue dark:text-bright-blue'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <span
                  className={`font-medium relative z-10 transition-colors ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/30">
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="group flex min-h-[44px] w-full items-center gap-3 rounded-sm px-4 py-3 text-muted-foreground transition-all hover:bg-near-black/5 dark:hover:bg-white/5"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-foreground transition-colors" />
          <span className="font-medium">ออกจากระบบ</span>
        </motion.button>
      </div>
    </aside>
  );
}
