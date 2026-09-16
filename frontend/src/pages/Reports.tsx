import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Download, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const templates = [
  {
    id: 1,
    icon: '📊',
    iconBg: 'bg-blue-50',
    title: 'Weekly Performance',
    desc: 'Summary of key metrics across all platforms.',
    link: 'Generate →',
  },
  {
    id: 2,
    icon: '💳',
    iconBg: 'bg-purple-50',
    title: 'Monthly Revenue',
    desc: 'Detailed breakdown of earnings and payouts.',
    link: 'Generate →',
  },
  {
    id: 3,
    icon: '👥',
    iconBg: 'bg-green-50',
    title: 'Audience Deep Dive',
    desc: 'Demographics, growth, and engagement insights.',
    link: 'Generate →',
  },
];

const schedules = [
  { title: 'Weekly Exec Summary', sub: 'Every Monday at 9:00 AM • PDF', enabled: true },
  { title: 'Monthly Finance Sync', sub: '1st of Month at 12:00 PM • Excel', enabled: true },
];

const history = [
  { name: 'Q3 Campaign Overview', type: 'PDF', typeColor: 'bg-red-100 text-red-600', date: 'Oct 24, 2023 • 14:30', status: 'Ready', statusColor: 'text-green-600' },
  { name: 'Creator Roster Engagement (Sept)', type: 'Excel', typeColor: 'bg-green-100 text-green-600', date: 'Oct 15, 2023 • 09:15', status: 'Ready', statusColor: 'text-green-600' },
  { name: 'Custom Audience Audit', type: 'PDF', typeColor: 'bg-red-100 text-red-600', date: 'Oct 12, 2023 • 11:45', status: 'Generating...', statusColor: 'text-blue-600' },
];

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${on ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

const HeaderActions = () => (
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
    <Plus className="h-4 w-4" />
    Export New Report
  </button>
);

export default function Reports() {
  return (
    <DashboardLayout
      title="Scheduled Reports"
      subtitle="Manage templates, view history, and configure automated exports."
      headerActions={<HeaderActions />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Templates + History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Report Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Report Templates</h3>
              <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {templates.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border p-5 shadow-sm hover:shadow transition-shadow"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <div className={`h-12 w-12 rounded-xl ${t.iconBg} flex items-center justify-center text-2xl mb-4`}>
                    {t.icon}
                  </div>
                  <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>{t.title}</h4>
                  <p className="text-xs mb-4" style={{ color: 'var(--color-foreground-muted)' }}>{t.desc}</p>
                  <button className="text-sm font-semibold text-blue-600 hover:underline">{t.link}</button>
                </div>
              ))}
            </div>
          </div>

          {/* History & Downloads */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>History & Downloads</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-50"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zM6 9h12M9 14h6" />
                </svg>
                Filter
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: `1px solid var(--color-border)` }}>
                  {['REPORT NAME', 'TYPE', 'DATE GENERATED', 'STATUS', 'ACTION'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-foreground-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {history.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{r.name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.typeColor}`}>
                        📄 {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-foreground-secondary)' }}>{r.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium flex items-center gap-1 ${r.statusColor}`}>
                        {r.status === 'Ready' && '✓ '}
                        {r.status === 'Generating...' && (
                          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className={`p-2 rounded-lg transition-colors ${r.status === 'Ready' ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}>
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-6 py-3 border-t text-sm"
              style={{ borderColor: 'var(--color-border)' }}>
              <span style={{ color: 'var(--color-foreground-muted)' }}>Showing 1-3 of 24 reports</span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded border hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: 'var(--color-foreground-secondary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-1.5 rounded border hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: 'var(--color-foreground-secondary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Scheduled Exports */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-fit"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>Scheduled Exports</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {schedules.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">📅</div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{s.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-foreground-muted)' }}>{s.sub}</div>
                  </div>
                </div>
                <ToggleSwitch defaultOn={s.enabled} />
              </div>
            ))}
          </div>
          <div className="p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)', border: '1px solid var(--color-border)' }}>
              Manage Schedules
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
