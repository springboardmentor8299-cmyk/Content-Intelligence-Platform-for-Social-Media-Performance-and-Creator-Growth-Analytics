import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function DemographicsChart({ data }) {
  return <ResponsiveContainer width="100%" height={280}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#dfe5ec" /><XAxis dataKey="age" /><YAxis /><Tooltip /><Legend /><Bar dataKey="female" fill="#197a73" /><Bar dataKey="male" fill="#e07a5f" /></BarChart></ResponsiveContainer>
}