import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Target,
  Megaphone,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Download,
  RefreshCw,
  Star,
  CheckCircle,
  Search,
  ExternalLink,
  X,
  Send,
  MailCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MarketingDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'campaigns' | 'discovery' | 'safety' | null;
  const [activeTab, setActiveTab] = useState<'campaigns' | 'discovery' | 'safety'>(tabParam || 'campaigns');

  useEffect(() => {
    if (tabParam && (tabParam === 'campaigns' || tabParam === 'discovery' || tabParam === 'safety')) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'campaigns' | 'discovery' | 'safety') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [data, setData] = useState<any>(null);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invitation Modal State
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [offeredRate, setOfferedRate] = useState<number>(2500);
  const [deliverables, setDeliverables] = useState<string>('1 Dedicated 60s Video Integration + 2 Social Posts');
  const [customMessage, setCustomMessage] = useState<string>('We love your content and would be thrilled to sponsor an integration for our upcoming brand campaign.');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      const [campRes, discRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/monetization/campaigns'),
        fetch('http://localhost:8000/api/v1/monetization/discovery'),
      ]);
      if (campRes.ok) {
        const campData = await campRes.json();
        setData(campData);
        if (campData?.campaigns?.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(campData.campaigns[0].id);
        }
      }
      if (discRes.ok) setCreators(await discRes.json());
    } catch (err) {
      console.error('Failed to load marketing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary;
  const campaigns = data?.campaigns || [];

  const handleOpenInvite = (creator: any) => {
    setSelectedCreator(creator);
    // Parse suggested rate if available (e.g. "$2,500 / integration")
    const numericRate = parseInt(creator.suggested_rate?.replace(/[^0-9]/g, '')) || 2500;
    setOfferedRate(numericRate);
    if (campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
    setInviteSuccess(null);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator || !selectedCampaignId) return;

    setInviting(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/monetization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: selectedCreator.id,
          campaign_id: selectedCampaignId,
          offered_rate: Number(offeredRate),
          deliverables: deliverables,
          message: customMessage,
        }),
      });

      if (res.ok) {
        const respData = await res.json();
        setInviteSuccess(respData.message || `Invitation sent to ${selectedCreator.name}!`);
        
        // Update local creator state
        setCreators(prev => prev.map(c => c.id === selectedCreator.id ? { ...c, invited: true } : c));
        
        // Refresh campaign metrics to reflect updated allocated spend
        fetchMarketingData();

        setTimeout(() => {
          setSelectedCreator(null);
          setInviteSuccess(null);
        }, 2200);
      }
    } catch (err) {
      console.error('Failed to send invitation:', err);
    } finally {
      setInviting(false);
    }
  };

  return (
    <DashboardLayout
      title="Marketing & Brand Portal"
      subtitle="Influencer campaign ROI tracking, brand safety auditing, and creator sponsorship discovery."
      headerActions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMarketingData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => handleTabChange('campaigns')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors">
            <Megaphone className="h-4 w-4" />
            Launch Campaign
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Marketing KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Campaigns</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{summary?.active_campaigns_count || 2}</span>
              <span className="text-xs font-semibold text-amber-600">In Flight</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Total sponsored creator flights</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ad Spend / Budget</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ${summary?.total_spend ? (summary.total_spend / 1000).toFixed(1) : '62.5'}K
              </span>
              <span className="text-xs font-medium text-gray-500">
                / ${summary?.total_budget ? (summary.total_budget / 1000).toFixed(1) : '75.0'}K
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">83.3% allocated budget spent</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aggregate Impressions</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {summary?.total_impressions ? `${(summary.total_impressions / 1000000).toFixed(2)}M` : '5.15M'}
              </span>
              <span className="text-xs font-semibold text-emerald-600">+31.2% Reach</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Verified video & reel impressions</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Campaign ROI</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Star className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{summary?.avg_roi_multiplier || 3.63}x</span>
              <span className="text-xs font-semibold text-emerald-600">High Return</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Attributed direct sales & signups</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('campaigns')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Campaigns & Attributed ROI
          </button>
          <button
            onClick={() => handleTabChange('discovery')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'discovery'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Influencer Discovery & Match
          </button>
          <button
            onClick={() => handleTabChange('safety')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'safety'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Brand Safety & Compliance
          </button>
        </div>

        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-bold text-gray-900 mb-1">Campaign ROI Comparison</h3>
              <p className="text-xs text-gray-500 mb-6">Attributed revenue multiplier relative to total sponsor ad spend.</p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaigns} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="title" stroke="#888888" fontSize={12} tickLine={false} />
                    <YAxis stroke="#d97706" fontSize={12} tickLine={false} unit="x" />
                    <Tooltip />
                    <Bar dataKey="roi_multiplier" name="ROI Multiplier" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Active Brand Collaborations</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Real-time tracking of sponsored content deliverables and conversion funnels.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider font-semibold border-b">
                    <tr>
                      <th className="px-5 py-3">Campaign</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Budget / Spend</th>
                      <th className="px-4 py-3">Impressions</th>
                      <th className="px-4 py-3">Clicks</th>
                      <th className="px-4 py-3">Conversions</th>
                      <th className="px-4 py-3">ROI</th>
                      <th className="px-4 py-3">Safety Score</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {campaigns.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-900">{c.title}</p>
                          <p className="text-xs text-gray-400">Creators: {c.target_creators.join(', ')}</p>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-800">{c.brand}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-900">${c.spend.toLocaleString()}</span>
                          <span className="text-xs text-gray-400"> / ${c.budget.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-700">{(c.impressions / 1000).toFixed(0)}K</td>
                        <td className="px-4 py-3.5 text-gray-600">{c.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900">{c.conversions.toLocaleString()}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                            {c.roi_multiplier}x
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="h-3 w-3" />
                            {c.brand_safety_score}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            c.status === 'Active'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Discovery */}
        {activeTab === 'discovery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {creators.map((cr: any) => (
              <div key={cr.id} className="bg-white rounded-xl border p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={cr.avatar} alt={cr.name} className="h-12 w-12 rounded-full object-cover border" />
                      <div>
                        <h4 className="font-bold text-gray-900">{cr.name}</h4>
                        <p className="text-xs text-gray-400">{cr.handle}</p>
                        <span className="inline-block mt-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {cr.niche}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                      {cr.match_score} Match
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Followers</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{cr.followers}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Avg ER</p>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">{cr.engagement}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Brand Safety</p>
                      <p className="text-sm font-bold text-blue-600 mt-0.5">{cr.brand_safety}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">{cr.suggested_rate}</span>
                  {cr.invited ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="h-3.5 w-3.5" /> Invited
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenInvite(cr)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                    >
                      Invite to Campaign
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Brand Safety */}
        {activeTab === 'safety' && (
          <div className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Brand Safety & Compliance Audit</h3>
                <p className="text-xs text-gray-500">Automated content toxicity, sentiment analysis, and regulatory FTC disclosure check.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-500 uppercase">FTC Sponsorship Disclosure</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">100%</p>
                <p className="text-xs text-gray-500 mt-1">All video integrations include '#ad' or paid partnership badges.</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-500 uppercase">Sentiment Positivity</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">94.8%</p>
                <p className="text-xs text-gray-500 mt-1">Audience comment sentiment towards sponsor integrations.</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-500 uppercase">Copyright & Music Licensing</p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">Clean</p>
                <p className="text-xs text-gray-500 mt-1">Zero copyright strikes or claims across all live campaign assets.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Invite Creator to Campaign */}
        {selectedCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 relative">
              <button
                onClick={() => setSelectedCreator(null)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-5">
                <img
                  src={selectedCreator.avatar}
                  alt={selectedCreator.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-amber-200"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Invite {selectedCreator.name}</h3>
                  <p className="text-xs text-gray-500">{selectedCreator.handle} • {selectedCreator.niche}</p>
                </div>
              </div>

              {inviteSuccess ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center my-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-3">
                    <MailCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">Invitation Dispatched!</h4>
                  <p className="text-sm text-emerald-700 mt-1">{inviteSuccess}</p>
                  <p className="text-xs text-emerald-600 mt-2">Creator will receive this proposal in their deal pipeline.</p>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                      Select Target Campaign
                    </label>
                    <select
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                      required
                    >
                      {campaigns.map((camp: any) => (
                        <option key={camp.id} value={camp.id}>
                          {camp.title} ({camp.brand})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                        Offered Rate ($)
                      </label>
                      <input
                        type="number"
                        value={offeredRate}
                        onChange={(e) => setOfferedRate(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        placeholder="2500"
                        required
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Suggested: {selectedCreator.suggested_rate}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                        Match Score
                      </label>
                      <div className="flex items-center h-[38px] px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
                        {selectedCreator.match_score} Compatibility
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                      Deliverables & Scope
                    </label>
                    <input
                      type="text"
                      value={deliverables}
                      onChange={(e) => setDeliverables(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="e.g. 1 Dedicated Video + 2 YouTube Shorts"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                      Personalized Pitch Message
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="Add specific instructions or briefing notes for the creator..."
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSelectedCreator(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviting}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow transition-colors disabled:opacity-50"
                    >
                      {inviting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Campaign Invite
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
