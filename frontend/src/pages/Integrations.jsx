import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Integrations() {
  const navigate = useNavigate();

  const [connected, setConnected] = useState({
    YouTube: true,
    Instagram: true,
    TikTok: true,
    LinkedIn: true,
  });

  const platforms = [
    {
      name: "YouTube",
      description: "Connect your YouTube creator account",
    },
    {
      name: "Instagram",
      description: "Connect your Instagram creator account",
    },
    {
      name: "TikTok",
      description: "Connect your TikTok creator account",
    },
    {
      name: "LinkedIn",
      description: "Connect your LinkedIn creator account",
    },
  ];

  const handleToggle = (platformName) => {
    setConnected((previous) => ({
      ...previous,
      [platformName]: !previous[platformName],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Manage Integrations
          </h1>

          <p className="mt-2 text-slate-400">
            Connect and manage your social media platforms.
          </p>
        </div>

        {/* Back to Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
        >
          ← Back to Dashboard
        </button>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg"
            >

              {/* Platform Information */}
              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold">
                    {platform.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {platform.description}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={
                    connected[platform.name]
                      ? "whitespace-nowrap rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400"
                      : "whitespace-nowrap rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400"
                  }
                >
                  {connected[platform.name]
                    ? "Connected"
                    : "Disconnected"}
                </span>

              </div>

              {/* Connect / Disconnect */}
              <button
                onClick={() => handleToggle(platform.name)}
                className="mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 font-semibold text-white transition hover:scale-[1.02] hover:opacity-90"
              >
                {connected[platform.name]
                  ? "Disconnect"
                  : "Connect"}
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Integrations;