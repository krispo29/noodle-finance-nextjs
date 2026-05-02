'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

/**
 * Backward-compatible loading component that renders skeleton shapes.
 */
export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  text 
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'h-4 w-24',
    md: 'h-8 w-40',
    lg: 'h-12 w-56',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className={`${sizeMap[size]} animate-pulse rounded-md bg-muted`} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
