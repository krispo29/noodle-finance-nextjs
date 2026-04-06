'use client';

import { formatCurrency } from '@/lib/utils/formatCurrency';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean; // Show + or - sign
}

/**
 * Component to display currency amounts in Thai Baht format
 */
export default function CurrencyDisplay({ 
  amount, 
  className = '',
  showSign = false 
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(Math.abs(amount));
  const isPositive = amount >= 0;

  return (
    <span className={className}>
      {showSign && (
        <span className={isPositive ? 'text-apple-blue dark:text-bright-blue' : 'text-rose-600'}>
          {isPositive ? '+' : '-'}
        </span>
      )}
      {formatted}
    </span>
  );
}
