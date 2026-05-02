'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Error boundary to catch and display errors gracefully
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-sm text-muted-foreground">
              โหลดข้อมูลไม่ได้ ลองใหม่อีกครั้ง
            </p>
          </div>
          <motion.button
            onClick={() => this.setState({ hasError: false })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="btn-primary min-h-[44px] rounded-lg px-4"
          >
            ลองอีกครั้ง
          </motion.button>
        </div>
      );
    }

    return this.props.children;
  }
}
