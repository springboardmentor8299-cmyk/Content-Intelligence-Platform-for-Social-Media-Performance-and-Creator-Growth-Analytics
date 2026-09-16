import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';

const tabs = [
  { id: 'general', label: 'General', icon: '👤' },
  { id: 'security', label: 'Security', icon: '🛡' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'billing', label: 'Billing', icon: '💳' },
];

export default function Settings() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [bio, setBio] = useState('Senior Analytics Director specializing in enterprise creator campaign performance and ROI modeling.');
  const [displayName, setDisplayName] = useState(profile?.full_name || 'Jane Doe');
  const [email, setEmail] = useState(profile?.email || 'jane.doe@creatoriq.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <DashboardLayout
      title="Account Settings"
      subtitle="Manage your profile, security preferences, and billing information."
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left tabs nav */}
        <div className="md:w-56 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
                style={{ color: activeTab === tab.id ? undefined : 'var(--color-foreground-secondary)' }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out Account
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border shadow-sm"
          style={{ borderColor: 'var(--color-border)' }}>
          {activeTab === 'general' && (
            <div className="p-6">
              <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--color-foreground)' }}>
                Profile Information
              </h3>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex gap-3 mb-2">
                    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                      Upload new avatar
                    </button>
                    <button className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>
                      Remove
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-foreground-muted)' }}>
                    JPG, GIF or PNG. Max size of 800K.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                />
                <div className="text-right text-xs mt-1" style={{ color: 'var(--color-foreground-muted)' }}>
                  {bio.length} / 500
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out of this Account
                </button>

                <button
                  onClick={handleSave}
                  className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-colors ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--color-foreground)' }}>Security Settings</h3>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: 'var(--color-border)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: 'var(--color-border)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    style={{ borderColor: 'var(--color-border)' }} />
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: `1px solid var(--color-border)` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Two-Factor Authentication</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>Add an extra layer of security to your account</div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Enable 2FA</button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Update Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6">
              <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--color-foreground)' }}>Notification Preferences</h3>
              <p className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
                Manage your notification settings in the <a href="/notifications" className="text-blue-600 hover:underline">Notification Center</a>.
              </p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="p-6">
              <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--color-foreground)' }}>Billing & Subscription</h3>
              <div className="p-5 rounded-xl border mb-5"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-blue-700">Enterprise Plan</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>Renews on December 1, 2024</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Active</span>
                </div>
                <div className="mt-4 text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>$2,400 <span className="text-base font-normal" style={{ color: 'var(--color-foreground-muted)' }}>/yr</span></div>
              </div>
              <button className="px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>
                Manage Subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
