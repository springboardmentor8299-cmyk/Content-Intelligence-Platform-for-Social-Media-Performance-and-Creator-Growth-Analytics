import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

export function Progress({ value, max = 100, className, color = 'primary' }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive'
  };

  return (
    <div className={cn('h-2 w-full rounded-full bg-muted overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', colors[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
