import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message || 'Invalid email or password.');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    const { error: err } = await signIn('demo@creatoriq.com', 'demo1234');
    setLoading(false);
    if (!err) navigate('/dashboard');
    else setError(err.message);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#f8f9ff' }}>
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1d4ed8' }}>CreatorIQ</h1>
        <p className="text-sm" style={{ color: '#737686' }}>Enterprise Analytics Platform</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8"
        style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-xl font-bold text-center mb-6" style={{ color: '#0b1c30' }}>
          Sign In to Your Account
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0b1c30' }}>
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94a3b8' }} />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                style={{ borderColor: 'var(--color-border)', color: '#0b1c30' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium" style={{ color: '#0b1c30' }}>Password</label>
              <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                style={{ borderColor: 'var(--color-border)', color: '#0b1c30' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                style={{ color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-blue-600"
            />
            <span className="text-sm" style={{ color: '#434655' }}>Remember me for 30 days</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign In
          </button>
        </form>

        {/* Demo */}
        <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>No account? Try the demo</p>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors"
            style={{ borderColor: 'var(--color-border)', color: '#434655' }}
          >
            Enter Demo Mode
          </button>
        </div>

        {/* Sign up */}
        <p className="text-center mt-4 text-sm" style={{ color: '#737686' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>

      {/* Portal links */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
        <Link to="/creator/login" className="hover:text-blue-600 transition-colors">Creator Portal</Link>
        <span>•</span>
        <Link to="/agency/login" className="hover:text-blue-600 transition-colors">Agency Portal</Link>
        <span>•</span>
        <Link to="/marketing/login" className="hover:text-blue-600 transition-colors">Marketing Portal</Link>
        <span>•</span>
        <Link to="/admin/login" className="hover:text-blue-600 transition-colors">Admin</Link>
      </div>
    </div>
  );
}
