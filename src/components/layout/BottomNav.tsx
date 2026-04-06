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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'ภาพรวม', icon: Home, href: '/' },
  { label: 'บันทึก', icon: PlusCircle, href: '/add' },
  { label: 'ประวัติ', icon: List, href: '/history' },
  { label: 'รายเดือน', icon: BarChart2, href: '/monthly' },
  { label: 'โปรไฟล์', icon: User, href: '/profile' },
];

/**
 * Mobile bottom navigation component
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-area-bottom md:hidden">
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
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive
                    ? 'text-apple-blue dark:text-bright-blue'
                    : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] mt-1 transition-colors font-medium tracking-tight ${
                  isActive
                    ? 'text-apple-blue dark:text-bright-blue'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
