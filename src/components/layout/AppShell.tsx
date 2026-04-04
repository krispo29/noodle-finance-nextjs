'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Page transition component
 */
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={children ? 'page' : 'empty'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * App shell wrapper with responsive navigation
 */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Desktop sidebar */}
      <Sidebar />
      
      {/* Main content with page transitions */}
      <main className="md:ml-64 pb-24 md:pb-8">
        <PageTransition>{children}</PageTransition>
      </main>
      
      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
