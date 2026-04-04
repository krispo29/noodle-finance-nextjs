'use client';

import { useState, useEffect } from 'react';
import { formatThaiDate, formatThaiDateFull } from '@/lib/utils/formatThaiDate';

interface ThaiDateLabelProps {
  date?: Date | string;
  className?: string;
  variant?: 'short' | 'full';
}

/**
 * Component to display dates in Thai Buddhist Era format
 */
export default function ThaiDateLabel({ 
  date, 
  className = '',
  variant = 'short' 
}: Readonly<ThaiDateLabelProps>) {
  const [currentDate, setCurrentDate] = useState<Date | string | undefined>(date);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!date) {
      setCurrentDate(new Date());
    }
  }, [date]);

  // If not mounted and no date provided, return null or a skeleton to avoid mismatch
  if (!mounted && !date) {
    return <span className={className}>...</span>;
  }

  const finalDate = currentDate || date || new Date();
  
  const formatted = variant === 'full' 
    ? formatThaiDateFull(finalDate) 
    : formatThaiDate(finalDate);

  let dateTimeStr: string;
  if (typeof finalDate === 'string') {
    dateTimeStr = finalDate;
  } else if (finalDate instanceof Date) {
    dateTimeStr = finalDate.toISOString();
  } else {
    dateTimeStr = new Date().toISOString();
  }

  return (
    <time dateTime={dateTimeStr} className={className}>
      {formatted}
    </time>
  );
}
