import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Eye, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Share2, 
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { fetchReportPreview, getReportExportUrl, downloadReportFile } from '../api';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('analytics_summary');
  const [period, setPeriod] = useState('30d');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadMsg, setDownloadMsg] = useState('');

  const reportTypes = [
    { id: 'analytics_summary', label: '1. Analytics Summary', icon: Sparkles, desc: 'Executive overview across channels & KPIs' },
    { id: 'content_performance', label: '2. Content Performance', icon: FileText, desc: 'All 26 verified episodes & shorts metrics' },
    { id: 'audience_analytics', label: '3. Audience Analytics', icon: Users, desc: 'Public community scale & private status' },
    { id: 'growth_trends', label: '4. Growth & Trends', icon: TrendingUp, desc: 'Observed content velocity & baselines' },
    { id: 'revenue', label: '5. Revenue & Monetization', icon: DollarSign, desc: 'Demo sponsorship & deals ledger' },
    { id: 'platform_comparison', label: '6. Platform Comparison', icon: Share2, desc: 'YouTube, Instagram, Facebook, X, LinkedIn matrix' },
  ];

  const periods = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: 'all_time', label: 'All-Time / Lifetime' }
  ];

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetchReportPreview(reportType, period);
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to load report preview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType, period]);

  const handleDownload = async (format) => {
    try {
      setDownloadMsg(`Generating and downloading ${format.toUpperCase()} report...`);
      await downloadReportFile(reportType, period, format);
      setDownloadMsg(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (err) {
      console.error("Failed to download report:", err);
      // Fallback to direct URL if blob download fails
      const fallbackUrl = getReportExportUrl(reportType, period, format);
      window.open(fallbackUrl, '_blank');
      setDownloadMsg(`Downloading ${format.toUpperCase()} report via direct link...`);
    } finally {
      setTimeout(() => setDownloadMsg(''), 4500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden during print) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Reports & Export</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Milestone 3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Generate executive reports, preview live dataset snapshots, and export to CSV, Excel, or PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleDownload('csv')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleDownload('xlsx')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Download Toast (hidden during print) */}
      {downloadMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* Report Configuration Controls (hidden during print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 print:hidden">
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-2 font-display">
            Select Report Type (6 Standardised Project Reports)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reportTypes.map((rt) => {
              const Icon = rt.icon;
              const active = reportType === rt.id;
              return (
                <button
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    active
                      ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${active ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {rt.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{rt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Period Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 font-display">
            Reporting Period Scope:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  period === p.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Preview Document Canvas (Visible both in screen and during print) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                {reportData?.app_title || 'CreatorIQ — Creator Analytics Dashboard'}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1 font-display">
                {reportData?.title || 'Creator Performance Report'}
              </h1>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500">
              <div className="font-bold text-slate-800">{reportData?.creator_name}</div>
              <div className="text-[11px]">Host: {reportData?.host}</div>
              <div className="text-[10px] text-slate-400 mt-1">Generated: {reportData?.generated_at}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              Period: {reportData?.reporting_period}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              {reportData?.data_provenance}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-indigo-600 font-semibold animate-pulse">
            Generating live report preview from database...
          </div>
        ) : (
          <>
            {/* KPI Cards Strip */}
            {reportData?.kpis && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Executive KPI Highlights
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {reportData.kpis.map((kpi, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="text-[11px] text-slate-500 font-medium">{kpi.label}</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-1 font-display">
                        {kpi.value}
                      </div>
                      <div className="text-[9px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                        {kpi.verified ? (
                          <span className="text-emerald-700">● Verified Public</span>
                        ) : (
                          <span className="text-amber-700">● Requires creator access</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Data Table Preview */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Dataset Details & Records
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  {reportData?.items && reportData.items.length > 0 && (
                    <>
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {Object.keys(reportData.items[0]).map((col) => (
                            <th key={col} className="py-2.5 px-3">
                              {col.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.items.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="py-2.5 px-3 text-slate-700">
                                {typeof val === 'number' ? val.toLocaleString() : (
                                  val === 'Requires creator access' || val === 'Configuration Required' ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                      {val}
                                    </span>
                                  ) : val
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>

            {/* Data Honesty Notice Section */}
            {reportData?.unavailable_metrics && reportData.unavailable_metrics.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>Data Honesty & Unavailable Metrics Notice</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  In strict compliance with CreatorIQ data honesty principles, the following metrics are explicitly identified as unavailable through public channel observation and will only be populated after creator OAuth authentication:
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {reportData.unavailable_metrics.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {m}: <strong className="text-amber-800">Requires creator access</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          CreatorIQ Milestone 3 Executive Report • Raw Talks With VK • Confidential Creator Analytics
        </div>

      </div>
    </div>
  );
}
