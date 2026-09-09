import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import apiClient from './apiClient'

const fallback = {
  kpis: { reach: 128400, engagement_rate: 8.4, audience_growth: 12.7, revenue: 4820 },
  time_series: [],
  engagement: [],
  revenue_trend: [],
  demographics: [],
  countries: [],
  active_hours: [],
  content: [],
}

function formatCompact(value) {
  if (typeof value !== 'number') return value ?? '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function Sparkline({ data, color = '#8b5cf6' }) {
  const points = useMemo(() => {
    if (!data || data.length === 0) return ''
    const max = Math.max(...data.map((point) => Number(point.value ?? point.views ?? point.revenue ?? point)))
    const min = Math.min(...data.map((point) => Number(point.value ?? point.views ?? point.revenue ?? point)))
    const range = max - min || 1

    return data
      .map((point, index) => {
        const value = Number(point.value ?? point.views ?? point.revenue ?? point)
        const x = (index / Math.max(data.length - 1, 1)) * 100
        const y = 100 - ((value - min) / range) * 100
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }, [data])

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sparkline">
      <path d={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function Layout({ user, logout }) {
  const location = useLocation()
  const links = [
    ['/dashboard', 'Overview'],
    ['/dashboard/content', 'Content'],
    ['/dashboard/audience', 'Audience'],
    ['/dashboard/platforms', 'Platforms'],
  ]

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">C</div>
          <div>
            <p className="brand">CreatorIQ</p>
            <span className="brand-subtitle">Signal Suite</span>
          </div>
        </div>
        <nav className="side-nav">
          {links.map(([path, label]) => (
            <Link className={location.pathname === path ? 'nav-item active' : 'nav-item'} key={path} to={path}>
              <span className="nav-dot" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-card">
          <span className="eyebrow">LIVE STATUS</span>
          <strong>97.4% uptime</strong>
          <small>Channel health stable</small>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">CREATORIQ / WORKSPACE</p>
            <h1>{user.display_name}</h1>
          </div>
          <div className="user-meta">
            <div className="avatar">{user.display_name.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{user.display_name}</strong>
              <span>{user.email}</span>
            </div>
            <button className="outline-button" onClick={logout}>Sign out</button>
          </div>
        </header>

        <Outlet />
      </section>
    </main>
  )
}

function useOverviewAnalytics() {
  const [analytics, setAnalytics] = useState(fallback)

  useEffect(() => {
    apiClient
      .get('/analytics/overview')
      .then(({ data }) => setAnalytics(data))
      .catch(() => setAnalytics(fallback))
  }, [])

  return analytics
}

function useContentAnalytics() {
  const [analytics, setAnalytics] = useState({ items: [], filters: ['All', 'Published', 'Draft', 'Trending'] })

  useEffect(() => {
    apiClient
      .get('/analytics/content')
      .then(({ data }) => setAnalytics(data))
      .catch(() => setAnalytics({ items: fallback.content, filters: ['All', 'Published', 'Draft', 'Trending'] }))
  }, [])

  return analytics
}

function useAudienceAnalytics() {
  const [analytics, setAnalytics] = useState(fallback)

  useEffect(() => {
    apiClient
      .get('/analytics/audience')
      .then(({ data }) => setAnalytics(data))
      .catch(() => setAnalytics(fallback))
  }, [])

  return analytics
}

export function OverviewPage() {
  const data = useOverviewAnalytics()
  const cards = [
    { label: 'Total reach', value: formatCompact(data.kpis?.reach ?? 0), delta: '+12.4%', description: 'vs last week', spark: data.time_series?.map((item) => ({ ...(item || {}), value: item.reach ?? item.views ?? 0 })) || [] },
    { label: 'Engagement rate', value: `${Number(data.kpis?.engagement_rate ?? 0).toFixed(1)}%`, delta: '+2.1%', description: 'from avg benchmark', spark: data.engagement?.map((item) => ({ value: item.engagement_rate ?? item.likes ?? 0 })) || [] },
    { label: 'Audience growth', value: `+${Number(data.kpis?.audience_growth ?? 0).toFixed(1)}%`, delta: '+8.6%', description: 'monthly expansion', spark: data.time_series?.map((item) => ({ value: item.growth ?? item.audience ?? 0 })) || [] },
    { label: 'Revenue', value: formatCurrency(data.kpis?.revenue ?? 0), delta: '+18.2%', description: 'from last 7 days', spark: data.revenue_trend?.map((item) => ({ value: item.revenue ?? 0 })) || [] },
  ]

  return (
    <div className="page-stack">
      <div className="status-bar">
        <span className="status-dot" />
        <span>Mock analytics feed connected</span>
        <strong>Updated 14 mins ago</strong>
      </div>

      <div className="metric-grid">
        {cards.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="metric-topline">
              <span>{card.label}</span>
              <span className="trend-badge">{card.delta}</span>
            </div>
            <strong>{card.value}</strong>
            <div className="metric-bottomline">
              <small>{card.description}</small>
              <Sparkline data={card.spark} color="#8b5cf6" />
            </div>
          </article>
        ))}
      </div>

      <div className="chart-grid">
        <section className="chart-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">PERFORMANCE</p>
              <h2>Views and engagement</h2>
            </div>
            <span className="panel-pill">7-day window</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.engagement.length ? data.engagement : data.time_series}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 0 }} />
              <Line type="monotone" dataKey="likes" stroke="#34d399" strokeWidth={3} dot={{ r: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">REVENUE</p>
              <h2>Daily revenue</h2>
            </div>
            <span className="panel-pill success">+18.2%</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenue_trend.length ? data.revenue_trend : data.time_series}>
              <defs>
                <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.38} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#revenueFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  )
}

export function ContentPage() {
  const data = useContentAnalytics()
  const [selectedFilter, setSelectedFilter] = useState('All')
  const items = useMemo(() => {
    if (selectedFilter === 'All') return data.items
    return data.items.filter((item) => item.status === selectedFilter)
  }, [data.items, selectedFilter])

  return (
    <section className="content-panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">CONTENT PERFORMANCE</p>
          <h2>Top content</h2>
        </div>
        <div className="filter-pills">
          {(data.filters || ['All']).map((filter) => (
            <button key={filter} className={selectedFilter === filter ? 'filter-pill active' : 'filter-pill'} onClick={() => setSelectedFilter(filter)} type="button">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Platform</th>
              <th>Views</th>
              <th>Engagement</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.title}>
                <td>
                  <div className="asset-cell">
                    <div className="asset-icon">{item.platform?.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.type || 'Video'}</span>
                    </div>
                  </div>
                </td>
                <td>{item.platform}</td>
                <td>{formatCompact(item.views)}</td>
                <td>
                  <span className="engagement-pill">{item.engagement_rate ?? item.engagement ?? '8.8%'}</span>
                </td>
                <td><span className="status-pill">{item.status || 'Published'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function AudiencePage() {
  const data = useAudienceAnalytics()

  return (
    <div className="page-stack">
      <section className="chart-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">AUDIENCE PROFILE</p>
            <h2>Age and gender distribution</h2>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.demographics || []}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.18)" />
            <XAxis dataKey="age" stroke="#9ca3af" tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="female" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="male" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <div className="chart-grid audience-grid">
        <section className="chart-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">REGIONS</p>
              <h2>Top countries</h2>
            </div>
          </div>
          <div className="heatmap-grid">
            {(data.countries || []).map((country, index) => (
              <div key={`${country.country}-${index}`} className="heatmap-item" style={{ opacity: 0.3 + (country.value / 100) }}>
                <span>{country.country}</span>
                <strong>{country.value}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">ACTIVE HOURS</p>
              <h2>Peak engagement times</h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.active_hours || []}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="hour" stroke="#9ca3af" tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="engagement" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  )
}

export function PlatformsPage() {
  const platforms = [
    { name: 'YouTube', status: 'Connected', users: '2 channels', active: 'Live sync' },
    { name: 'Instagram', status: 'Connected', users: '3 profiles', active: '50 min ago' },
    { name: 'TikTok', status: 'Reviewing', users: '1 creator', active: 'Pending OAuth' },
    { name: 'LinkedIn', status: 'Disconnected', users: 'No profile', active: 'Not connected' },
    { name: 'X', status: 'Connected', users: '1 profile', active: 'Live sync' },
    { name: 'Pinterest', status: 'Disconnected', users: 'No profile', active: 'Not connected' },
  ]

  return (
    <section className="chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">CONNECTED PLATFORMS</p>
          <h2>Bring your channels together</h2>
        </div>
      </div>

      <div className="platform-grid">
        {platforms.map((platform) => (
          <article key={platform.name} className="platform-card">
            <div className="platform-header">
              <div className="platform-icon">{platform.name.slice(0, 2).toUpperCase()}</div>
              <span className={`connection-status ${platform.status.toLowerCase().replace(/\s+/g, '-')}`}>{platform.status}</span>
            </div>
            <strong>{platform.name}</strong>
            <span>{platform.users}</span>
            <small>{platform.active}</small>
            <button type="button">{platform.status === 'Disconnected' ? `Connect ${platform.name}` : 'Manage account'}</button>
          </article>
        ))}
      </div>
    </section>
  )
}
	