import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Briefcase, 
  Key, 
  Save, 
  X, 
  Check, 
  LogOut
} from 'lucide-react';
import { fetchUserProfile, updateAccountSettings } from '../api';

export default function AccountSettingsModal({ 
  isOpen, 
  onClose, 
  currentRole, 
  onRoleChange,
  currentUser,
  onLogout,
  onProfileUpdated
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    full_name: 'Raw Talks With VK',
    email: 'creator@creatoriq.io',
    bio: 'Host of Raw Talks With VK — in-depth Telugu conversations, podcast interviews, entrepreneurial journeys, and inspiring life stories.',
    niche: 'Podcast & In-Depth Conversations',
    website: 'https://rawtalkswithvk.com',
    agency_name: 'Apex Talent Media',
    new_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const res = await fetchUserProfile();
      const u = res.data;
      setProfileData(prev => ({
        ...prev,
        full_name: u.full_name || prev.full_name,
        email: u.email || prev.email,
        bio: u.profile?.bio || prev.bio,
        niche: u.profile?.niche || prev.niche,
        website: u.profile?.website || prev.website,
        agency_name: u.profile?.agency_name || prev.agency_name
      }));
    } catch (err) {
      console.warn("Using active profile fallback:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAccountSettings(profileData);
      setSavedSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated();
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile settings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Account Settings</h3>
              <p className="text-xs text-slate-500">Manage creator profile, role permissions, and credentials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-5 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Creator Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('agency')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'agency'
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Roles & Permissions</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1.5">Creator / Channel Name</label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1.5">Channel Niche & Format</label>
                <input
                  type="text"
                  value={profileData.niche}
                  onChange={(e) => setProfileData({ ...profileData, niche: e.target.value })}
                  placeholder="e.g. Telugu Podcast, Interviews, Entrepreneurship"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1.5">Channel Bio & Mission</label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1.5">Official Website URL</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1.5">Management Agency</label>
                  <input
                    type="text"
                    value={profileData.agency_name}
                    onChange={(e) => setProfileData({ ...profileData, agency_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition ml-auto cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          )}

          {activeTab === 'agency' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-900">Role-Based Access Control (RBAC)</div>
                  <p className="text-purple-700 mt-0.5">
                    Select any role to demonstrate role-specific privileges during your mentor review.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800">Switch Active Persona</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'creator', label: 'Creator', desc: 'Full channel control' },
                    { id: 'agency', label: 'Agency', desc: 'Roster management' },
                    { id: 'marketing_team', label: 'Marketing', desc: 'Campaign tracking' },
                    { id: 'admin', label: 'Admin', desc: 'Superuser access' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onRoleChange(r.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        currentRole === r.id
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold ring-1 ring-indigo-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="capitalize">{r.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">Change Account Password</div>
                <div>
                  <label className="text-slate-500 block mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={profileData.new_password}
                    onChange={(e) => setProfileData({ ...profileData, new_password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-900 transition cursor-pointer"
                >
                  Update Password
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-600">
                <div className="font-bold text-slate-800">JWT Authentication Status</div>
                <p className="text-[11px] text-slate-500">
                  Protected with industry standard JSON Web Tokens. Bearer token is verified on all API requests.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Sign Out */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600">
              Signed in as: <strong className="text-slate-900">{profileData.full_name}</strong> ({currentRole})
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onLogout) {
                onClose();
                onLogout();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
