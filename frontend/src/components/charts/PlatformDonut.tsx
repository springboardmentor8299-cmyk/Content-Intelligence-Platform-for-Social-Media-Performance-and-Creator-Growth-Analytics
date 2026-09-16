import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatNumber } from '@/lib/utils';

interface PlatformData {
  platform: string;
  followers: number;
  color: string;
}

interface PlatformDonutProps {
  data: PlatformData[];
}

export function PlatformDonut({ data }: PlatformDonutProps) {
  const total = data.reduce((sum, item) => sum + item.followers, 0);

  return (
    <div className="relative h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="followers"
            nameKey="platform"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e2230',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any, name: any) => [
              formatNumber(Number(value)),
              String(name).charAt(0).toUpperCase() + String(name).slice(1)
            ]}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-foreground-secondary text-xs capitalize">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[75%] text-center pointer-events-none">
        <p className="text-2xl font-bold text-foreground">{formatNumber(total)}</p>
        <p className="text-xs text-foreground-muted">Total</p>
      </div>
    </div>
  );
}
