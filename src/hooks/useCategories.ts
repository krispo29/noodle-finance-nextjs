'use client';

import { useQuery } from '@tanstack/react-query';

export function useTransactionCategories(includeInactive = false) {
  return useQuery({
    queryKey: ['transaction-categories', includeInactive],
    queryFn: async () => {
      const { getTransactionCategories } = await import('@/app/actions/categories');
      return getTransactionCategories(includeInactive);
    },
    staleTime: 1000 * 60 * 10,
  });
}
