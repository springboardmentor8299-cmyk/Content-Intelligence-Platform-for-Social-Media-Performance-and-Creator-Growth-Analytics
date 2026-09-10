import {
  LayoutDashboard,
  BarChart3,
  Users,
  DollarSign,
  SlidersHorizontal,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    {
      name: "Overview",
      icon: LayoutDashboard,
      active: true,
    },
    {
      name: "Content Analytics",
      icon: BarChart3,
    },
    {
      name: "Audience",
      icon: Users,
    },
    {
      name: "Revenue",
      icon: DollarSign,
    },
    {
      name: "Analytics Tools",
      icon: SlidersHorizontal,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 lg:block">

      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-xl font-bold">
          ⚡
        </div>

        <div>
          <h1 className="text-lg font-bold text-white">
            CreatorIQ
          </h1>

          <p className="text-[9px] font-semibold tracking-widest text-cyan-400">
            ANALYTICS OS
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Main Menu
        </p>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  item.active
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={19} />

                <span>{item.name}</span>

                {item.name === "Content Analytics" && (
                  <span className="ml-auto rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-400">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Health */}
      <div className="absolute bottom-24 left-4 right-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs font-semibold text-cyan-400">
          ↗ Channel Health: Prime
        </p>

        <p className="mt-2 text-xs text-slate-400">
          Monthly Reach: 1.48M
        </p>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
        </div>
      </div>

      {/* Profile */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
            👤
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Creator
            </p>

            <p className="text-xs text-slate-500">
              Pro Creator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;