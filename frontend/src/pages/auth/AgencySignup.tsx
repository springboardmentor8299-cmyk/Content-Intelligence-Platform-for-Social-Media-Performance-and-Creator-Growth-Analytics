import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Check } from 'lucide-react';

const features = [
  'Manage unlimited creators',
  'Portfolio-wide analytics',
  'Bulk report generation',
  'Team collaboration',
  'White-label reports',
  'Priority support'
];

export default function AgencySignup() {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
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

    const { error } = await signUp(email, password, `${fullName} (${companyName})`, 'agency');
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Agency Account Created</h1>
          <p className="text-foreground-secondary mb-6">
            We've set up your agency workspace for <strong>{email}</strong>.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Features */}
      <div className="hidden lg:flex flex-1 flex-col justify-center bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-background-secondary p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">CreatorIQ</span>
              <p className="text-sm text-foreground-secondary">Agency Portal</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-foreground mb-6">
            Scale Your Creator Business
          </h2>
          <p className="text-lg text-foreground-secondary mb-8">
            The complete analytics platform for influencer agencies and talent managers.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
                  <Check className="h-4 w-4 text-blue-400" />
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Register Your Agency</h1>
          <p className="text-foreground-secondary mb-8">
            Get started with multi-creator management
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Input
              id="companyName"
              type="text"
              label="Agency / Company Name"
              placeholder="Your Agency Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            <Input
              id="fullName"
              type="text"
              label="Your Name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              id="email"
              type="email"
              label="Business Email"
              placeholder="you@agency.com"
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
              Create Agency Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground-secondary">
            Already registered?{' '}
            <Link to="/agency/login" className="font-medium text-secondary hover:text-secondary-hover">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
