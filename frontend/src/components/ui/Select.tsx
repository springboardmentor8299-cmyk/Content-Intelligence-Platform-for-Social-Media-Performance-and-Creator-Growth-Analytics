import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border border-border bg-input px-3 pr-10 text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:ring-destructive',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-surface text-foreground">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted pointer-events-none" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
