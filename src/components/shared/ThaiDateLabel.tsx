'use client';

import { useEffect, useState } from 'react';
import { formatThaiDate, formatThaiDateFull } from '@/lib/utils/formatThaiDate';

interface ThaiDateLabelProps {
  date?: Date | string;
  className?: string;
  variant?: 'short' | 'full';
}

function toDateTimeString(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Component to display dates in Thai Buddhist Era format
 */
export default function ThaiDateLabel({
  date,
  className = '',
  variant = 'short',
}: Readonly<ThaiDateLabelProps>) {
  const [mountedDate, setMountedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!date) {
      setMountedDate(new Date());
    }
  }, [date]);

  if (!date && !mountedDate) {
    return <span className={className}>...</span>;
  }

  const finalDate = date ?? mountedDate ?? new Date();
  const formatted =
    variant === 'full' ? formatThaiDateFull(finalDate) : formatThaiDate(finalDate);

  return (
    <time dateTime={toDateTimeString(finalDate)} className={`tabular-nums ${className}`}>
      {formatted}
    </time>
  );
}
