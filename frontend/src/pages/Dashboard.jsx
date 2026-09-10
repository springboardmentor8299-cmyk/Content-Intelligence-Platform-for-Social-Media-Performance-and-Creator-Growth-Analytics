import {
  Users,
  DollarSign,
  TrendingUp,
  Eye,
} from "lucide-react";

import KpiCard from "../components/KpiCard";
import AnalyticsChart from "../components/AnalyticsChart";
import { analyticsData } from "../data/analyticsData";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              CREATORIQ ANALYTICS
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome back, Creator 👋
            </h1>

            <p className="mt-2 text-slate-400">
              Track your creator performance across all platforms.
            </p>
          </div>

          <a
            href="/integrations"
            className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 text-center font-semibold text-white transition hover:scale-[1.02]"
          >
            Manage Integrations
          </a>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <KpiCard
            title="Total Audience"
            value="1.48M"
            change="+12.4%"
            description="Across connected platforms"
            icon={Users}
          />

          <KpiCard
            title="Estimated Revenue"
            value="$42,850"
            change="+8.7%"
            description="Estimated creator earnings"
            icon={DollarSign}
          />

          <KpiCard
            title="Avg Engagement"
            value="6.42%"
            change="+1.8%"
            description="Average engagement rate"
            icon={TrendingUp}
          />

          <KpiCard
            title="30-Day Views"
            value="895K"
            change="+15.2%"
            description="Total views in last 30 days"
            icon={Eye}
          />

        </div>

        {/* Analytics Chart */}
        <div className="mt-6">
          <AnalyticsChart data={analyticsData} />
        </div>

        {/* Platform Performance */}
        <div className="mt-6">

          <h2 className="text-xl font-bold">
            Platform Performance
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Overview of your connected social platforms.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* YouTube */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  YouTube
                </h3>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Connected
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold">
                620K
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Subscribers
              </p>

              <p className="mt-4 text-sm text-emerald-400">
                ↗ +9.8% this month
              </p>
            </div>

            {/* Instagram */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  Instagram
                </h3>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Connected
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold">
                540K
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Followers
              </p>

              <p className="mt-4 text-sm text-emerald-400">
                ↗ +14.2% this month
              </p>
            </div>

            {/* TikTok */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  TikTok
                </h3>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Connected
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold">
                320K
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Followers
              </p>

              <p className="mt-4 text-sm text-emerald-400">
                ↗ +18.6% this month
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;