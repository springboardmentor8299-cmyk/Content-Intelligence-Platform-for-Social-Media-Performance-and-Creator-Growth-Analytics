import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface AgeData {
  range: string;
  percentage: number;
}

interface GenderData {
  type: string;
  percentage: number;
}

interface CountryData {
  country: string;
  percentage: number;
  flag: string;
}

interface DeviceData {
  type: string;
  percentage: number;
}

export function AgeChart({ data }: { data: AgeData[] }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="range"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e2230',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any) => [`${value}%`, 'Audience']}
          />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index === 2 ? '#8b5cf6' : '#334155'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GenderChart({ data }: { data: GenderData[] }) {
  const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6'];

  return (
    <div className="h-[180px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={4}
            dataKey="percentage"
            nameKey="type"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e2230',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any) => [`${value}%`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4">
        {data.map((item, index) => (
          <div key={item.type} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-xs text-foreground-secondary">
              {item.type} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CountryList({ data }: { data: CountryData[] }) {
  return (
    <div className="flex flex-col gap-3">
      {data.map((country) => (
        <div key={country.country} className="flex items-center gap-3">
          <span className="text-lg">{country.flag}</span>
          <div className="flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">{country.country}</span>
              <span className="text-foreground-secondary">{country.percentage}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${country.percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DeviceChart({ data }: { data: DeviceData[] }) {
  const COLORS = ['#8b5cf6', '#3b82f6', '#14b8a6'];
  const ICONS: Record<string, string> = {
    Mobile: '📱',
    Desktop: '💻',
    Tablet: '📲'
  };

  return (
    <div className="flex flex-col gap-4">
      {data.map((device, index) => (
        <div key={device.type} className="flex items-center gap-3">
          <span className="text-2xl">{ICONS[device.type] || '💻'}</span>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">{device.type}</span>
              <span className="font-medium text-foreground">{device.percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${device.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
