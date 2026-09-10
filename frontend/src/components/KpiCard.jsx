function KpiCard({ title, value, change, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition hover:-translate-y-1 hover:border-cyan-500/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-cyan-500/10 p-3">
          {Icon && <Icon size={22} className="text-cyan-400" />}
        </div>
      </div>

      <div className="mt-4">
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          ↗ {change}
        </span>

        <span className="ml-2 text-xs text-slate-500">
          vs. last 30 days
        </span>
      </div>
    </div>
  );
}

export default KpiCard;