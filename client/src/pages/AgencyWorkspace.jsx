import React, { useState, useEffect } from 'react';
import client from '../api/client';
import MetricCard from '../components/common/MetricCard';
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  Award, 
  CheckCircle2 
} from 'lucide-react';

const AgencyWorkspace = () => {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/api/v1/revenue/agency/roster')
      .then((res) => setRoster(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const totalRosterRevenue = roster.reduce((acc, c) => acc + c.monthly_revenue, 0);
  const totalCommission = roster.reduce((acc, c) => acc + (c.monthly_revenue * (c.commission_pct / 100)), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold mb-2 border border-pink-500/20">
          <Briefcase className="h-3.5 w-3.5" />
          Agency RBAC Workspace
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Influencer Agency Roster & Commissions</h1>
        <p className="text-xs text-slate-400 mt-1">Multi-creator client roster management, contract fees, and commission attribution</p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Total Managed Creator Roster"
          value={roster.length.toString()}
          change="4 VIP Creators"
          isPositive={true}
          icon={Users}
          color="indigo"
          subtitle="Signed exclusive talent"
        />
        <MetricCard
          title="Roster Gross Monthly Volume"
          value={`$${totalRosterRevenue.toLocaleString()}`}
          change="+16.8% MoM"
          isPositive={true}
          icon={DollarSign}
          color="emerald"
          subtitle="Total brand spend & earnings"
        />
        <MetricCard
          title="Agency Monthly Commission"
          value={`$${Math.round(totalCommission).toLocaleString()}`}
          change="Avg 17% commission cut"
          isPositive={true}
          icon={Award}
          color="amber"
          subtitle="Net Agency Revenue"
        />
      </div>

      {/* Roster Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-base font-bold text-white tracking-tight">Managed Talent Roster</h3>
          <span className="text-xs text-slate-500">{roster.length} Signed Creators</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-4">Creator / Client</th>
                <th className="px-6 py-4">Primary Handle</th>
                <th className="px-6 py-4">Talent Tier</th>
                <th className="px-6 py-4 text-right">Monthly Reach (Views)</th>
                <th className="px-6 py-4 text-right">Monthly Billings</th>
                <th className="px-6 py-4 text-right">Agency Fee (%)</th>
                <th className="px-6 py-4 text-right">Agency Net</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {roster.map((client) => {
                const commissionVal = client.monthly_revenue * (client.commission_pct / 100);
                return (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.channel_handle}`}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full bg-slate-800 border border-white/10"
                      />
                      <span>{client.client_name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-400">{client.channel_handle}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                        {client.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white">
                      {client.monthly_views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ${client.monthly_revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-400">
                      {client.commission_pct}%
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      ${Math.round(commissionVal).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        {client.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgencyWorkspace;
