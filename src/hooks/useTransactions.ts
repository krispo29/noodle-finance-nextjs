'use client';

import { useQuery } from '@tanstack/react-query';
import { Transaction, DashboardSummary, HistoryFilters } from '@/types';

/**
 * Hook to fetch dashboard summary data
 */
export function useDashboardSummary(date: string) {
  return useQuery({
    queryKey: ['dashboard', 'summary', date],
    queryFn: async () => {
      const { getDashboardSummary } = await import('@/app/actions/transactions');
      return getDashboardSummary(date);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch transaction history
 */
export function useTransactionHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: ['transactions', 'history', filters],
    queryFn: async () => {
      const { getTransactionHistory } = await import('@/app/actions/transactions');
      return getTransactionHistory(filters);
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch monthly report
 */
export function useMonthlyReport(year: number, month: number) {
  return useQuery({
    queryKey: ['monthly', year, month],
    queryFn: async () => {
      const { getMonthlyReport } = await import('@/app/actions/transactions');
      return getMonthlyReport(year, month);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
