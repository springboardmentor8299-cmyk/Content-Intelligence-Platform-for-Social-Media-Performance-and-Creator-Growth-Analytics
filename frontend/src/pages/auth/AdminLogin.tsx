import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Lock, AlertTriangle, Server, Settings, Users } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@creatoriq.com');
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">CreatorIQ</span>
              <p className="text-sm text-destructive font-medium">Admin Portal</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Administrator Access</h1>
          <p className="text-foreground-secondary mb-8">
            Secure access for system administrators only
          </p>

          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Restricted Access</p>
              <p className="text-xs text-foreground-secondary mt-1">
                This portal is for authorized administrators only. All access attempts are logged.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Input
              id="email"
              type="email"
              label="Admin Email"
              placeholder="admin@creatoriq.com"
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

            <Button type="submit" loading={loading} className="mt-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700">
              <Lock className="h-4 w-4 mr-2" />
              Secure Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-foreground-muted text-center">Other portals:</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/creator/login" className="text-sm text-foreground-secondary hover:text-foreground">Creator</Link>
              <Link to="/agency/login" className="text-sm text-foreground-secondary hover:text-foreground">Agency</Link>
              <Link to="/marketing/login" className="text-sm text-foreground-secondary hover:text-foreground">Marketing</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-red-600/20 via-rose-500/10 to-background-secondary p-12">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            System Administration
          </h2>
          <p className="text-lg text-foreground-secondary mb-8">
            Full control over the CreatorIQ platform. Manage users, monitor system health, and configure settings.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/20">
                <Users className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">User Management</h3>
                <p className="text-sm text-foreground-secondary">Manage all accounts and roles</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/20">
                <Server className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">System Monitoring</h3>
                <p className="text-sm text-foreground-secondary">Health checks and logs</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-surface/50 backdrop-blur p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/20">
                <Settings className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Platform Settings</h3>
                <p className="text-sm text-foreground-secondary">Configure system-wide options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
