import { useEffect, useMemo, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useNavigate } from "react-router-dom";

import "./social-media.css";

function SocialMedia() {
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [videos, setVideos] = useState([]);

  // =====================================================
  // ACTIVE PLATFORM
  // =====================================================

  const [activePlatform, setActivePlatform] = useState(
    localStorage.getItem("activeSocialPlatform") || "youtube"
  );

  // =====================================================
  // X ACCOUNT
  // =====================================================

  const [xAccount, setXAccount] = useState(null);
  const [xData, setXData] = useState(null);
  const [xLoading, setXLoading] = useState(false);

  // =====================================================
  // LOAD SELECTED CREATOR
  // =====================================================

  useEffect(() => {
    const loadCreatorData = () => {
      try {
        const savedChannel = localStorage.getItem(
          "selectedYoutubeChannel"
        );

        const savedAnalytics = localStorage.getItem(
          "selectedYoutubeAnalytics"
        );

        const savedVideos = localStorage.getItem(
          "selectedYoutubeVideos"
        );

        setChannel(
          savedChannel ? JSON.parse(savedChannel) : null
        );

        setAnalytics(
          savedAnalytics ? JSON.parse(savedAnalytics) : null
        );

        setVideos(
          savedVideos ? JSON.parse(savedVideos) : []
        );
      } catch (error) {
        console.error(
          "Error loading creator data:",
          error
        );

        setChannel(null);
        setAnalytics(null);
        setVideos([]);
      }
    };

    loadCreatorData();

    window.addEventListener(
      "selectedYoutubeChannelChanged",
      loadCreatorData
    );

    window.addEventListener(
      "storage",
      loadCreatorData
    );

    return () => {
      window.removeEventListener(
        "selectedYoutubeChannelChanged",
        loadCreatorData
      );

      window.removeEventListener(
        "storage",
        loadCreatorData
      );
    };
  }, []);

  // =====================================================
  // LOAD X ACCOUNT + X DATA
  // =====================================================

  useEffect(() => {
    const loadXAccount = () => {
      try {
        const connected =
          localStorage.getItem("xConnected") === "true";

        const savedXAccount =
          localStorage.getItem("selectedXAccount");

        const savedXData =
          localStorage.getItem("selectedXData");

        if (connected) {
          setXAccount(
            savedXAccount
              ? JSON.parse(savedXAccount)
              : null
          );

          setXData(
            savedXData
              ? JSON.parse(savedXData)
              : null
          );
        } else {
          setXAccount(null);
          setXData(null);
        }
      } catch (error) {
        console.error(
          "Error loading X account:",
          error
        );

        setXAccount(null);
        setXData(null);
      } finally {
        setXLoading(false);
      }
    };

    loadXAccount();

    window.addEventListener(
      "selectedXAccountChanged",
      loadXAccount
    );

    window.addEventListener(
      "activeSocialPlatformChanged",
      loadXAccount
    );

    window.addEventListener(
      "storage",
      loadXAccount
    );

    return () => {
      window.removeEventListener(
        "selectedXAccountChanged",
        loadXAccount
      );

      window.removeEventListener(
        "activeSocialPlatformChanged",
        loadXAccount
      );

      window.removeEventListener(
        "storage",
        loadXAccount
      );
    };
  }, []);

  // =====================================================
  // ACTIVE PLATFORM CHANGE
  // =====================================================

  useEffect(() => {
    const handlePlatformChange = () => {
      const platform =
        localStorage.getItem("activeSocialPlatform") ||
        "youtube";

      setActivePlatform(platform);
    };

    handlePlatformChange();

    window.addEventListener(
      "activeSocialPlatformChanged",
      handlePlatformChange
    );

    window.addEventListener(
      "storage",
      handlePlatformChange
    );

    return () => {
      window.removeEventListener(
        "activeSocialPlatformChanged",
        handlePlatformChange
      );

      window.removeEventListener(
        "storage",
        handlePlatformChange
      );
    };
  }, []);

  // =====================================================
  // SAFE NUMBER
  // =====================================================

  const getNumber = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isFinite(Number(value))
      ) {
        return Number(value);
      }
    }

    return 0;
  };

  // =====================================================
  // CREATOR DATA
  // =====================================================

  const channelName =
    channel?.channel_name ||
    channel?.title ||
    channel?.name ||
    "No channel selected";

  const channelId =
    channel?.channel_id ||
    channel?.id ||
    channel?.channelId ||
    "";

  const subscribers = getNumber(
    channel?.subscribers,
    channel?.subscriber_count,
    channel?.subscriberCount,
    analytics?.subscribers,
    analytics?.subscriber_count,
    analytics?.subscriberCount
  );

  const totalViews = getNumber(
    channel?.total_views,
    channel?.views,
    channel?.view_count,
    channel?.viewCount,
    analytics?.total_views,
    analytics?.views,
    analytics?.view_count
  );

  const totalVideos = getNumber(
    channel?.video_count,
    channel?.videos,
    channel?.videoCount
  );

  const thumbnail =
    channel?.thumbnail ||
    channel?.thumbnail_url ||
    channel?.thumbnailUrl ||
    "";

  // =====================================================
  // CONNECTION STATUS
  // =====================================================

  const youtubeStoredConnected =
    localStorage.getItem("youtubeConnected") === "true" ||
    Boolean(channel);

  const xStoredConnected =
    localStorage.getItem("xConnected") === "true";

  /*
    Only ONE platform is considered connected/active
    at a time.

    If X is active:
    YouTube -> Disconnected

    If YouTube is active:
    X -> Disconnected
  */

  const youtubeConnected =
    activePlatform === "youtube" &&
    youtubeStoredConnected;

  const xConnected =
    activePlatform === "x" &&
    xStoredConnected;

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (number) => {
    const value = Number(number) || 0;

    if (value >= 1000000000) {
      return (
        (value / 1000000000).toFixed(1) +
        "B"
      );
    }

    if (value >= 1000000) {
      return (
        (value / 1000000).toFixed(1) +
        "M"
      );
    }

    if (value >= 1000) {
      return (
        (value / 1000).toFixed(1) +
        "K"
      );
    }

    return value.toLocaleString();
  };

  // =====================================================
  // SORT VIDEOS
  // =====================================================

  const sortedVideos = useMemo(() => {
    if (!Array.isArray(videos)) {
      return [];
    }

    return videos
      .slice()
      .sort((a, b) => {
        const dateA = a?.published_at
          ? new Date(
              a.published_at
            ).getTime()
          : 0;

        const dateB = b?.published_at
          ? new Date(
              b.published_at
            ).getTime()
          : 0;

        return dateB - dateA;
      });
  }, [videos]);

  // =====================================================
  // VIDEO METRICS
  // =====================================================

  const videoMetrics = useMemo(() => {
    if (sortedVideos.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        engagementRate: 0,
        growthRate: 0,
      };
    }

    const totalVideoViews =
      sortedVideos.reduce(
        (sum, video) =>
          sum +
          getNumber(
            video?.views,
            video?.view_count,
            video?.viewCount
          ),
        0
      );

    const totalLikes =
      sortedVideos.reduce(
        (sum, video) =>
          sum +
          getNumber(
            video?.likes,
            video?.like_count,
            video?.likeCount
          ),
        0
      );

    const totalComments =
      sortedVideos.reduce(
        (sum, video) =>
          sum +
          getNumber(
            video?.comments,
            video?.comment_count,
            video?.commentCount
          ),
        0
      );

    const engagementRate =
      totalVideoViews > 0
        ? ((totalLikes + totalComments) /
            totalVideoViews) *
          100
        : 0;

    const recentVideos =
      sortedVideos.slice(0, 3);

    const olderVideos =
      sortedVideos.slice(3, 6);

    const recentViews =
      recentVideos.reduce(
        (sum, video) =>
          sum +
          getNumber(
            video?.views,
            video?.view_count,
            video?.viewCount
          ),
        0
      );

    const olderViews =
      olderVideos.reduce(
        (sum, video) =>
          sum +
          getNumber(
            video?.views,
            video?.view_count,
            video?.viewCount
          ),
        0
      );

    const recentAverage =
      recentVideos.length > 0
        ? recentViews /
          recentVideos.length
        : 0;

    const olderAverage =
      olderVideos.length > 0
        ? olderViews /
          olderVideos.length
        : 0;

    let growthRate = 0;

    if (
      recentAverage > 0 &&
      olderAverage > 0
    ) {
      growthRate =
        ((recentAverage -
          olderAverage) /
          olderAverage) *
        100;
    } else if (
      recentAverage > 0 &&
      olderAverage === 0
    ) {
      growthRate = 100;
    }

    return {
      totalViews: totalVideoViews,
      totalLikes,
      totalComments,
      engagementRate,
      growthRate,
    };
  }, [sortedVideos]);

  // =====================================================
  // YOUTUBE ENGAGEMENT RATE
  // =====================================================

  const engagementRate = useMemo(() => {
    const apiRate = getNumber(
      analytics?.engagement_rate,
      analytics?.engagementRate,
      channel?.engagement_rate,
      channel?.engagementRate
    );

    if (apiRate > 0) {
      return apiRate;
    }

    return videoMetrics.engagementRate;
  }, [
    analytics,
    channel,
    videoMetrics.engagementRate,
  ]);

  // =====================================================
  // YOUTUBE GROWTH
  // =====================================================

  const growthRate = Number.isFinite(
    videoMetrics.growthRate
  )
    ? videoMetrics.growthRate
    : 0;

  // =====================================================
  // X DATA
  // =====================================================

  const xName =
    xAccount?.name ||
    xAccount?.display_name ||
    xAccount?.displayName ||
    xData?.account?.name ||
    xData?.account?.display_name ||
    xData?.account?.displayName ||
    "X Account";

  const rawXUsername =
    xAccount?.username ||
    xData?.account?.username ||
    xData?.username ||
    "";

  const xUsername = rawXUsername
    ? rawXUsername.startsWith("@")
      ? rawXUsername
      : `@${rawXUsername}`
    : "X account";

  const xFollowers = getNumber(
    xAccount?.public_metrics?.followers_count,
    xAccount?.followers,
    xData?.account?.public_metrics?.followers_count,
    xData?.account?.followers,
    xData?.followers
  );

  const xFollowing = getNumber(
    xAccount?.public_metrics?.following_count,
    xAccount?.following,
    xData?.account?.public_metrics?.following_count,
    xData?.account?.following,
    xData?.following
  );

  const xTweetCount = getNumber(
    xAccount?.public_metrics?.tweet_count,
    xAccount?.posts,
    xData?.account?.public_metrics?.tweet_count,
    xData?.account?.posts,
    xData?.posts
  );

  const xProfileImage =
    xAccount?.profile_image_url ||
    xAccount?.profile_image ||
    xData?.account?.profile_image_url ||
    xData?.account?.profile_image ||
    "";

  // =====================================================
  // X POSTS
  // =====================================================

  const xPosts = useMemo(() => {
    if (!xData) {
      return [];
    }

    return (
      xData?.recent_posts ||
      xData?.recentPosts ||
      xData?.posts ||
      []
    );
  }, [xData]);

  // =====================================================
  // X METRICS
  // =====================================================

  const xMetrics = useMemo(() => {
    if (!Array.isArray(xPosts) || xPosts.length === 0) {
      return {
        impressions: 0,
        likes: 0,
        replies: 0,
        reposts: 0,
        engagementRate: 0,
        growthRate: 0,
      };
    }

    const impressions = xPosts.reduce(
      (sum, post) =>
        sum +
        getNumber(
          post?.public_metrics?.impression_count,
          post?.public_metrics?.impressions,
          post?.impressions,
          post?.impression_count,
          post?.views
        ),
      0
    );

    const likes = xPosts.reduce(
      (sum, post) =>
        sum +
        getNumber(
          post?.public_metrics?.like_count,
          post?.likes
        ),
      0
    );

    const replies = xPosts.reduce(
      (sum, post) =>
        sum +
        getNumber(
          post?.public_metrics?.reply_count,
          post?.replies,
          post?.comments
        ),
      0
    );

    const reposts = xPosts.reduce(
      (sum, post) =>
        sum +
        getNumber(
          post?.public_metrics?.retweet_count,
          post?.public_metrics?.repost_count,
          post?.reposts,
          post?.retweets
        ),
      0
    );

    const engagementRate =
      impressions > 0
        ? ((likes + replies + reposts) /
            impressions) *
          100
        : 0;

    const recentPosts =
      xPosts.slice(0, 3);

    const olderPosts =
      xPosts.slice(3, 6);

    const getPostImpressions = (post) =>
      getNumber(
        post?.public_metrics?.impression_count,
        post?.public_metrics?.impressions,
        post?.impressions,
        post?.impression_count,
        post?.views
      );

    const recentImpressions =
      recentPosts.reduce(
        (sum, post) =>
          sum +
          getPostImpressions(post),
        0
      );

    const olderImpressions =
      olderPosts.reduce(
        (sum, post) =>
          sum +
          getPostImpressions(post),
        0
      );

    const recentAverage =
      recentPosts.length > 0
        ? recentImpressions /
          recentPosts.length
        : 0;

    const olderAverage =
      olderPosts.length > 0
        ? olderImpressions /
          olderPosts.length
        : 0;

    let growthRate = 0;

    if (
      recentAverage > 0 &&
      olderAverage > 0
    ) {
      growthRate =
        ((recentAverage -
          olderAverage) /
          olderAverage) *
        100;
    } else if (
      recentAverage > 0 &&
      olderAverage === 0
    ) {
      growthRate = 100;
    }

    return {
      impressions,
      likes,
      replies,
      reposts,
      engagementRate,
      growthRate,
    };
  }, [xPosts]);

  // =====================================================
  // X MONTHLY DATA
  // =====================================================

  const xGrowthData = useMemo(() => {
    if (
      !Array.isArray(xPosts) ||
      xPosts.length === 0
    ) {
      return [];
    }

    const months = {};

    xPosts.forEach((post) => {
      const createdAt =
        post?.created_at ||
        post?.createdAt ||
        post?.date;

      if (!createdAt) {
        return;
      }

      const date = new Date(createdAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const monthKey =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

      const monthName =
        date.toLocaleString(
          "en-US",
          {
            month: "short",
          }
        );

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthName,
          followers: 0,
          impressions: 0,
        };
      }

      months[monthKey].impressions +=
        getNumber(
          post?.public_metrics
            ?.impression_count,
          post?.public_metrics
            ?.impressions,
          post?.impressions,
          post?.impression_count,
          post?.views
        );

      months[monthKey].followers =
        months[monthKey].impressions;
    });

    return Object.keys(months)
      .sort()
      .slice(-6)
      .map(
        (key) => months[key]
      );
  }, [xPosts]);

  // =====================================================
  // YOUTUBE MONTHLY VIDEO DATA
  // =====================================================

  const growthData = useMemo(() => {
    if (
      !Array.isArray(sortedVideos) ||
      sortedVideos.length === 0
    ) {
      return [];
    }

    const months = {};

    sortedVideos.forEach((video) => {
      if (!video?.published_at) {
        return;
      }

      const date = new Date(
        video.published_at
      );

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const monthKey =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

      const monthName =
        date.toLocaleString(
          "en-US",
          {
            month: "short",
          }
        );

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthName,
          followers: 0,
          views: 0,
        };
      }

      months[monthKey].views +=
        getNumber(
          video?.views,
          video?.view_count,
          video?.viewCount
        );

      months[monthKey].followers =
        months[monthKey].views;
    });

    return Object.keys(months)
      .sort()
      .slice(-6)
      .map(
        (key) => months[key]
      );
  }, [sortedVideos]);

  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData = useMemo(() => {
    if (activePlatform === "x") {
      if (xGrowthData.length > 0) {
        return xGrowthData;
      }

      return [
        {
          month: "No data",
          followers: 0,
          impressions: 0,
        },
      ];
    }

    if (growthData.length > 0) {
      return growthData;
    }

    return [
      {
        month: "No data",
        followers: 0,
      },
    ];
  }, [
    activePlatform,
    growthData,
    xGrowthData,
  ]);

  // =====================================================
  // ACTIVE METRICS
  // =====================================================

  const currentGrowthRate =
    activePlatform === "x"
      ? xMetrics.growthRate
      : growthRate;

  const currentEngagementRate =
    activePlatform === "x"
      ? xMetrics.engagementRate
      : engagementRate;

  const currentName =
    activePlatform === "x"
      ? xName
      : channelName;

  // =====================================================
  // PERFORMANCE
  // =====================================================

  const performanceValue =
    currentGrowthRate > 0
      ? Math.min(
          100,
          Math.max(
            0,
            50 + currentGrowthRate
          )
        )
      : 0;

  // =====================================================
  // FORMAT PERCENTAGE
  // =====================================================

  const formatPercentage = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00%";
    }

    if (number > 0) {
      return (
        "+" +
        number.toFixed(2) +
        "%"
      );
    }

    return (
      number.toFixed(2) +
      "%"
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="social-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="social-sidebar">

        <div
          className="social-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span className="logo-mark">
            ✦
          </span>

          CreatorIQ
        </div>

        <nav className="social-navigation">

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>▦</span>
            Dashboard
          </div>

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/content")
            }
          >
            <span>▤</span>
            Content
          </div>

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/audience")
            }
          >
            <span>◉</span>
            Audience
          </div>

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/growth-trends")
            }
          >
            <span>↗</span>
            Growth & Trends
          </div>

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/earnings")
            }
          >
            <span>₹</span>
            Earnings
          </div>

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/sponsorships")
            }
          >
            <span>◇</span>
            Sponsorships
          </div>

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/reports")
            }
          >
            <span>▧</span>
            Reports
          </div>

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/instagram-analytics")
            }
          >
            <span>◎</span>
            Instagram Analytics
          </div>

          <div className="social-nav-item active">
            <span>◎</span>
            Social Media
          </div>

          <div
            className="social-nav-item"
            onClick={() =>
              navigate("/settings")
            }
          >
            <span>⚙</span>
            Settings
          </div>

        </nav>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="social-main">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="social-header">

          <div>

            <div className="page-label">
              SOCIAL MEDIA ANALYTICS
            </div>

            <h1>
              Social Media
            </h1>

            <p>
              Track{" "}
              <strong>
                {currentName}
              </strong>{" "}
              performance on{" "}
              {activePlatform === "x"
                ? "X"
                : "YouTube"}.
            </p>

          </div>

          <div className="social-live-status">
            <span className="social-live-dot"></span>
            Live data
          </div>

        </header>

        {/* =====================================================
            PLATFORM CARDS
        ===================================================== */}

        <section className="social-platform-grid">

          {/* =================================================
              YOUTUBE
          ================================================= */}

          <div className="social-platform-card">

            <div className="social-platform-top">

              <div className="social-platform-name">

                <div className="social-platform-icon">
                  ▶
                </div>

                YouTube

              </div>

              <span className="social-platform-status">
                {youtubeConnected
                  ? "Connected"
                  : "Disconnected"}
              </span>

            </div>

            <h2>
              {youtubeConnected
                ? formatNumber(
                    subscribers
                  )
                : "Not connected"}
            </h2>

            <p>
              {youtubeConnected
                ? "Subscribers"
                : "YouTube account"}
            </p>

          </div>

          {/* =================================================
              X
          ================================================= */}

          <div className="social-platform-card">

            <div className="social-platform-top">

              <div className="social-platform-name">

                <div className="social-platform-icon">
                  𝕏
                </div>

                X

              </div>

              <span className="social-platform-status">
                {xLoading
                  ? "Checking..."
                  : xConnected
                  ? "Connected"
                  : "Disconnected"}
              </span>

            </div>

            <h2>
              {xConnected
                ? formatNumber(
                    xFollowers
                  )
                : "Not connected"}
            </h2>

            <p>
              {xConnected
                ? "Followers"
                : "X account"}
            </p>

          </div>

        </section>

        {/* =====================================================
            CHART + PERFORMANCE
        ===================================================== */}

        <section className="social-content-grid">

          <div className="social-card social-chart-card">

            <div className="social-card-header">

              <div>

                <div className="social-section-label">
                  AUDIENCE GROWTH
                </div>

                <h2>
                  {activePlatform === "x"
                    ? "X Growth"
                    : "YouTube Growth"}
                </h2>

                <p>
                  {activePlatform === "x"
                    ? `${xName}'s recent X post performance.`
                    : `${channelName}'s recent video performance.`}
                </p>

              </div>

            </div>

            <div className="social-chart">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#d8e3f0"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "#56708f",
                      fontSize: 12,
                    }}
                    axisLine={{
                      stroke: "#cbd8e8",
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#56708f",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) =>
                      formatNumber(
                        value
                      )
                    }
                    axisLine={{
                      stroke: "#cbd8e8",
                    }}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${formatNumber(
                        value
                      )} ${
                        activePlatform === "x"
                          ? "impressions"
                          : "views"
                      }`,
                      activePlatform === "x"
                        ? "Impressions"
                        : "Views",
                    ]}
                    contentStyle={{
                      background:
                        "#ffffff",
                      border:
                        "1px solid #d8e3f0",
                      borderRadius:
                        "10px",
                      color:
                        "#102a47",
                      boxShadow:
                        "0 6px 18px rgba(20,53,84,0.12)",
                    }}
                    labelStyle={{
                      color:
                        "#102a47",
                      fontWeight: 700,
                    }}
                    itemStyle={{
                      color:
                        "#173f6f",
                      fontWeight: 600,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey={
                      activePlatform === "x"
                        ? "impressions"
                        : "followers"
                    }
                    name={
                      activePlatform === "x"
                        ? "Impressions"
                        : "Views"
                    }
                    stroke="#173f6f"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#173f6f",
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* =====================================================
              PERFORMANCE
          ===================================================== */}

          <div className="social-card">

            <div className="social-card-header">

              <div>

                <div className="social-section-label">
                  PERFORMANCE
                </div>

                <h2>
                  {activePlatform === "x"
                    ? "X Performance"
                    : "YouTube Performance"}
                </h2>

                <p>
                  Performance of{" "}
                  <strong>
                    {currentName}
                  </strong>.
                </p>

              </div>

            </div>

            <div className="platform-performance-list">

              <div className="platform-performance-row">

                <div className="platform-performance-heading">

                  <strong>
                    Growth
                  </strong>

                  <span>
                    {formatPercentage(
                      currentGrowthRate
                    )}
                  </span>

                </div>

                <div className="platform-progress">

                  <span
                    style={{
                      width: `${performanceValue}%`,
                    }}
                  />

                </div>

              </div>

              <div className="platform-performance-row">

                <div className="platform-performance-heading">

                  <strong>
                    Engagement Rate
                  </strong>

                  <span>
                    {formatPercentage(
                      currentEngagementRate
                    )}
                  </span>

                </div>

                <div className="platform-progress">

                  <span
                    style={{
                      width: `${Math.min(
                        100,
                        currentEngagementRate *
                          10
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            CONNECTED ACCOUNT
        ===================================================== */}

        <section className="social-card social-accounts-section">

          <div className="social-card-header">

            <div>

              <div className="social-section-label">
                CONNECTED ACCOUNT
              </div>

              <h2>
                Social Media Accounts
              </h2>

              <p>
                Connected YouTube and X accounts.
              </p>

            </div>

          </div>

          <div className="social-account-list">

            {/* =================================================
                YOUTUBE
            ================================================= */}

            <div className="social-account-row">

              {youtubeConnected ? (

                thumbnail ? (

                  <img
                    src={thumbnail}
                    alt={channelName}
                    className="account-icon"
                    referrerPolicy="no-referrer"
                  />

                ) : (

                  <div className="account-icon">

                    {channelName !==
                    "No channel selected"
                      ? channelName
                          .charAt(0)
                          .toUpperCase()
                      : "C"}

                  </div>

                )

              ) : (

                <div className="account-icon">
                  ▶
                </div>

              )}

              <div className="account-info">

                <strong>
                  {youtubeConnected
                    ? channelName
                    : "YouTube"}
                </strong>

                <span>
                  {youtubeConnected
                    ? channelId
                      ? "YouTube Channel"
                      : "YouTube Creator"
                    : "Disconnected"}
                </span>

              </div>

              <div className="account-stat large-stat">

                <span>
                  SUBSCRIBERS
                </span>

                <strong>
                  {youtubeConnected
                    ? formatNumber(
                        subscribers
                      )
                    : "—"}
                </strong>

              </div>

              <div className="account-stat large-stat">

                <span>
                  ENGAGEMENT RATE
                </span>

                <strong>
                  {youtubeConnected
                    ? formatPercentage(
                        engagementRate
                      )
                    : "—"}
                </strong>

              </div>

              <div className="account-growth large-growth">

                {youtubeConnected
                  ? formatPercentage(
                      growthRate
                    )
                  : "Disconnected"}

              </div>

            </div>

            {/* =================================================
                X
            ================================================= */}

            <div className="social-account-row">

              {xConnected ? (

                xProfileImage ? (

                  <img
                    src={xProfileImage}
                    alt={xName}
                    className="account-icon"
                    referrerPolicy="no-referrer"
                  />

                ) : (

                  <div className="account-icon">
                    𝕏
                  </div>

                )

              ) : (

                <div className="account-icon">
                  𝕏
                </div>

              )}

              <div className="account-info">

                <strong>
                  {xConnected
                    ? xName
                    : "X"}
                </strong>

                <span>
                  {xConnected
                    ? xUsername
                    : "Disconnected"}
                </span>

              </div>

              <div className="account-stat large-stat">

                <span>
                  FOLLOWERS
                </span>

                <strong>
                  {xConnected
                    ? formatNumber(
                        xFollowers
                      )
                    : "—"}
                </strong>

              </div>

              <div className="account-stat large-stat">

                <span>
                  FOLLOWING
                </span>

                <strong>
                  {xConnected
                    ? formatNumber(
                        xFollowing
                      )
                    : "—"}
                </strong>

              </div>

              <div className="account-growth large-growth">

                {xConnected
                  ? formatNumber(
                      xTweetCount
                    )
                  : "Disconnected"}

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            INSIGHTS
        ===================================================== */}

        <section className="social-insights-section">

          <div className="social-card">

            <div className="social-section-label">
              SOCIAL INSIGHTS
            </div>

            <h2>
              What's Happening
            </h2>

            <div className="social-insights-grid">

              <div className="social-insight-card">

                <div className="social-insight-icon">
                  ↗
                </div>

                <div>

                  <h3>
                    {activePlatform === "x"
                      ? xMetrics.growthRate > 0
                        ? "X is growing"
                        : "X growth is stable"
                      : growthRate > 0
                      ? "YouTube is growing"
                      : "YouTube growth is stable"}
                  </h3>

                  <p>
                    {activePlatform === "x"
                      ? `${xName}'s recent X content shows a ${formatPercentage(
                          xMetrics.growthRate
                        )} growth trend.`
                      : `${channelName}'s recent content shows a ${formatPercentage(
                          growthRate
                        )} growth trend.`}
                  </p>

                </div>

              </div>

              <div className="social-insight-card">

                <div className="social-insight-icon">
                  ◎
                </div>

                <div>

                  <h3>
                    Engagement performance
                  </h3>

                  <p>
                    {activePlatform === "x"
                      ? `${xName} currently has an engagement rate of ${formatPercentage(
                          xMetrics.engagementRate
                        )}.`
                      : `${channelName} currently has an engagement rate of ${formatPercentage(
                          engagementRate
                        )}.`}
                  </p>

                </div>

              </div>

              <div className="social-insight-card">

                <div className="social-insight-icon">
                  ★
                </div>

                <div>

                  <h3>
                    Social media connection
                  </h3>

                  <p>

                    {activePlatform === "x"
                      ? xConnected
                        ? `${xName}'s X account is connected. YouTube is disconnected.`
                        : "X is not connected."
                      : youtubeConnected
                      ? `${channelName}'s YouTube account is connected. X is disconnected.`
                      : "YouTube is not connected."}

                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default SocialMedia;