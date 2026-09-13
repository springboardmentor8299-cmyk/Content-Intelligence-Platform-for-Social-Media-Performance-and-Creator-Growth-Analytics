import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Clock, 
  Check, 
  X, 
  Sparkles,
  Calendar,
  Send
} from 'lucide-react';
import { exportCSV } from '../api';

export default function ReportsModal({ isOpen, onClose }) {
  const [reportType, setReportType] = useState('content');
  const [scheduled, setScheduled] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const url = exportCSV(reportType);
    window.open(url, '_blank');
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Export Creator Analytics Report</h3>
              <p className="text-xs text-slate-400">Generate executive CSV, PDF, and scheduled audit digests</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Configuration */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Dataset Scope</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReportType('content')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  reportType === 'content'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Content Performance</span>
                </div>
                <span className="text-[11px] text-slate-400">All posts, views, shares, watch time & virality metrics</span>
              </button>

              <button
                onClick={() => setReportType('revenue')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  reportType === 'revenue'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Revenue & Sponsorships</span>
                </div>
                <span className="text-[11px] text-slate-400">Contracted deals, paid invoices, and payouts ledger</span>
              </button>
            </div>
          </div>

          {/* Scheduled Digest Toggle */}
          <div className="p-4 rounded-xl glass-panel border border-white/5 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Automated Weekly Digest</div>
                <div className="text-[11px] text-slate-400">Email full PDF report every Monday at 09:00 UTC</div>
              </div>
            </div>

            <button
              onClick={() => setScheduled(!scheduled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                scheduled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  scheduled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {exportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Report download started successfully!</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Data</span>
          </button>
        </div>

      </div>
    </div>
  );
}
