import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueData {
  month: string;
  sponsorships: number;
  adRevenue: number;
  affiliate: number;
  subscriptions: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e2230',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-foreground-secondary text-xs capitalize">
                {value.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            )}
          />
          <Bar dataKey="sponsorships" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
          <Bar dataKey="adRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
          <Bar dataKey="affiliate" fill="#14b8a6" radius={[4, 4, 0, 0]} stackId="a" />
          <Bar dataKey="subscriptions" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
