import { Link, Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Video, Building2, Target, ArrowRight, Check } from 'lucide-react';

const portals = [
  {
    id: 'creator',
    title: 'Creator',
    description: 'Track your content performance across all platforms',
    icon: Video,
    href: '/creator/signup',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Multi-platform analytics', 'Audience insights', 'Revenue tracking']
  },
  {
    id: 'agency',
    title: 'Agency',
    description: 'Manage and track multiple creator accounts',
    icon: Building2,
    href: '/agency/signup',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Multi-creator management', 'Portfolio analytics', 'Client reports']
  },
  {
    id: 'marketing',
    title: 'Marketing Team',
    description: 'Track influencer campaigns and ROI',
    icon: Target,
    href: '/marketing/signup',
    gradient: 'from-orange-500 to-amber-500',
    features: ['Campaign tracking', 'ROI measurement', 'Creator discovery']
  }
];

export default function Signup() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center gap-3 w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">CreatorIQ</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Create Your Account</h1>
            <p className="text-lg text-foreground-secondary">
              Choose the account type that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portals.map((portal) => (
              <Link
                key={portal.id}
                to={portal.href}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-transparent hover:shadow-xl flex flex-col"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative flex-1">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${portal.gradient} mb-4`}>
                    <portal.icon className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">{portal.title}</h2>
                  <p className="text-foreground-secondary mb-4">{portal.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {portal.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground-secondary">
                        <Check className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r ${portal.gradient} text-white font-medium text-sm transition-transform group-hover:scale-[1.02]`}>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-foreground-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
