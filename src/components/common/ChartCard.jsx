import React from 'react';
import { Download } from 'lucide-react';

export const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  headerBadge,
  onExport,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-[#1A2233] rounded-3xl p-5 lg:p-6 relative shadow-sm border border-slate-200 dark:border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
            {headerBadge && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[#4A7CF7]/15 text-[#4A7CF7] dark:text-[#00D4FF] border border-[#4A7CF7]/30 font-semibold">
                {headerBadge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-[#8B9BB5] mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {action}
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#131929] hover:bg-slate-200 dark:hover:bg-[#1F2840] text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all text-xs flex items-center gap-1.5 shadow-sm"
              title="Export Chart Data"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chart Content */}
      <div className="w-full relative z-10">{children}</div>
    </div>
  );
};
