import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { formatNumber } from '@/lib/utils';

interface GrowthData {
  date: string;
  followers: number;
}

interface GrowthChartProps {
  data: GrowthData[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                const [year, month] = value.split('-');
                return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM');
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
            tickFormatter={(value) => formatNumber(value)}
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
                const [year, month] = (value as string).split('-');
                return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy');
              } catch {
                return value as string;
              }
            }}
            formatter={(value: any) => [formatNumber(Number(value)), 'Followers']}
          />
          <Line
            type="monotone"
            dataKey="followers"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#22c55e' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
