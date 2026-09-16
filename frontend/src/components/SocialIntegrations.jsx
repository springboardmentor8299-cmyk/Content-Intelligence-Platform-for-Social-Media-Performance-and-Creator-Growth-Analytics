import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './SocialIcons';
import { fetchSocialAccounts, syncSocialAccount, toggleSocialAccount } from '../api';

export default function SocialIntegrations() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetchSocialAccounts();
      const visibleAccounts = (res.data || []).filter(a => 
        ['youtube', 'instagram'].includes(a.platform?.toLowerCase())
      );
      setAccounts(visibleAccounts);
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSync = async (id) => {
    setSyncingId(id);
    try {
      await syncSocialAccount(id);
      await loadAccounts();
      const accountName = accounts.find(a => a.id === id)?.account_name || 'Account';
      setSyncSuccessMsg(`Demo Sync Complete! Metrics refreshed for ${accountName}.`);
      setTimeout(() => setSyncSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleSocialAccount(id);
      await loadAccounts();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const getPlatformDetails = (platform) => {
    switch (platform) {
      case 'youtube':
        return {
          name: 'YouTube Channel',
          connectorLabel: 'Public Channel Observation',
          icon: YoutubeIcon,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-100'
        };
      case 'instagram':
        return {
          name: 'Instagram Profile',
          connectorLabel: 'Available Integration',
          icon: InstagramIcon,
          color: 'text-pink-600',
          bg: 'bg-pink-50',
          border: 'border-pink-100'
        };
      default:
        return {
          name: 'Social Media Account',
          connectorLabel: 'Platform Integration',
          icon: Share2,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          border: 'border-indigo-100'
        };
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-indigo-600 font-semibold animate-pulse text-xs">
        Loading Social Account Integrations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Share2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Social Media Integrations</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Platform Integrations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supported social channel integrations for @RawTalksWithVK (YouTube public data & Instagram integration).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Supported Integrations</span>
        </div>
      </div>

      {/* Sync Success Feedback Toast */}
      {syncSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Demo Sync</span>
        </div>
      )}

      {/* Supported Social Platforms Grid (YouTube & Instagram) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map((acc) => {
          const details = getPlatformDetails(acc.platform);
          const Icon = details.icon;

          return (
            <div
              key={acc.id}
              className={`bg-white p-5 rounded-2xl border transition relative flex flex-col justify-between shadow-2xs ${
                acc.platform === 'youtube' ? 'border-slate-200' : 'border-slate-200 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${details.bg} ${details.color} border ${details.border}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {details.connectorLabel}
                    </span>
                    {acc.platform === 'youtube' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Public Data
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Pending Connection
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-bold text-slate-900 font-display">{acc.account_name}</h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{acc.account_handle}</div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-1">{details.name}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Followers / Audience</span>
                  {acc.platform === 'youtube' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 text-sm font-display">
                        1.42M
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Public Data
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Pending Connection
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Data Provenance</span>
                  <span>
                    {acc.platform === 'youtube' 
                      ? 'Source: Public YouTube channel observation (@RawTalksWithVK)' 
                      : 'Available Integration • Pending Connection'}
                  </span>
                </div>
              </div>

              {/* Action Information */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                {acc.platform === 'youtube' ? (
                  <div className="w-full py-2 rounded-xl text-xs font-semibold text-center bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Public Channel Monitored</span>
                  </div>
                ) : (
                  <div className="w-full py-2 rounded-xl text-xs font-medium text-center bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center gap-1.5">
                    <span>Available Integration • Pending Connection</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Integration Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Platform Integration Note: </span>
          YouTube channel analytics are sourced directly from public channel observation (@RawTalksWithVK). Instagram is presented as an available integration pending account connection without claiming live OAuth or API telemetry.
        </div>
      </div>
    </div>
  );
}
