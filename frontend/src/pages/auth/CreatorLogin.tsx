import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Video, Music2, BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export default function CreatorLogin() {
  const [email, setEmail] = useState('creator@example.com');
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">CreatorIQ</span>
              <p className="text-sm text-foreground-secondary">Creator Portal</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Creator</h1>
          <p className="text-foreground-secondary mb-8">
            Sign in to track your content performance and grow your audience
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
              label="Email"
              placeholder="you@example.com"
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

            <Button type="submit" loading={loading} className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Sign In as Creator
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            New creator?{' '}
            <Link to="/creator/signup" className="font-medium text-primary hover:text-primary-hover">
              Create your account
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-foreground-muted text-center">Other portals:</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/agency/login" className="text-sm text-foreground-secondary hover:text-foreground">Agency</Link>
              <Link to="/marketing/login" className="text-sm text-foreground-secondary hover:text-foreground">Marketing</Link>
              <Link to="/admin/login" className="text-sm text-foreground-secondary hover:text-foreground">Admin</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-background-secondary p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 font-bold text-white text-xs">YT</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600 font-bold text-white text-xs">IG</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black font-bold text-white text-xs">TK</span>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Your Content,<br />Your Analytics,<br />Your Growth
          </h2>
          <p className="text-lg text-foreground-secondary mb-8">
            Track performance across YouTube, Instagram, TikTok, and more. Make data-driven decisions to grow your audience.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Multi-Platform Analytics</h3>
                <p className="text-sm text-foreground-secondary">All your metrics in one place</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/20">
                <TrendingUp className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Growth Insights</h3>
                <p className="text-sm text-foreground-secondary">Discover trends and opportunities</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Revenue Tracking</h3>
                <p className="text-sm text-foreground-secondary">Monitor all income streams</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
