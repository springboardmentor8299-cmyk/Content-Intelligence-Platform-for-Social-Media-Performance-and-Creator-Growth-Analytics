import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Check } from 'lucide-react';

const features = [
  'Unlimited content tracking',
  'Multi-platform analytics',
  'Audience demographics',
  'Revenue tracking',
  'Growth predictions',
  'Export reports'
];

export default function CreatorSignup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, 'creator');
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-foreground-secondary mb-6">
            We've set up your account for <strong>{email}</strong>. You can now access your creator dashboard.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Features */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-background-secondary p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">CreatorIQ</span>
              <p className="text-sm text-foreground-secondary">Creator Portal</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-foreground mb-6">
            Start Growing Your Content Empire
          </h2>
          <p className="text-lg text-foreground-secondary mb-8">
            Join thousands of creators using CreatorIQ to optimize their content strategy.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
                  <Check className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-12 bg-background">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Creator Account</h1>
          <p className="text-foreground-secondary mb-8">
            Start tracking your content performance today
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Input
              id="fullName"
              type="text"
              label="Full Name / Channel Name"
              placeholder="Your name or channel name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

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
              Create Creator Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Already have an account?{' '}
            <Link to="/creator/login" className="font-medium text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
