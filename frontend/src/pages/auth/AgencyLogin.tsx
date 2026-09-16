import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Users, FileText, PieChart } from 'lucide-react';

export default function AgencyLogin() {
  const [email, setEmail] = useState('agency@creatoriq.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-12 bg-background">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">CreatorIQ</span>
              <p className="text-sm text-foreground-secondary">Agency Portal</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Agency Dashboard</h1>
          <p className="text-foreground-secondary mb-8">
            Manage all your creators from one powerful dashboard
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Input
              id="email"
              type="email"
              label="Agency Email"
              placeholder="agency@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              Sign In to Agency Portal
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            New agency?{' '}
            <Link to="/agency/signup" className="font-medium text-secondary hover:text-secondary-hover">
              Register your agency
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-foreground-muted text-center">Other portals:</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/creator/login" className="text-sm text-foreground-secondary hover:text-foreground">Creator</Link>
              <Link to="/marketing/login" className="text-sm text-foreground-secondary hover:text-foreground">Marketing</Link>
              <Link to="/admin/login" className="text-sm text-foreground-secondary hover:text-foreground">Admin</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-background-secondary p-12">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Manage Multiple Creators at Scale
          </h2>
          <p className="text-lg text-foreground-secondary mb-8">
            Track performance, compare creators, and generate reports for your entire roster from a single dashboard.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Multi-Creator Management</h3>
                <p className="text-sm text-foreground-secondary">All your talent in one view</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
                <PieChart className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Portfolio Analytics</h3>
                <p className="text-sm text-foreground-secondary">Compare and benchmark creators</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/20">
                <FileText className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Client Reports</h3>
                <p className="text-sm text-foreground-secondary">Professional branded exports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
