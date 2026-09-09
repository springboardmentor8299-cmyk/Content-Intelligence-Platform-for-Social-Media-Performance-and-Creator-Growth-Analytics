import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function RevenueChart({ data }) {
  return <ResponsiveContainer width="100%" height={280}><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#dfe5ec" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="#c35b42" fill="#f2b5a2" fillOpacity={0.7} /></AreaChart></ResponsiveContainer>
}