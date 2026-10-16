import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./App.css";

const API_URL = "http://127.0.0.1:8001";

function App() {
  const [engagement, setEngagement] = useState(null);
  const [audience, setAudience] = useState(null);
  const [trends, setTrends] = useState(null);
  const [socialMedia, setSocialMedia] = useState(null);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [youtubeOverview, setYoutubeOverview] = useState(null);
  const [topVideos, setTopVideos] = useState([]);
  const [growthHistory, setGrowthHistory] = useState([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [
          engagementResponse,
          audienceResponse,
          trendsResponse,
          socialMediaResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/analytics/engagement?likes=250&comments=50&shares=25&views=5000`
          ),
          fetch(
            `${API_URL}/analytics/audience?followers=1000&new_followers=100&returning_followers=50`
          ),
          fetch(
            `${API_URL}/analytics/trends?data=100,120,150,180,200`
          ),
          fetch(`${API_URL}/analytics/social-media`),
        ]);

        if (
          !engagementResponse.ok ||
          !audienceResponse.ok ||
          !trendsResponse.ok ||
          !socialMediaResponse.ok
        ) {
          throw new Error("API request failed");
        }

        setEngagement(await engagementResponse.json());
        setAudience(await audienceResponse.json());
        setTrends(await trendsResponse.json());
        setSocialMedia(await socialMediaResponse.json());
      } catch (err) {
        console.error("Analytics API error:", err);
        setError("API Error: " + err.message);
      }
    };

    loadAnalytics();
  }, []);

  const searchYouTube = async () => {
    if (!searchQuery.trim()) {
      setYoutubeError("Enter a channel name to search.");
      return;
    }

    try {
      setYoutubeLoading(true);
      setYoutubeError("");
      setSearchResults([]);

      const response = await fetch(
        `${API_URL}/youtube/search?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("YouTube channel search failed");
      }

      const data = await response.json();

      setSearchResults(data.results || []);
    } catch (err) {
      console.error("YouTube search error:", err);
      setYoutubeError(err.message);
    } finally {
      setYoutubeLoading(false);
    }
  };

  const loadYouTubeChannel = async (channelId) => {
    try {
      setYoutubeLoading(true);
      setYoutubeError("");

      const [
        overviewResponse,
        videosResponse,
        growthResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/youtube/channel/${channelId}/overview`
        ),
        fetch(
          `${API_URL}/youtube/channel/${channelId}/top-videos`
        ),
        fetch(
          `${API_URL}/youtube/stored/${channelId}/growth`
        ),
      ]);

      if (!overviewResponse.ok) {
        throw new Error("Could not load channel overview");
      }

      if (!videosResponse.ok) {
        throw new Error("Could not load top videos");
      }

      if (!growthResponse.ok) {
        throw new Error("Could not load growth history");
      }

      const overview = await overviewResponse.json();
      const videos = await videosResponse.json();
      const growth = await growthResponse.json();

      setSelectedChannel(channelId);
      setYoutubeOverview(overview);
      setTopVideos(videos.videos || []);
      setGrowthHistory(growth.history || []);
      setSearchResults([]);
    } catch (err) {
      console.error("YouTube channel error:", err);
      setYoutubeError(err.message);
    } finally {
      setYoutubeLoading(false);
    }
  };

  const syncYouTubeChannel = async () => {
    if (!selectedChannel) {
      return;
    }

    try {
      setYoutubeLoading(true);
      setYoutubeError("");

      const response = await fetch(
        `${API_URL}/youtube/channel/${selectedChannel}/sync`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("YouTube channel sync failed");
      }

      await response.json();

      await loadYouTubeChannel(selectedChannel);
    } catch (err) {
      console.error("YouTube sync error:", err);
      setYoutubeError(err.message);
      setYoutubeLoading(false);
    }
  };

  const trendData =
    trends?.data?.map((value, index) => ({
      name: `Day ${index + 1}`,
      value,
    })) || [];

  const platformData = socialMedia?.platforms || [];

  const youtubeGrowthData = growthHistory.map((item) => ({
    date: new Date(item.synced_at).toLocaleDateString(),
    subscribers: item.subscribers || 0,
    views: item.total_views || 0,
    videos: item.video_count || 0,
  }));

  const formatNumber = (value) => {
    if (value === undefined || value === null) {
      return "0";
    }

    return Number(value).toLocaleString("en-IN");
  };

  const engagementRate =
    youtubeOverview && youtubeOverview.total_views
      ? (
          ((topVideos.reduce(
            (sum, video) =>
              sum +
              Number(video.likes || 0) +
              Number(video.comments || 0),
            0
          ) /
            Math.max(
              topVideos.reduce(
                (sum, video) => sum + Number(video.views || 0),
                0
              ),
              1
            )) *
            100)
        ).toFixed(2)
      : engagement?.engagement_rate ?? 0;

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <h2>
            Creator<span>IQ</span>
          </h2>
        </div>

        <p className="nav-title">Workspace</p>

        <button className="nav-item active">
          Dashboard
        </button>

        <button className="nav-item">
          Analytics
        </button>

        <button className="nav-item">
          Content
        </button>

        <button className="nav-item">
          Audience
        </button>

        <button className="nav-item">
          Growth
        </button>

        <button className="nav-item">
          Revenue
        </button>

        <button className="nav-item">
          Reports
        </button>

        <button className="nav-item">
          Profile
        </button>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="profile-avatar">J</div>

            <div className="profile-info">
              <p className="profile-name">jayashree</p>
              <p className="profile-role">creator</p>
            </div>
          </div>

          <button className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <div className="top-header">
          <div className="breadcrumb">
            Overview / <strong>Dashboard</strong>
          </div>

          <div className="header-profile">
            <div className="header-avatar">J</div>
            <span>jayashree</span>
          </div>
        </div>

        {/* WELCOME */}
        <section className="welcome-section">
          <div>
            <h1>Hi, jayashree! 👋</h1>
            <p>
              Track, analyze and grow your creator presence,
              all in one place.
            </p>
          </div>

          <div className="date-box">
            September 2026
          </div>
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {youtubeError && (
          <div className="error-message">
            {youtubeError}
          </div>
        )}

        {/* SEARCH */}
        <section className="search-card">
          <h3 className="search-title">
            Find a YouTube Creator
          </h3>

          <div className="search-row">
            <input
              className="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchYouTube();
                }
              }}
              placeholder="Search YouTube channel..."
            />

            <button
              className="primary-btn"
              onClick={searchYouTube}
              disabled={youtubeLoading}
            >
              {youtubeLoading ? "Loading..." : "Search"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((channel) => (
                <div
                  className="search-result"
                  key={channel.channel_id}
                >
                  {channel.thumbnail && (
                    <img
                      className="channel-thumbnail"
                      src={channel.thumbnail}
                      alt={channel.title}
                    />
                  )}

                  <div className="search-result-info">
                    <h4>{channel.title}</h4>

                    <p>
                      {channel.description
                        ? channel.description.substring(
                            0,
                            150
                          )
                        : "No description"}
                    </p>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      loadYouTubeChannel(
                        channel.channel_id
                      )
                    }
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CHANNEL */}
        {youtubeOverview && (
          <>
            <section className="channel-header">
              <div className="channel-info">
                {youtubeOverview.thumbnail && (
                  <img
                    className="channel-avatar"
                    src={youtubeOverview.thumbnail}
                    alt={youtubeOverview.title}
                  />
                )}

                <div>
                  <h2>{youtubeOverview.title}</h2>

                  <p>
                    Channel ID:{" "}
                    {youtubeOverview.channel_id}
                  </p>
                </div>
              </div>

              <button
                className="primary-btn"
                onClick={syncYouTubeChannel}
                disabled={youtubeLoading}
              >
                {youtubeLoading
                  ? "Syncing..."
                  : "Sync Channel"}
              </button>
            </section>

            {/* KPI CARDS */}
            <section className="kpi-grid">
              <div className="kpi-card">
                <p className="kpi-label">
                  Subscribers
                </p>

                <p className="kpi-value">
                  {formatNumber(
                    youtubeOverview.subscribers
                  )}
                </p>

                <p className="kpi-change">
                  ↑ Live YouTube data
                </p>
              </div>

              <div className="kpi-card">
                <p className="kpi-label">
                  Total Views
                </p>

                <p className="kpi-value">
                  {formatNumber(
                    youtubeOverview.total_views
                  )}
                </p>

                <p className="kpi-change">
                  ↑ Channel lifetime views
                </p>
              </div>

              <div className="kpi-card">
                <p className="kpi-label">
                  Videos
                </p>

                <p className="kpi-value">
                  {formatNumber(
                    youtubeOverview.video_count
                  )}
                </p>

                <p className="kpi-change">
                  ↑ Published content
                </p>
              </div>

              <div className="kpi-card">
                <p className="kpi-label">
                  Engagement Rate
                </p>

                <p className="kpi-value">
                  {engagementRate}%
                </p>

                <p className="kpi-change">
                  ↑ Likes + comments
                </p>
              </div>
            </section>

            {/* CHARTS */}
            <div className="two-column">
              <section className="card">
                <h3 className="card-title">
                  Views & Growth
                </h3>

                <p className="card-subtitle">
                  YouTube channel growth history
                </p>

                <div className="chart-container">
                  {youtubeGrowthData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={youtubeGrowthData}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis dataKey="date" />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="subscribers"
                          name="Subscribers"
                          stroke="#635bff"
                          strokeWidth={2}
                        />

                        <Line
                          type="monotone"
                          dataKey="views"
                          name="Views"
                          stroke="#16a34a"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state">
                      No growth history yet.
                      <br />
                      Click "Sync Channel" to create a
                      snapshot.
                    </div>
                  )}
                </div>
              </section>

              <section className="card">
                <h3 className="card-title">
                  Channel Overview
                </h3>

                <p className="card-subtitle">
                  Current creator information
                </p>

                <div className="stat-grid">
                  <div className="stat-box">
                    <p>Subscribers</p>
                    <strong>
                      {formatNumber(
                        youtubeOverview.subscribers
                      )}
                    </strong>
                  </div>

                  <div className="stat-box">
                    <p>Total Views</p>
                    <strong>
                      {formatNumber(
                        youtubeOverview.total_views
                      )}
                    </strong>
                  </div>

                  <div className="stat-box">
                    <p>Videos</p>
                    <strong>
                      {formatNumber(
                        youtubeOverview.video_count
                      )}
                    </strong>
                  </div>

                  <div className="stat-box">
                    <p>Created</p>
                    <strong>
                      {youtubeOverview.published_at
                        ? new Date(
                            youtubeOverview.published_at
                          ).toLocaleDateString()
                        : "-"}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            {/* ENGAGEMENT + AUDIENCE */}
            <div className="two-column">
              <section className="card">
                <h3 className="card-title">
                  Engagement Overview
                </h3>

                <p className="card-subtitle">
                  Current engagement metrics
                </p>

                <div className="stat-grid">
                  <div className="stat-box">
                    <p>Total Engagement</p>
                    <strong>
  {formatNumber(
    topVideos.reduce(
      (sum, video) =>
        sum +
        Number(video.likes || 0) +
        Number(video.comments || 0),
      0
    )
  )}
</strong>
                  </div>

                  <div className="stat-box">
  <p>Engagement Rate</p>
  <strong>{engagementRate}%</strong>
</div>

<div className="stat-box">
  <p>Likes</p>
  <strong>
    {formatNumber(
      topVideos.reduce(
        (sum, video) => sum + Number(video.likes || 0),
        0
      )
    )}
  </strong>
</div>

                  <div className="stat-box">
                    <p>Comments</p>
                    <strong>
  {formatNumber(
    topVideos.reduce(
      (sum, video) => sum + Number(video.comments || 0),
      0
    )
  )}
</strong>
                  </div>
                </div>
              </section>

              <section className="card">
                <h3 className="card-title">
                  Audience Overview
                </h3>

                <p className="card-subtitle">
                  Audience growth indicators
                </p>

                <div className="stat-grid">
                  <div className="stat-box">
                    <p>Followers</p>
                    <strong>
  {formatNumber(
    youtubeOverview?.subscribers
  )}
</strong>
                  </div>

                  <div className="stat-box">
                    <p>New Followers</p>
                    <strong>
  {formatNumber(
    growthHistory.length > 1
      ? Math.max(
          0,
          Number(
            growthHistory[growthHistory.length - 1].subscribers || 0
          ) -
            Number(
              growthHistory[growthHistory.length - 2].subscribers || 0
            )
        )
      : 0
  )}
</strong>
                  </div>

                  <div className="stat-box">
                    <p>Returning</p>
                    <strong>—</strong>
                  </div>

                  <div className="stat-box">
                    <p>Growth Rate</p>
                    <strong>
  {growthHistory.length > 1 &&
  Number(growthHistory[growthHistory.length - 2].subscribers || 0) > 0
    ? (
        (
          (Number(
            growthHistory[growthHistory.length - 1].subscribers || 0
          ) -
            Number(
              growthHistory[growthHistory.length - 2].subscribers || 0
            )) /
          Number(
            growthHistory[growthHistory.length - 2].subscribers || 0
          )
        ) *
        100
      ).toFixed(2)
    : 0}
  %
</strong>
                  </div>
                </div>
              </section>
            </div>

            {/* TOP VIDEOS */}
            <section className="section-card">
              <div className="section-card-header">
                <h3 className="card-title">
                  Top Performing Videos
                </h3>

                <p className="card-subtitle">
                  Your highest-performing YouTube content
                </p>
              </div>

              {topVideos.length > 0 ? (
                <div className="video-table-wrapper">
                  <table className="video-table">
                    <thead>
                      <tr>
                        <th>Video</th>
                        <th>Views</th>
                        <th>Likes</th>
                        <th>Comments</th>
                        <th>Engagement</th>
                        <th>Published</th>
                      </tr>
                    </thead>

                    <tbody>
                      {topVideos.map((video, index) => {
                        const videoEngagement =
                          Number(video.likes || 0) +
                          Number(video.comments || 0);

                        return (
                          <tr key={video.video_id}>
                            <td>
                              <div className="video-cell">
                                <span className="video-rank">
                                  {index + 1}
                                </span>

                                {video.thumbnail && (
                                  <img
                                    className="video-thumbnail"
                                    src={video.thumbnail}
                                    alt={video.title}
                                  />
                                )}

                                <span className="video-title">
                                  {video.title}
                                </span>
                              </div>
                            </td>

                            <td>
                              {formatNumber(
                                video.views
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                video.likes
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                video.comments
                              )}
                            </td>

                            <td>
                              {formatNumber(
                                videoEngagement
                              )}
                            </td>

                            <td>
                              {video.published_at
                                ? new Date(
                                    video.published_at
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  No top videos available.
                </div>
              )}
            </section>
          </>
        )}

        {/* SOCIAL MEDIA CHART */}
        {platformData.length > 0 && (
          <section className="card" style={{ marginBottom: "20px" }}>
            <h3 className="card-title">
              Social Media Performance
            </h3>

            <p className="card-subtitle">
              Followers and views across platforms
            </p>

            <div className="chart-container">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={platformData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="platform" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="followers"
                    name="Followers"
                    fill="#635bff"
                  />

                  <Bar
                    dataKey="views"
                    name="Views"
                    fill="#16a34a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* AI INSIGHTS */}
        <section className="card" style={{ marginBottom: "20px" }}>
          <h3 className="card-title">
            AI Insights
          </h3>

          <p className="card-subtitle">
            Highlights based on your creator analytics
          </p>

          <div className="insights-list">
            <div className="insight">
              <strong>Content Performance</strong>
              Your top videos can help identify which
              content themes are generating the most
              attention.
            </div>

            <div className="insight">
              <strong>Engagement</strong>
              Engagement can be tracked using likes,
              comments and views to understand audience
              interaction.
            </div>

            <div className="insight">
              <strong>Growth</strong>
              Continue syncing your channel regularly to
              build a historical growth timeline.
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div
          style={{
            textAlign: "center",
            color: "#92949d",
            fontSize: "11px",
            padding: "15px",
          }}
        >
          CreatorIQ Analytics • Milestone 2
        </div>
      </main>
    </div>
  );
}

export default App;