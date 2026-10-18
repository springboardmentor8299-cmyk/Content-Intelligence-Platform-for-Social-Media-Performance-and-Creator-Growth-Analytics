import "./earnings.css";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Earnings() {
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const creatorId = JSON.parse(
    localStorage.getItem("user") || "null"
  )?.id;

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/earnings/${creatorId}`);

        setEarnings(
          Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.earnings)
              ? response.data.earnings
              : Array.isArray(response.data?.data)
                ? response.data.data
                : []
        );
      } catch (err) {
        console.error("Earnings API error:", err);

        if (err?.response?.status === 404) {
          setEarnings([]);
        } else {
          setError(
            err?.response?.data?.detail ||
              "Unable to load earnings data."
          );
          setEarnings([]);
        }
      }

      try {
        const summaryResponse = await api.get(
          `/earnings/${creatorId}/summary`
        );
        setSummary(summaryResponse.data);
      } catch (err) {
        console.error("Failed to load earnings summary:", err);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, [creatorId]);

  const formatNumber = (number) => {
    const value = Number(number);

    if (!Number.isFinite(value)) return "0";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;

    return value.toLocaleString("en-IN");
  };

  const currencyCode = (
    summary?.currency ||
    earnings[0]?.currency ||
    "INR"
  ).toUpperCase();

  const formatCurrency = (amount) =>
    `${currencyCode} ${formatNumber(amount)}`;

  const totalRevenue = Number(
    summary?.total_earned ??
      earnings.reduce(
        (sum, item) => sum + Number(item?.estimated_revenue || 0),
        0
      )
  );

  const paidSponsorshipAmount = Number(
    summary?.paid_sponsorship_amount || 0
  );

  const pendingSponsorshipAmount = Number(
    summary?.pending_sponsorship_amount || 0
  );

  const totalAdRevenue = useMemo(
    () =>
      earnings.reduce(
        (sum, item) => sum + Number(item?.ad_revenue || 0),
        0
      ),
    [earnings]
  );

  const totalMonetizedViews = useMemo(
    () =>
      earnings.reduce(
        (sum, item) => sum + Number(item?.monetized_views || 0),
        0
      ),
    [earnings]
  );

  const revenueData = useMemo(
    () =>
      earnings
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((item, index) => ({
          date: item?.date
            ? new Date(item.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })
            : `Period ${index + 1}`,
          revenue: Number(item?.estimated_revenue || 0),
          adRevenue: Number(item?.ad_revenue || 0),
        })),
    [earnings]
  );

  const monthlyRevenue = useMemo(() => {
    const monthly = {};

    earnings.forEach((item) => {
      if (!item?.date) return;

      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const label = date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });

      if (!monthly[key]) {
        monthly[key] = { month: label, revenue: 0 };
      }

      monthly[key].revenue += Number(item?.estimated_revenue || 0);
    });

    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, item]) => ({
        ...item,
        revenue: Number(item.revenue.toFixed(2)),
      }));
  }, [earnings]);

  const thisMonthRevenue = useMemo(() => {
    const now = new Date();

    return earnings.reduce((sum, item) => {
      if (!item?.date) return sum;

      const date = new Date(item.date);

      if (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      ) {
        return sum + Number(item?.estimated_revenue || 0);
      }

      return sum;
    }, 0);
  }, [earnings]);

  const revenueSources = useMemo(() => {
    const youtubeAds = totalAdRevenue;
    const otherRevenue = Math.max(totalRevenue - totalAdRevenue, 0);
    const total = youtubeAds + otherRevenue;

    if (total <= 0) {
      return [
        { name: "YouTube Ads", value: 0 },
        { name: "Other Revenue", value: 0 },
      ];
    }

    return [
      {
        name: "YouTube Ads",
        value: Number(((youtubeAds / total) * 100).toFixed(1)),
      },
      {
        name: "Other Revenue",
        value: Number(((otherRevenue / total) * 100).toFixed(1)),
      },
    ];
  }, [totalRevenue, totalAdRevenue]);

  const sourceColors = ["#173f6f", "#4e82b8"];

  const goTo = (path) => navigate(path);

  return (
    <div className="earnings-page">
      <aside className="earnings-sidebar">
        <div
          className="earnings-logo"
          onClick={() => goTo("/dashboard")}
        >
          <span className="logo-mark">✦</span>
          CreatorIQ
        </div>

        <nav className="earnings-navigation">
          <div
            className="earnings-nav-item"
            onClick={() => goTo("/dashboard")}
          >
            <span>▦</span> Dashboard
          </div>

          <div
            className="earnings-nav-item"
            onClick={() => goTo("/content")}
          >
            <span>▤</span> Content
          </div>

          <div
            className="earnings-nav-item"
            onClick={() => goTo("/audience")}
          >
            <span>◉</span> Audience
          </div>

          <div
            className="earnings-nav-item"
            onClick={() => goTo("/growth-trends")}
          >
            <span>↗</span> Growth & Trends
          </div>

          <div className="earnings-nav-item active">
            <span>₹</span> Earnings
          </div>

          <div
            className="earnings-nav-item"
            onClick={() => goTo("/sponsorships")}
          >
            <span>◇</span> Sponsorships
          </div>

          <div
            className="earnings-nav-item"
            onClick={() => goTo("/reports")}
          >
            <span>▧</span> Reports
          </div>

          <div
            className="earnings-nav-item"
            onClick={() => goTo("/instagram-analytics")}
          >
            <span>◎</span> Instagram Analytics
          </div>

          <div
            className="earnings-nav-item"
            onClick={() => goTo("/social-media")}
          >
            <span>◎</span> Social Media
          </div>

          <div
            className="earnings-nav-item"
            onClick={() => goTo("/settings")}
          >
            <span>⚙</span> Settings
          </div>
        </nav>
      </aside>

      <main className="earnings-main">
        <header className="earnings-header">
          <div>
            <div className="page-label">MONETIZATION</div>
            <h1>Earnings Analytics</h1>
            <p>Track your revenue and monetization performance.</p>
          </div>

          <div className="earnings-live-status">
            <span className="live-dot" />
            Revenue tracking
          </div>
        </header>

        {error && <div className="earnings-error">{error}</div>}

        {loading ? (
          <section className="earnings-loading">
            <div className="loading-spinner" />
            <h2>Loading earnings...</h2>
            <p>Fetching your monetization data.</p>
          </section>
        ) : (
          <>
            <section className="earnings-kpi-grid">
              <div className="earnings-kpi-card">
                <div className="earnings-kpi-top">
                  <span>TOTAL EARNED</span>
                  <div className="earnings-kpi-icon">₹</div>
                </div>
                <h2>{formatCurrency(totalRevenue)}</h2>
                <p>Platform estimated revenue + paid sponsorships</p>
              </div>

              <div className="earnings-kpi-card">
                <div className="earnings-kpi-top">
                  <span>AD REVENUE</span>
                  <div className="earnings-kpi-icon">◉</div>
                </div>
                <h2>{formatCurrency(totalAdRevenue)}</h2>
                <p>Estimated advertising revenue</p>
              </div>

              <div className="earnings-kpi-card">
                <div className="earnings-kpi-top">
                  <span>PAID SPONSORSHIPS</span>
                  <div className="earnings-kpi-icon">₹</div>
                </div>
                <h2>{formatCurrency(paidSponsorshipAmount)}</h2>
                <p>Payments received from brands</p>
              </div>

              <div className="earnings-kpi-card">
                <div className="earnings-kpi-top">
                  <span>PENDING SPONSORSHIPS</span>
                  <div className="earnings-kpi-icon">₹</div>
                </div>
                <h2>{formatCurrency(pendingSponsorshipAmount)}</h2>
                <p>Payments still awaiting receipt</p>
              </div>

              <div className="earnings-kpi-card">
                <div className="earnings-kpi-top">
                  <span>MONETIZED VIEWS</span>
                  <div className="earnings-kpi-icon">◉</div>
                </div>
                <h2>{formatNumber(totalMonetizedViews)}</h2>
                <p>Views generating revenue</p>
              </div>

              <div className="earnings-kpi-card">
                <div className="earnings-kpi-top">
                  <span>THIS MONTH</span>
                  <div className="earnings-kpi-icon">↗</div>
                </div>
                <h2>{formatCurrency(thisMonthRevenue)}</h2>
                <p>Current month platform revenue</p>
              </div>
            </section>

            {earnings.length === 0 && (
              <section className="earnings-empty-state">
                <div className="earnings-empty-icon">₹</div>
                <h2>No earnings data yet</h2>
                <p>
                  Creator {creatorId} does not have any earnings
                  records in the database yet.
                </p>
                <p>
                  Add earnings data through the backend API to
                  display revenue analytics here.
                </p>
              </section>
            )}

            <section className="earnings-chart-card">
              <div className="earnings-section-header">
                <div>
                  <div className="section-label">
                    REVENUE PERFORMANCE
                  </div>
                  <h2>Revenue Trend</h2>
                  <p>Track your estimated earnings over time.</p>
                </div>

                <div className="revenue-period">
                  {earnings.length} records
                </div>
              </div>

              <div className="earnings-chart">
                {revenueData.length === 0 ? (
                  <div className="empty-content">
                    No revenue data available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={revenueData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#d8e3f0"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#7890a6", fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: "#7890a6", fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Estimated Revenue"
                        stroke="#173f6f"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#173f6f" }}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="adRevenue"
                        name="Ad Revenue"
                        stroke="#4e82b8"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#4e82b8" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="earnings-two-column">
              <div className="earnings-card">
                <div className="earnings-card-header">
                  <div>
                    <div className="section-label">
                      REVENUE BREAKDOWN
                    </div>
                    <h2>Revenue Sources</h2>
                    <p>Breakdown of your revenue.</p>
                  </div>
                </div>

                <div className="revenue-source-chart">
                  <ResponsiveContainer width="100%" height={270}>
                    <PieChart>
                      <Pie
                        data={revenueSources}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {revenueSources.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={
                              sourceColors[index % sourceColors.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="revenue-source-list">
                  {revenueSources.map((item, index) => (
                    <div
                      className="revenue-source-row"
                      key={item.name}
                    >
                      <div>
                        <span
                          className="legend-dot"
                          style={{
                            background:
                              sourceColors[index % sourceColors.length],
                          }}
                        />
                        {item.name}
                      </div>
                      <strong>{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="earnings-card">
                <div className="earnings-card-header">
                  <div>
                    <div className="section-label">
                      MONTHLY PERFORMANCE
                    </div>
                    <h2>Monthly Revenue</h2>
                    <p>Revenue generated each month.</p>
                  </div>
                </div>

                <div className="monthly-chart">
                  {monthlyRevenue.length === 0 ? (
                    <div className="empty-content">
                      No monthly earnings data.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={monthlyRevenue}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 0,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#d8e3f0"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#7890a6", fontSize: 12 }}
                        />
                        <YAxis
                          tick={{ fill: "#7890a6", fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Bar
                          dataKey="revenue"
                          name="Revenue"
                          fill="#173f6f"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>

            <section className="sponsorship-section">
              <div className="earnings-section-header">
                <div>
                  <div className="section-label">EARNINGS DATA</div>
                  <h2>Earnings Records</h2>
                  <p>Revenue data received from the backend.</p>
                </div>
              </div>

              <div className="sponsorship-table">
                <div className="sponsorship-table-header">
                  <span>DATE</span>
                  <span>ESTIMATED REVENUE</span>
                  <span>AD REVENUE</span>
                  <span>MONETIZED VIEWS</span>
                </div>

                {earnings.length === 0 ? (
                  <div className="empty-content">
                    No earnings records found.
                  </div>
                ) : (
                  earnings
                    .slice()
                    .sort(
                      (a, b) => new Date(b.date) - new Date(a.date)
                    )
                    .map((item, index) => (
                      <div
                        className="sponsorship-row"
                        key={item.id || index}
                      >
                        <strong>
                          {item.date
                            ? new Date(item.date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </strong>
                        <span>
                          {formatCurrency(item.estimated_revenue)}
                        </span>
                        <strong>
                          {formatCurrency(item.ad_revenue)}
                        </strong>
                        <span>
                          {formatNumber(item.monetized_views)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </section>

            <section className="financial-insights">
              <div className="section-label">FINANCIAL INSIGHTS</div>
              <h2>Monetization Overview</h2>

              <div className="financial-insight-grid">
                <div className="financial-insight-item">
                  <div className="financial-icon">₹</div>
                  <div>
                    <strong>Revenue Tracking</strong>
                    <p>
                      CreatorIQ combines platform estimated revenue
                      with paid sponsorships in the earnings summary.
                    </p>
                  </div>
                </div>

                <div className="financial-insight-item">
                  <div className="financial-icon">◉</div>
                  <div>
                    <strong>Monetized Views</strong>
                    <p>
                      Monetized views measure how much content is
                      contributing to revenue.
                    </p>
                  </div>
                </div>

                <div className="financial-insight-item">
                  <div className="financial-icon">↗</div>
                  <div>
                    <strong>Pending Sponsorships</strong>
                    <p>
                      Pending sponsorship payments are tracked
                      separately from money already received.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
          
        )}
      </main>
    </div>
  );
}

export default Earnings;