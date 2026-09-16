import { type ReactNode } from 'react';
import { cn, formatNumber, formatPercent } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  format?: 'number' | 'currency' | 'percent' | 'none';
  className?: string;
}

export function MetricCard({ title, value, change, icon, format = 'none', className }: MetricCardProps) {
  const formattedValue =
    format === 'number' && typeof value === 'number'
      ? formatNumber(value)
      : format === 'currency' && typeof value === 'number'
      ? `$${formatNumber(value)}`
      : format === 'percent' && typeof value === 'number'
      ? `${value}%`
      : value;

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn('rounded-xl border border-border bg-surface p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground-secondary">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{formattedValue}</p>
          {change !== undefined && (
            <div
              className={cn(
                'mt-2 flex items-center gap-1 text-sm font-medium',
                isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{formatPercent(change)}</span>
              <span className="text-foreground-muted font-normal">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
