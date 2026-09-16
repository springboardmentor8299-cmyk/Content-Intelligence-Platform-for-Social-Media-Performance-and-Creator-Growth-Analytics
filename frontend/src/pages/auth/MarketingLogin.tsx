import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Target, Users, Megaphone, LineChart } from 'lucide-react';

export default function MarketingLogin() {
  const [email, setEmail] = useState('marketing@brand.com');
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">CreatorIQ</span>
              <p className="text-sm text-foreground-secondary">Marketing Portal</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Marketing Team Access</h1>
          <p className="text-foreground-secondary mb-8">
            Track campaign performance and influencer partnerships
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
              label="Work Email"
              placeholder="you@company.com"
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

            <Button type="submit" loading={loading} className="mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              Sign In to Marketing Portal
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            New marketing team?{' '}
            <Link to="/marketing/signup" className="font-medium text-warning hover:opacity-80">
              Create team account
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-foreground-muted text-center">Other portals:</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/creator/login" className="text-sm text-foreground-secondary hover:text-foreground">Creator</Link>
              <Link to="/agency/login" className="text-sm text-foreground-secondary hover:text-foreground">Agency</Link>
              <Link to="/admin/login" className="text-sm text-foreground-secondary hover:text-foreground">Admin</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-orange-600/20 via-amber-500/10 to-background-secondary p-12">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Data-Driven Influencer Marketing
          </h2>
          <p className="text-lg text-foreground-secondary mb-8">
            Track ROI, measure campaign performance, and make informed decisions about creator partnerships.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20">
                <Megaphone className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Campaign Tracking</h3>
                <p className="text-sm text-foreground-secondary">Monitor all influencer campaigns</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                <LineChart className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ROI Analytics</h3>
                <p className="text-sm text-foreground-secondary">Measure campaign effectiveness</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/20">
                <Users className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Creator Discovery</h3>
                <p className="text-sm text-foreground-secondary">Find the right influencers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
