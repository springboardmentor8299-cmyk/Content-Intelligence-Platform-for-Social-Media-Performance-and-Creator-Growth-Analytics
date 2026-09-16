import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-auto rounded-lg border border-border">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <thead className={cn('bg-background-secondary', className)}>{children}</thead>;
}

export function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={cn('divide-y divide-border', className)}>{children}</tbody>;
}

export function TableRow({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      className={cn(
        'bg-surface transition-colors',
        onClick && 'hover:bg-surface-hover cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-secondary',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-foreground', className)}>{children}</td>;
}
