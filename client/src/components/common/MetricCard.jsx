import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp
} from 'lucide-react';

const MetricCard = ({ title, value, change, isPositive = true, icon: Icon, color = "indigo", subtitle }) => {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      border: "hover:border-indigo-500/40"
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "hover:border-rose-500/40"
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "hover:border-emerald-500/40"
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "hover:border-amber-500/40"
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "hover:border-cyan-500/40"
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`glass-card p-5 border border-white/5 transition-all duration-300 relative overflow-hidden ${scheme.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text}`}>
          {Icon ? <Icon className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        {change && (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}

      {/* Ambient background blur */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${scheme.bg} blur-2xl pointer-events-none opacity-40`}></div>
    </div>
  );
};

export default MetricCard;
