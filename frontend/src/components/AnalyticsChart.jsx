import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function AnalyticsChart({ data, dataKey = "views" }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">
          Cross-Platform Performance
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Historical daily aggregation of views, revenue, and engagement trends
        </p>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
            />

            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "12px",
                color: "#ffffff",
              }}
            />

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#22d3ee"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsChart;