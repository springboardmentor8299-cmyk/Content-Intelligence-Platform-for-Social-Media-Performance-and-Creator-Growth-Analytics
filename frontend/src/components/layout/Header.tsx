import { Bell, Grid3x3, Search, ChevronDown, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const displayName = profile?.full_name || 'Creator Account';
  const displayRole = profile?.role ? profile.role.toUpperCase() : 'CREATOR';
  const displayEmail = profile?.email || 'user@creatoriq.com';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center gap-4 border-b bg-white px-6"
      style={{ borderColor: 'var(--color-border)' }}>
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-foreground-muted)' }} />
          <input
            type="text"
            placeholder="Search analytics, creators, or content..."
            className="w-full h-9 pl-9 pr-4 text-sm rounded-full border outline-none focus:ring-2 focus:ring-blue-200"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-background)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" style={{ color: 'var(--color-foreground-secondary)' }} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
        </Link>

        {/* Divider */}
        <div className="h-6 w-px" style={{ background: 'var(--color-border)' }} />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full hover:bg-gray-100 transition-colors px-2 py-1 focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white overflow-hidden shadow-sm">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                : displayName.charAt(0).toUpperCase()
              }
            </div>
            <span className="text-sm font-medium hidden sm:block text-gray-800">
              {displayName}
            </span>
            <ChevronDown className={`h-4 w-4 hidden sm:block text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border z-50 overflow-hidden py-1"
              style={{ borderColor: 'var(--color-border)' }}>
              <div className="px-4 py-3 border-b bg-gray-50/70" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  profile?.role === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : profile?.role === 'agency'
                    ? 'bg-cyan-100 text-cyan-800'
                    : profile?.role === 'marketing_team'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {displayRole}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <SettingsIcon className="h-4 w-4 text-gray-500" />
                  Account Settings
                </Link>
                <Link
                  to="/connections"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  Social Integrations
                </Link>
              </div>

              <div className="border-t py-1" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  Sign Out Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom actions (date picker, export button) */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
