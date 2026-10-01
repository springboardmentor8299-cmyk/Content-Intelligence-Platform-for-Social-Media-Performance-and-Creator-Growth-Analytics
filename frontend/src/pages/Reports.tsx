import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Download, RefreshCw, FileText, CheckCircle2, Clock, Calendar, X, Trash2, Sliders } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ReportExportItem {
  export_id: string;
  report_name: string;
  file_format: string;
  download_url: string;
  generated_at: string;
  size_kb: number;
  status: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  sub: string;
  frequency: string;
  format: string;
  enabled: boolean;
}

const templates = [
  {
    id: 'executive_summary',
    icon: '📊',
    iconBg: 'bg-blue-50',
    title: 'Weekly Performance',
    desc: 'Summary of key views, followers, and engagement rates across all channels.',
    defaultFormat: 'PDF'
  },
  {
    id: 'monetization_audit',
    icon: '💳',
    iconBg: 'bg-purple-50',
    title: 'Monthly Revenue & Finance',
    desc: 'Comprehensive ledger of brand sponsorships, ad revenue, and payout pipeline.',
    defaultFormat: 'CSV'
  },
  {
    id: 'audience_demographics',
    icon: '👥',
    iconBg: 'bg-green-50',
    title: 'Audience Deep Dive',
    desc: 'Retention metrics, subscriber growth velocity, and platform demographics.',
    defaultFormat: 'CSV'
  },
];

