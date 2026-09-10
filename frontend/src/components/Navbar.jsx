import {
  Search,
  Bell,
  Sun,
} from "lucide-react";

function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur lg:left-64">
      <div className="flex h-full items-center justify-between px-6">

        {/* Search */}
        <div className="hidden items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 md:flex">
          <Search size={18} className="text-slate-500" />

          <input
            type="text"
            placeholder="Search analytics..."
            className="w-52 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Platforms */}
        <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1 xl:flex">

          <button className="rounded-lg bg-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-400">
            All Platforms
          </button>

          <button className="px-3 py-2 text-xs text-slate-400 hover:text-white">
            ▶ YouTube
          </button>

          <button className="px-3 py-2 text-xs text-slate-400 hover:text-white">
            ◎ Instagram
          </button>

          <button className="px-3 py-2 text-xs text-slate-400 hover:text-white">
            𝕏 X
          </button>

        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          <button className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-slate-400 hover:text-white">
            <Sun size={18} />
          </button>

          <button className="relative rounded-xl border border-slate-800 bg-slate-900 p-3 text-slate-400 hover:text-white">
            <Bell size={18} />

            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
              2
            </span>
          </button>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">
              Creator
            </p>

            <p className="text-xs text-cyan-400">
              PRO
            </p>
          </div>

        </div>

      </div>
    </header>
  );
}

export default Navbar;