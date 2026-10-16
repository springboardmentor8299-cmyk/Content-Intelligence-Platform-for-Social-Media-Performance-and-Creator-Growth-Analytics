
function NavigationPages({
  activePage,
  setActivePage,
  youtubeOverview,
  topVideos,
  growthHistory,
  engagementRate,
  newFollowers,
  growthRate,
}) {
  const subscribers =
    youtubeOverview?.subscriberCount ??
    youtubeOverview?.subscribers ??
    0;

  const totalViews =
    youtubeOverview?.viewCount ??
    youtubeOverview?.total_views ??
    0;

  const videoCount =
    youtubeOverview?.videoCount ??
    youtubeOverview?.video_count ??
    0;

  const totalLikes = topVideos.reduce(
    (sum, video) => sum + (video.likes || 0),
    0
  );

  const totalComments = topVideos.reduce(
    (sum, video) => sum + (video.comments || 0),
    0
  );

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return Number(value).toLocaleString("en-IN");
  };

  const pages = [
    "Dashboard",
    "Analytics",
    "Content",
    "Audience",
    "Growth",
    "Revenue",
    "Reports",
    "Profile",
  ];

  const pageDescription = {
    Analytics:
      "Track your creator performance, engagement and channel analytics.",
    Content:
      "Monitor your videos and identify your top-performing content.",
    Audience:
      "Understand your subscribers and audience growth.",
    Growth:
      "Track subscriber growth and historical channel performance.",
    Revenue:
      "Monitor monetization and creator revenue information.",
    Reports:
      "View a summary of your creator analytics and performance.",
    Profile:
      "View your CreatorIQ creator profile and connected platform.",
  };

  const renderPageContent = () => {
  switch (activePage) {
    case "Dashboard":
      return <Dashboard />;

    case "Analytics":
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span>Engagement Rate</span>
                <strong>{engagementRate.toFixed(2)}%</strong>
              </div>

              <div className="stat-card">
                <span>Total Views</span>
                <strong>{formatNumber(totalViews)}</strong>
              </div>

              <div className="stat-card">
                <span>Subscribers</span>
                <strong>{formatNumber(subscribers)}</strong>
              </div>

              <div className="stat-card">
                <span>Total Videos</span>
                <strong>{formatNumber(videoCount)}</strong>
              </div>
            </div>

            <div className="content-card">
              <h2>Analytics Overview</h2>
              <p>
                Your YouTube performance is calculated from the
                synced channel and video data.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Likes</span>
                  <strong>{formatNumber(totalLikes)}</strong>
                </div>

                <div className="stat-card">
                  <span>Comments</span>
                  <strong>{formatNumber(totalComments)}</strong>
                </div>

                <div className="stat-card">
                  <span>Videos Analysed</span>
                  <strong>{topVideos.length}</strong>
                </div>

                <div className="stat-card">
                  <span>Growth Snapshots</span>
                  <strong>{growthHistory.length}</strong>
                </div>
              </div>
            </div>
          </>
        );

      case "Content":
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span>Videos Analysed</span>
                <strong>{topVideos.length}</strong>
              </div>

              <div className="stat-card">
                <span>Total Views</span>
                <strong>{formatNumber(totalViews)}</strong>
              </div>

              <div className="stat-card">
                <span>Total Likes</span>
                <strong>{formatNumber(totalLikes)}</strong>
              </div>

              <div className="stat-card">
                <span>Total Comments</span>
                <strong>{formatNumber(totalComments)}</strong>
              </div>
            </div>

            <div className="content-card">
              <h2>Top Performing Content</h2>

              {topVideos.length === 0 ? (
                <p>No video data available yet.</p>
              ) : (
                <div className="top-videos-table">
                  {topVideos.map((video, index) => (
                    <div
                      className="video-row"
                      key={video.video_id || video.id || index}
                    >
                      <span>{index + 1}</span>

                      <strong>
                        {video.title || "Untitled video"}
                      </strong>

                      <span>
                        {formatNumber(video.views)} views
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );

      case "Audience":
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span>Subscribers</span>
                <strong>{formatNumber(subscribers)}</strong>
              </div>

              <div className="stat-card">
                <span>New Followers</span>
                <strong>{formatNumber(newFollowers)}</strong>
              </div>

              <div className="stat-card">
                <span>Growth Rate</span>
                <strong>{growthRate.toFixed(2)}%</strong>
              </div>

              <div className="stat-card">
                <span>Returning Audience</span>
                <strong>—</strong>
              </div>
            </div>

            <div className="content-card">
              <h2>Audience Overview</h2>
              <p>
                Current subscriber information is based on your
                synced YouTube channel.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Current Subscribers</span>
                  <strong>{formatNumber(subscribers)}</strong>
                </div>

                <div className="stat-card">
                  <span>New Subscribers</span>
                  <strong>{formatNumber(newFollowers)}</strong>
                </div>
              </div>
            </div>
          </>
        );

      case "Growth":
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span>Current Subscribers</span>
                <strong>{formatNumber(subscribers)}</strong>
              </div>

              <div className="stat-card">
                <span>Growth Rate</span>
                <strong>{growthRate.toFixed(2)}%</strong>
              </div>

              <div className="stat-card">
                <span>Total Views</span>
                <strong>{formatNumber(totalViews)}</strong>
              </div>

              <div className="stat-card">
                <span>Videos</span>
                <strong>{formatNumber(videoCount)}</strong>
              </div>
            </div>

            <div className="content-card">
              <h2>Growth History</h2>

              {growthHistory.length === 0 ? (
                <p>
                  No growth history available yet. Sync the
                  channel again to create a snapshot.
                </p>
              ) : (
                <div className="growth-history">
                  {growthHistory.map((item, index) => (
                    <div className="growth-row" key={index}>
                      <span>
                        {item.synced_at
                          ? new Date(
                              item.synced_at
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </span>

                      <strong>
                        {formatNumber(item.subscribers)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );

      case "Revenue":
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span>Estimated Revenue</span>
                <strong>—</strong>
              </div>

              <div className="stat-card">
                <span>Revenue Source</span>
                <strong>YouTube</strong>
              </div>

              <div className="stat-card">
                <span>Total Views</span>
                <strong>{formatNumber(totalViews)}</strong>
              </div>

              <div className="stat-card">
                <span>Subscribers</span>
                <strong>{formatNumber(subscribers)}</strong>
              </div>
            </div>

            <div className="content-card">
              <h2>Revenue Overview</h2>

              <p>
                Revenue data is prepared as a separate analytics
                module. YouTube revenue requires the appropriate
                monetization/API permissions.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Ad Revenue</span>
                  <strong>—</strong>
                </div>

                <div className="stat-card">
                  <span>Sponsorships</span>
                  <strong>—</strong>
                </div>

                <div className="stat-card">
                  <span>Affiliate Revenue</span>
                  <strong>—</strong>
                </div>

                <div className="stat-card">
                  <span>Subscriptions</span>
                  <strong>—</strong>
                </div>
              </div>
            </div>
          </>
        );

      case "Reports":
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span>Channel</span>
                <strong>
                  {youtubeOverview?.title || "—"}
                </strong>
              </div>

              <div className="stat-card">
                <span>Videos Analysed</span>
                <strong>{topVideos.length}</strong>
              </div>

              <div className="stat-card">
                <span>Growth Snapshots</span>
                <strong>{growthHistory.length}</strong>
              </div>

              <div className="stat-card">
                <span>Platform</span>
                <strong>YouTube</strong>
              </div>
            </div>

            <div className="content-card">
              <h2>Creator Analytics Report</h2>

              <p>
                This report summarizes the currently synchronized
                YouTube creator data.
              </p>

              <div className="report-list">
                <div>
                  <span>Subscribers</span>
                  <strong>{formatNumber(subscribers)}</strong>
                </div>

                <div>
                  <span>Total Views</span>
                  <strong>{formatNumber(totalViews)}</strong>
                </div>

                <div>
                  <span>Engagement Rate</span>
                  <strong>
                    {engagementRate.toFixed(2)}%
                  </strong>
                </div>

                <div>
                  <span>Growth Rate</span>
                  <strong>{growthRate.toFixed(2)}%</strong>
                </div>
              </div>
            </div>
          </>
        );

      case "Profile":
        return (
          <>
            <div className="profile-page-card">
              <div className="profile-large-avatar">J</div>

              <h2>jayashree</h2>
              <p>Creator</p>

              <div className="profile-details">
                <div>
                  <span>Username</span>
                  <strong>jayashree</strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>Creator</strong>
                </div>

                <div>
                  <span>Connected Platform</span>
                  <strong>YouTube</strong>
                </div>

                <div>
                  <span>Account Status</span>
                  <strong>Active</strong>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">C</div>
          <span>CreatorIQ</span>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav-menu">
          {pages.map((page) => (
            <button
              key={page}
              className={`nav-item ${
                activePage === page ? "active" : ""
              }`}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="profile-avatar">J</div>

          <div>
            <strong>jayashree</strong>
            <span>creator</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => setActivePage("Dashboard")}
        >
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Overview / {activePage}
            </div>

            <h1>{activePage}</h1>

            <p>
              {pageDescription[activePage] ||
                "Track, analyze and grow your creator presence."}
            </p>
          </div>

          <div className="date-box">
            September 2026
          </div>
        </header>

        <section className="page-content">
          {renderPageContent()}
        </section>
      </main>
    </div>
  );
}

export default NavigationPages;