import { Link, Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Link2,
  FileText,
  ArrowRight,
  Check,
  Play
} from 'lucide-react';

// Platform icon colors since lucide-react doesn't export social platform icons
const platformIcons = [
  { name: 'YouTube', color: '#ff0000', initial: 'YT' },
  { name: 'Instagram', color: '#e4405f', initial: 'IG' },
  { name: 'TikTok', color: '#010101', initial: 'TK' },
  { name: 'Twitter/X', color: '#1da1f2', initial: 'X' },
  { name: 'Facebook', color: '#1877f2', initial: 'FB' },
  { name: 'LinkedIn', color: '#0a66c2', initial: 'LI' },
];

const features = [
  {
    icon: BarChart3,
    title: 'Content Analytics',
    description: 'Track views, engagement, and performance across all your content with detailed metrics and insights.'
  },
  {
    icon: Users,
    title: 'Audience Insights',
    description: 'Understand your audience demographics, behavior patterns, and engagement trends.'
  },
  {
    icon: TrendingUp,
    title: 'Growth Tracking',
    description: 'Monitor follower growth, identify trends, and predict future performance.'
  },
  {
    icon: DollarSign,
    title: 'Revenue Management',
    description: 'Track sponsorships, ad revenue, affiliates, and all your income streams in one place.'
  },
  {
    icon: Link2,
    title: 'Multi-Platform',
    description: 'Connect YouTube, Instagram, TikTok, Twitter, and more for unified analytics.'
  },
  {
    icon: FileText,
    title: 'Custom Reports',
    description: 'Generate professional reports for sponsors and export data in PDF, Excel, or CSV.'
  }
];

const stats = [
  { value: '10K+', label: 'Active Creators' },
  { value: '50M+', label: 'Content Tracked' },
  { value: '98%', label: 'Accuracy' },
  { value: '6', label: 'Platforms Supported' }
];

const platforms = [
  { name: 'YouTube', color: '#ff0000', initial: 'YT' },
  { name: 'Instagram', color: '#e4405f', initial: 'IG' },
  { name: 'TikTok', color: '#010101', initial: 'TK' },
  { name: 'Twitter/X', color: '#1da1f2', initial: 'X' },
  { name: 'Facebook', color: '#1877f2', initial: 'FB' },
  { name: 'LinkedIn', color: '#0a66c2', initial: 'LI' },
];

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CreatorIQ</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              The #1 Analytics Platform for Creators
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Track, Analyze, and Grow Your{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Content Empire
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground-secondary mb-8 max-w-2xl mx-auto text-pretty">
              Get comprehensive insights into your content performance across all platforms. Make data-driven decisions to accelerate your growth and maximize your revenue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="text-base px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/creator/login">
                <Button variant="outline" size="lg" className="text-base px-8">
                  <Play className="mr-2 h-5 w-5" />
                  Live Preview
                </Button>
              </Link>
            </div>
          </div>

          {/* Platform Icons */}
          <div className="mt-16 flex items-center justify-center gap-8 flex-wrap">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center gap-2" style={{ color: 'var(--color-foreground-muted)' }}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: platform.color }}>
                  {platform.initial}
                </span>
                <span className="text-sm font-medium">{platform.name}</span>
              </div>
            ))}
          </div>

          {/* Interactive UI Mockup Hero */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur p-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-background-secondary border border-border">
                  <p className="text-xs text-foreground-muted">Total Audience</p>
                  <p className="text-2xl font-bold text-foreground mt-1">2.44M</p>
                  <span className="text-xs text-success font-medium">+12.3% this month</span>
                </div>
                <div className="p-4 rounded-xl bg-background-secondary border border-border">
                  <p className="text-xs text-foreground-muted">Total Views</p>
                  <p className="text-2xl font-bold text-foreground mt-1">15.68M</p>
                  <span className="text-xs text-success font-medium">+8.7% this month</span>
                </div>
                <div className="p-4 rounded-xl bg-background-secondary border border-border">
                  <p className="text-xs text-foreground-muted">Avg Engagement</p>
                  <p className="text-2xl font-bold text-foreground mt-1">8.2%</p>
                  <span className="text-xs text-success font-medium">+0.4% this month</span>
                </div>
                <div className="p-4 rounded-xl bg-background-secondary border border-border">
                  <p className="text-xs text-foreground-muted">Est. Revenue</p>
                  <p className="text-2xl font-bold text-foreground mt-1">$12,450</p>
                  <span className="text-xs text-success font-medium">+23.1% this month</span>
                </div>
              </div>
              <div className="h-48 rounded-xl bg-background-secondary/50 border border-border flex items-center justify-center text-foreground-secondary text-sm">
                <span>Unified Multi-Platform Analytics Engine Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                <p className="text-foreground-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
              Powerful analytics tools designed specifically for content creators, influencers, and agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-border bg-surface hover:border-primary/50 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background-secondary to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Take Your Content to the Next Level?
          </h2>
          <p className="text-lg text-foreground-secondary mb-8">
            Join thousands of creators who trust CreatorIQ to power their analytics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-foreground-secondary">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              Free 14-day trial
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">CreatorIQ</span>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2026 CreatorIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
