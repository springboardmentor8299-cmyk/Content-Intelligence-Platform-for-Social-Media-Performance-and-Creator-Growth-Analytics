import { NavLink, useLocation, useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  BarChart2,
  Users,
  DollarSign,
  Share2,
  Bell,
  Settings,
  Sparkles,
  LogOut,
  Target,
  Shield,
  Server
} from 'lucide-react';

const CREATOR_NAV = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Content', href: '/content', icon: BarChart2 },
  { name: 'Audience', href: '/audience', icon: Users },
  { name: 'Revenue', href: '/revenue', icon: DollarSign },
  { name: 'Social Integration', href: '/connections', icon: Share2 },
  { name: 'Notifications & Reports', href: '/notifications', icon: Bell },
];

const AGENCY_NAV = [
  { name: 'Roster Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Talent Roster', href: '/dashboard?tab=roster', icon: Users },
  { name: 'Benchmarking', href: '/dashboard?tab=benchmarks', icon: BarChart2 },
  { name: 'Financial Payouts', href: '/dashboard?tab=payouts', icon: DollarSign },
  { name: 'Notifications & Alerts', href: '/notifications', icon: Bell },
];

const MARKETING_NAV = [
  { name: 'Campaigns & ROI', href: '/dashboard?tab=campaigns', icon: Target },
  { name: 'Influencer Discovery', href: '/dashboard?tab=discovery', icon: Sparkles },
  { name: 'Brand Safety Audit', href: '/dashboard?tab=safety', icon: Shield },
  { name: 'Audience Demographics', href: '/audience', icon: Users },
  { name: 'Notifications & Alerts', href: '/notifications', icon: Bell },
];

const ADMIN_NAV = [
  { name: 'System Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/dashboard?tab=users', icon: Users },
  { name: 'API Quotas & Health', href: '/dashboard?tab=health', icon: Server },
  { name: 'Security Audit Logs', href: '/dashboard?tab=audit', icon: Shield },
  { name: 'Notifications & Alerts', href: '/notifications', icon: Bell },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = profile?.role || 'creator';

  const navItems = role === 'agency'
    ? AGENCY_NAV
    : role === 'marketing_team'
    ? MARKETING_NAV
    : role === 'admin'
    ? ADMIN_NAV
    : CREATOR_NAV;

  const roleTheme = role === 'agency'
    ? { name: 'Agency Portal', color: 'bg-cyan-600', activeIndicator: 'bg-cyan-500' }
    : role === 'marketing_team'
    ? { name: 'Marketing Portal', color: 'bg-amber-600', activeIndicator: 'bg-amber-500' }
    : role === 'admin'
    ? { name: 'Admin Portal', color: 'bg-red-600', activeIndicator: 'bg-red-500' }
    : { name: 'Creator Portal', color: 'bg-blue-600', activeIndicator: 'bg-blue-500' };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const currentFullUrl = location.pathname + (location.search || '');

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col"
      style={{ background: 'var(--color-sidebar-bg)' }}>
      
      {/* Logo */}
      <div className="flex h-[64px] items-center gap-3 px-5 border-b" style={{ borderColor: 'var(--color-sidebar-border)' }}>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${roleTheme.color} flex-shrink-0 shadow`}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-[15px] leading-tight">CreatorIQ</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400">
            {roleTheme.name}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item, idx) => {
            const isExactMatch = currentFullUrl === item.href;
            const isDefaultDashboard = (item.href === '/dashboard' || item.href === '/dashboard?tab=users' || item.href === '/dashboard?tab=roster' || item.href === '/dashboard?tab=campaigns') && 
              location.pathname === '/dashboard' && !location.search && idx <= 1;
            const isActive = isExactMatch || (isDefaultDashboard && idx === 0);

            return (
              <li key={`${item.name}-${idx}`} className="relative">
                {isActive && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 ${roleTheme.activeIndicator} rounded-r-full`} />
                )}
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors relative',
                    isActive
                      ? 'text-white'
                      : 'hover:text-white'
                  )}
                  style={{
                    color: isActive ? '#ffffff' : 'var(--color-sidebar-text)',
                    background: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-sidebar-hover-bg)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="py-4 px-3 border-t" style={{ borderColor: 'var(--color-sidebar-border)' }}>
        <ul className="flex flex-col gap-0.5">
          <li>
            <NavLink
              to="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors"
              style={{ color: 'var(--color-sidebar-text)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
                (e.currentTarget as HTMLElement).style.background = 'var(--color-sidebar-hover-bg)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-sidebar-text)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Settings className="h-[18px] w-[18px] flex-shrink-0" />
              <span>Settings</span>
            </NavLink>
          </li>
          
          {/* Sign Out Button */}
          <li>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors text-red-400 hover:text-red-300 hover:bg-red-950/30 text-left"
            >
              <LogOut className="h-[18px] w-[18px] flex-shrink-0 text-red-400" />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
