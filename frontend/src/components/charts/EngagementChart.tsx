import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface DataPoint {
  date: string;
  engagement: number;
  views: number;
}

interface EngagementChartProps {
  data: DataPoint[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              try {
                return format(parseISO(value), 'MMM d');
              } catch {
                return value;
              }
            }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            yAxisId="engagement"
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            yAxisId="views"
            orientation="right"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e2230',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelFormatter={(value) => {
              try {
                return format(parseISO(value as string), 'MMM d, yyyy');
              } catch {
                return value as string;
              }
            }}
            formatter={(value: any, name: any) => [
              name === 'engagement' ? `${value}%` : `${(Number(value) / 1000).toFixed(1)}K`,
              name === 'engagement' ? 'Engagement Rate' : 'Views'
            ]}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#viewsGradient)"
            yAxisId="views"
          />
          <Area
            type="monotone"
            dataKey="engagement"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#engagementGradient)"
            yAxisId="engagement"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
