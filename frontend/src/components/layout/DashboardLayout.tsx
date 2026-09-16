import { type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

export function DashboardLayout({ children, title, subtitle, headerActions }: DashboardLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Sidebar />
      <div className="flex-1 pl-[240px]">
        <Header title={title} subtitle={subtitle} />
        <main className="p-6">
          {/* Page header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm" style={{ color: 'var(--color-foreground-muted)' }}>{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-3 flex-shrink-0 ml-6">{headerActions}</div>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
