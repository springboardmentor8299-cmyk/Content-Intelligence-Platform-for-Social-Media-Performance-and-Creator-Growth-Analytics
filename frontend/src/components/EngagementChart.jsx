import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function EngagementChart({ data }) {
  return <ResponsiveContainer width="100%" height={280}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#dfe5ec" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="views" stroke="#197a73" strokeWidth={3} /><Line type="monotone" dataKey="likes" stroke="#e07a5f" strokeWidth={3} /></LineChart></ResponsiveContainer>
}