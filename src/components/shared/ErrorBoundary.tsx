'use client';

import React from 'react';
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
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
