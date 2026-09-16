import { useState, createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
}

export function Tabs({ defaultValue, children, className, onChange, onValueChange }: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={cn('flex flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-background-secondary p-1 gap-1',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onChange(value)}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer',
        isActive
          ? 'bg-surface text-foreground shadow-sm'
          : 'text-foreground-secondary hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return <div className={cn('mt-4', className)}>{children}</div>;
}