export default function Reports() {
  const [history, setHistory] = useState<ReportExportItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Generator Modal State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genReportType, setGenReportType] = useState('monetization_audit');
  const [genDateRange, setGenDateRange] = useState('30d');
  const [genFormat, setGenFormat] = useState('CSV');
  const [generating, setGenerating] = useState(false);

  // New Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedFreq, setSchedFreq] = useState('Weekly');
  const [schedFormat, setSchedFormat] = useState('PDF');
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [histRes, schedRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/reports/history'),
        fetch('http://localhost:8000/api/v1/reports/schedules')
      ]);

      if (histRes.ok) setHistory(await histRes.json());
      if (schedRes.ok) setSchedules(await schedRes.json());
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: genReportType,
          date_range: genDateRange,
          format: genFormat.toLowerCase(),
          platforms: ['youtube', 'linkedin', 'instagram']
        })
      });

      if (res.ok) {
        const newReport = await res.json();
        setIsGeneratorOpen(false);
        // Automatically trigger browser download of newly created report
        window.open(`http://localhost:8000${newReport.download_url}`, '_blank');
        fetchReportsData();
      }
    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSchedule = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/schedules/${id}/toggle`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
      }
    } catch (err) {
      console.error("Error toggling schedule:", err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/reports/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: schedTitle,
          frequency: schedFreq,
          format: schedFormat,
          sub: `Every ${schedFreq} • ${schedFormat}`,
          enabled: true
        })
      });

      if (res.ok) {
        setIsScheduleModalOpen(false);
        setSchedTitle('');
        fetchReportsData();
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/schedules/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSchedules(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete schedule:", err);
    }
  };

  const openTemplate = (templateId: string, defaultFormat: string) => {
    setGenReportType(templateId);
    setGenFormat(defaultFormat);
    setIsGeneratorOpen(true);
  };

  const HeaderActions = () => (
    <>
      <button 
        onClick={fetchReportsData}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground-secondary)' }}>
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      <button 
        onClick={() => setIsGeneratorOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
        <Plus className="h-4 w-4" />
        Export New Report
      </button>
    </>
  );

  return (
    <DashboardLayout
      title="Scheduled Reports & Analytics Export"
      subtitle="Generate audit-ready performance spreadsheets, configure scheduled deliveries, and download historical analytics."
      headerActions={<HeaderActions />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Templates + History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Report Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Standard Report Templates</h3>
              <span className="text-xs text-gray-500">1-click automated workflows</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {templates.map((t) => (
                <div key={t.id} className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <div className={`h-12 w-12 rounded-xl ${t.iconBg} flex items-center justify-center text-2xl mb-4`}>
                      {t.icon}
                    </div>
                    <h4 className="text-sm font-semibold mb-1 text-gray-900">{t.title}</h4>
                    <p className="text-xs mb-4 text-gray-500 leading-relaxed">{t.desc}</p>
                  </div>
                  <button 
                    onClick={() => openTemplate(t.id, t.defaultFormat)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 text-left flex items-center gap-1">
                    Generate {t.defaultFormat} →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* History & Downloads */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Generated Reports & File Archives</h3>
                <p className="text-xs text-gray-500">Download directly or review past exports with full provenance.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {history.length} Available Files
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/70 border-b text-[11px] font-semibold text-gray-500 uppercase tracking-wider" style={{ borderColor: 'var(--color-border)' }}>
                    <th className="px-6 py-3">Report Name</th>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3">Date Generated</th>
                    <th className="px-4 py-3">File Size</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                        No reports generated yet. Click "Export New Report" to create your first report.
                      </td>
                    </tr>
                  ) : (
                    history.map((r) => (
                      <tr key={r.export_id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>{r.report_name}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            r.file_format === 'CSV' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : r.file_format === 'JSON'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {r.file_format}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">{r.generated_at}</td>
                        <td className="px-4 py-4 text-xs text-gray-500">{r.size_kb} KB</td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-medium text-green-700 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                            <CheckCircle2 className="h-3 w-3" /> Ready
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`http://localhost:8000${r.download_url}`}
                            download
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Scheduled Exports */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-fit"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Scheduled Exports</h3>
              <p className="text-xs text-gray-500">Automated cadence delivery</p>
            </div>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> New Schedule
            </button>
          </div>
          
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-base">
                    📅
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleSchedule(s.id)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${s.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${s.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(s.id)}
                    className="text-gray-300 hover:text-red-500 p-1"
                    title="Remove schedule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t bg-gray-50/50 text-xs text-gray-500" style={{ borderColor: 'var(--color-border)' }}>
            Scheduled reports are automatically compiled and delivered to your account notifications and email at the designated cadence.
          </div>
        </div>
      </div>

      {/* MODAL 1: Export New Report */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Generate Analytics Report</h3>
              </div>
              <button 
                onClick={() => setIsGeneratorOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Report Type</label>
                <select
                  value={genReportType}
                  onChange={e => setGenReportType(e.target.value)}
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option value="monetization_audit">Monetization & Sponsorship Audit</option>
                  <option value="executive_summary">Executive Performance Overview</option>
                  <option value="audience_demographics">Audience Reach & Growth</option>
                  <option value="cross_platform">Cross-Platform Channels Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date Range</label>
                <select
                  value={genDateRange}
                  onChange={e => setGenDateRange(e.target.value)}
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days (Recommended)</option>
                  <option value="90d">Last 90 Days (Quarterly)</option>
                  <option value="1y">Past 1 Year</option>
                  <option value="all">All Time History</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">File Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['CSV', 'JSON', 'PDF'].map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setGenFormat(fmt)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        genFormat === fmt
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border text-xs text-gray-600" style={{ borderColor: 'var(--color-border)' }}>
                <strong>Includes:</strong> Verified follower counts, total video impressions, realized sponsorship revenues, and connected social account telemetry.
              </div>

              <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  {generating ? 'Compiling Report...' : 'Generate & Download'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Scheduled Export */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">New Automated Schedule</h3>
              </div>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Schedule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Executive Performance Digest"
                  value={schedTitle}
                  onChange={e => setSchedTitle(e.target.value)}
                  className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Cadence / Frequency</label>
                  <select
                    value={schedFreq}
                    onChange={e => setSchedFreq(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">File Format</label>
                  <select
                    value={schedFormat}
                    onChange={e => setSchedFormat(e.target.value)}
                    className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white text-gray-700"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {savingSchedule ? 'Scheduling...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
