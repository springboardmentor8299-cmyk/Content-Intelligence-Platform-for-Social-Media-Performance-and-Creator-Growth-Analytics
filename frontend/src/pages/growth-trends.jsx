import "./growth-trends.css";
import { useNavigate } from "react-router-dom";
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

function GrowthTrends() {
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [videos, setVideos] = useState([]);

  // =====================================================
  // X DATA - ADDED
  // =====================================================

  const [activePlatform, setActivePlatform] = useState(
    localStorage.getItem("activeSocialPlatform") || "youtube"
  );

  const [xAccount, setXAccount] = useState(null);
  const [xData, setXData] = useState(null);

  // =====================================================
  // LOAD SAME SELECTED CREATOR
  // =====================================================

  useEffect(() => {
    const loadCreatorData = () => {
      try {
        // =================================================
        // ACTIVE PLATFORM - ADDED
        // =================================================

        const currentPlatform =
          localStorage.getItem("activeSocialPlatform") ||
          "youtube";

        setActivePlatform(currentPlatform);

        // =================================================
        // YOUTUBE
        // =================================================

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
          savedChannel
            ? JSON.parse(savedChannel)
            : null
        );

        setAnalytics(
          savedAnalytics
            ? JSON.parse(savedAnalytics)
            : null
        );

        setVideos(
          savedVideos
            ? JSON.parse(savedVideos)
            : []
        );

        // =================================================
        // X - ADDED
        // =================================================

        const savedXAccount = localStorage.getItem(
          "selectedXAccount"
        );

        const savedXData = localStorage.getItem(
          "selectedXData"
        );

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
      } catch (error) {
        console.error(
          "Error loading creator data:",
          error
        );

        setChannel(null);
        setAnalytics(null);
        setVideos([]);

        setXAccount(null);
        setXData(null);
      }
    };

    loadCreatorData();

    window.addEventListener(
      "selectedYoutubeChannelChanged",
      loadCreatorData
    );

    // =====================================================
    // X EVENT - ADDED
    // =====================================================

    window.addEventListener(
      "selectedXAccountChanged",
      loadCreatorData
    );

    // =====================================================
    // PLATFORM EVENT - ADDED
    // =====================================================

    window.addEventListener(
      "activeSocialPlatformChanged",
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
        "selectedXAccountChanged",
        loadCreatorData
      );

      window.removeEventListener(
        "activeSocialPlatformChanged",
        loadCreatorData
      );

      window.removeEventListener(
        "storage",
        loadCreatorData
      );
    };
  }, []);

  // =====================================================
  // CHANNEL DATA
  // =====================================================

  const channelName =
    channel?.channel_name ||
    channel?.title ||
    "No channel selected";

  const subscribers = Number(
    channel?.subscribers ??
      channel?.subscriber_count ??
      channel?.subscriberCount ??
      0
  );

  const totalViews = Number(
    channel?.total_views ??
      channel?.views ??
      channel?.view_count ??
      channel?.viewCount ??
      0
  );

  const totalVideos = Number(
    channel?.video_count ??
      channel?.videos ??
      channel?.videoCount ??
      0
  );

  const thumbnail =
    channel?.thumbnail ||
    channel?.thumbnail_url ||
    channel?.thumbnailUrl ||
    "";

  // =====================================================
  // X ACCOUNT DATA - ADDED
  // =====================================================

  const xUsername =
    xAccount?.username ||
    xAccount?.screen_name ||
    xData?.account?.username ||
    xData?.username ||
    "No X account selected";

  const xDisplayName =
    xAccount?.name ||
    xAccount?.display_name ||
    xData?.account?.name ||
    xData?.name ||
    xUsername;

  const xFollowers = Number(
    xAccount?.followers_count ??
      xAccount?.followers ??
      xData?.account?.followers_count ??
      xData?.account?.followers ??
      xData?.followers_count ??
      xData?.followers ??
      0
  );

  const xFollowing = Number(
    xAccount?.following_count ??
      xAccount?.following ??
      xData?.account?.following_count ??
      xData?.account?.following ??
      xData?.following_count ??
      xData?.following ??
      0
  );

  const xProfileImage = (
    xAccount?.profile_image_url ||
    xAccount?.profile_image ||
    xData?.account?.profile_image_url ||
    xData?.account?.profile_image ||
    ""
  )
    .replace("_normal.", ".")
    .replace("_bigger.", ".")
    .replace("_mini.", ".");

  // =====================================================
  // X POSTS - ADDED
  // =====================================================

  const xPosts = useMemo(() => {
    const posts =
      xData?.recent_posts ||
      xData?.recentPosts ||
      xData?.posts ||
      [];

    return Array.isArray(posts)
      ? posts
      : [];
  }, [xData]);

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
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (number) => {
    const value = Number(number) || 0;

    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return value.toLocaleString();
  };

  // =====================================================
  // FORMAT PERCENTAGE
  // =====================================================

  const formatPercentage = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00%";
    }

    if (number > 0) {
      return `+${number.toFixed(2)}%`;
    }

    return `${number.toFixed(2)}%`;
  };

  // =====================================================
  // SORT VIDEOS BY DATE
  // =====================================================

  const sortedVideos = useMemo(() => {
    if (!Array.isArray(videos)) {
      return [];
    }

    return videos
      .slice()
      .sort((a, b) => {
        const dateA = a?.published_at
          ? new Date(a.published_at).getTime()
          : 0;

        const dateB = b?.published_at
          ? new Date(b.published_at).getTime()
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
        totalVideoViews: 0,
        totalLikes: 0,
        totalComments: 0,
        averageViews: 0,
        averageLikes: 0,
        averageComments: 0,
        engagementRate: 0,
        recentAverageViews: 0,
        olderAverageViews: 0,
        contentViewGrowth: 0,
        recentVideoCount: 0,
        olderVideoCount: 0,
      };
    }

    const totalVideoViews = sortedVideos.reduce(
      (sum, video) =>
        sum +
        getNumber(
          video?.views,
          video?.view_count,
          video?.viewCount
        ),
      0
    );

    const totalLikes = sortedVideos.reduce(
      (sum, video) =>
        sum +
        getNumber(
          video?.likes,
          video?.like_count,
          video?.likeCount
        ),
      0
    );

    const totalComments = sortedVideos.reduce(
      (sum, video) =>
        sum +
        getNumber(
          video?.comments,
          video?.comment_count,
          video?.commentCount
        ),
      0
    );

    const count = sortedVideos.length;

    const averageViews =
      count > 0
        ? totalVideoViews / count
        : 0;

    const averageLikes =
      count > 0
        ? totalLikes / count
        : 0;

    const averageComments =
      count > 0
        ? totalComments / count
        : 0;

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

    let recentAverageViews = 0;

    if (recentVideos.length > 0) {
      const recentTotal =
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

      recentAverageViews =
        recentTotal / recentVideos.length;
    }

    let olderAverageViews = 0;

    if (olderVideos.length > 0) {
      const olderTotal =
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

      olderAverageViews =
        olderTotal / olderVideos.length;
    }

    let contentViewGrowth = 0;

    if (
      recentAverageViews > 0 &&
      olderAverageViews > 0
    ) {
      contentViewGrowth =
        ((recentAverageViews -
          olderAverageViews) /
          olderAverageViews) *
        100;
    }

    return {
      totalVideoViews,
      totalLikes,
      totalComments,
      averageViews,
      averageLikes,
      averageComments,
      engagementRate,
      recentAverageViews,
      olderAverageViews,
      contentViewGrowth,
      recentVideoCount: recentVideos.length,
      olderVideoCount: olderVideos.length,
    };
  }, [sortedVideos]);

  // =====================================================
  // X METRICS - ADDED
  // =====================================================

  const xMetrics = useMemo(() => {
    if (xPosts.length === 0) {
      return {
        totalImpressions: 0,
        totalLikes: 0,
        totalReplies: 0,
        totalReposts: 0,
        averageImpressions: 0,
        averageLikes: 0,
        averageReplies: 0,
        engagementRate: 0,
        recentAverageImpressions: 0,
        olderAverageImpressions: 0,
        contentViewGrowth: 0,
      };
    }

    const getPostMetrics = (post) => {
      const metrics =
        post?.public_metrics ||
        post?.publicMetrics ||
        post?.metrics ||
        {};

      return {
        impressions: getNumber(
          metrics?.impression_count,
          metrics?.impressions,
          post?.impression_count,
          post?.impressions
        ),

        likes: getNumber(
          metrics?.like_count,
          metrics?.likes,
          post?.like_count,
          post?.likes
        ),

        replies: getNumber(
          metrics?.reply_count,
          metrics?.replies,
          post?.reply_count,
          post?.replies
        ),

        reposts: getNumber(
          metrics?.retweet_count,
          metrics?.retweets,
          metrics?.repost_count,
          metrics?.reposts,
          post?.retweet_count,
          post?.retweets,
          post?.repost_count,
          post?.reposts
        ),
      };
    };

    const totalImpressions =
      xPosts.reduce(
        (sum, post) =>
          sum +
          getPostMetrics(post).impressions,
        0
      );

    const totalLikes =
      xPosts.reduce(
        (sum, post) =>
          sum +
          getPostMetrics(post).likes,
        0
      );

    const totalReplies =
      xPosts.reduce(
        (sum, post) =>
          sum +
          getPostMetrics(post).replies,
        0
      );

    const totalReposts =
      xPosts.reduce(
        (sum, post) =>
          sum +
          getPostMetrics(post).reposts,
        0
      );

    const count = xPosts.length;

    const averageImpressions =
      totalImpressions / count;

    const averageLikes =
      totalLikes / count;

    const averageReplies =
      totalReplies / count;

    const engagementRate =
      totalImpressions > 0
        ? ((totalLikes +
            totalReplies +
            totalReposts) /
            totalImpressions) *
          100
        : 0;

    const recentPosts =
      xPosts.slice(0, 3);

    const olderPosts =
      xPosts.slice(3, 6);

    let recentAverageImpressions = 0;

    if (recentPosts.length > 0) {
      const recentTotal =
        recentPosts.reduce(
          (sum, post) =>
            sum +
            getPostMetrics(post)
              .impressions,
          0
        );

      recentAverageImpressions =
        recentTotal / recentPosts.length;
    }

    let olderAverageImpressions = 0;

    if (olderPosts.length > 0) {
      const olderTotal =
        olderPosts.reduce(
          (sum, post) =>
            sum +
            getPostMetrics(post)
              .impressions,
          0
        );

      olderAverageImpressions =
        olderTotal / olderPosts.length;
    }

    let contentViewGrowth = 0;

    if (
      recentAverageImpressions > 0 &&
      olderAverageImpressions > 0
    ) {
      contentViewGrowth =
        ((recentAverageImpressions -
          olderAverageImpressions) /
          olderAverageImpressions) *
          100;
    }

    return {
      totalImpressions,
      totalLikes,
      totalReplies,
      totalReposts,
      averageImpressions,
      averageLikes,
      averageReplies,
      engagementRate,
      recentAverageImpressions,
      olderAverageImpressions,
      contentViewGrowth,
    };
  }, [xPosts]);

  // =====================================================
  // ENGAGEMENT RATE
  // =====================================================

  const realEngagementRate = useMemo(() => {
    if (activePlatform === "x") {
      return xMetrics.engagementRate;
    }

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
    activePlatform,
    analytics,
    channel,
    videoMetrics.engagementRate,
    xMetrics.engagementRate,
  ]);

  // =====================================================
  // METRICS
  // =====================================================

  const averageViews =
    activePlatform === "x"
      ? xMetrics.averageImpressions
      : videoMetrics.averageViews;

  const contentViewGrowth =
    activePlatform === "x"
      ? xMetrics.contentViewGrowth
      : videoMetrics.contentViewGrowth;

  // =====================================================
  // MONTHLY VIDEO VIEWS
  // =====================================================

  const monthlyViewData = useMemo(() => {
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
          views: 0,
          videos: 0,
        };
      }

      months[monthKey].views +=
        getNumber(
          video?.views,
          video?.view_count,
          video?.viewCount
        );

      months[monthKey].videos += 1;
    });

    return Object.keys(months)
      .sort()
      .slice(-6)
      .map((key) => months[key]);
  }, [sortedVideos]);

  // =====================================================
  // MONTHLY X IMPRESSIONS - ADDED
  // =====================================================

  const monthlyXData = useMemo(() => {
    if (
      !Array.isArray(xPosts) ||
      xPosts.length === 0
    ) {
      return [];
    }

    const months = {};

    xPosts.forEach((post) => {
      const rawDate =
        post?.created_at ||
        post?.createdAt ||
        post?.published_at ||
        post?.publishedAt ||
        post?.posted_at ||
        post?.postedAt ||
        post?.date ||
        post?.timestamp;

      if (!rawDate) {
        return;
      }

      const date = new Date(rawDate);

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

      const metrics =
        post?.public_metrics ||
        post?.publicMetrics ||
        post?.metrics ||
        {};

      const impressions =
        getNumber(
          metrics?.impression_count,
          metrics?.impressions,
          post?.impression_count,
          post?.impressions
        );

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthName,
          views: 0,
          videos: 0,
        };
      }

      months[monthKey].views +=
        impressions;

      months[monthKey].videos += 1;
    });

    return Object.keys(months)
      .sort()
      .map((key) => months[key]);
  }, [xPosts]);

  // =====================================================
  // ACTIVE MONTHLY DATA
  // =====================================================

  const activeMonthlyData =
    activePlatform === "x"
      ? monthlyXData
      : monthlyViewData;

  // =====================================================
  // TREND STATUS
  // =====================================================

  const getTrendStatus = (
    value,
    positiveText,
    negativeText
  ) => {
    if (value > 0) {
      return positiveText;
    }

    if (value < 0) {
      return negativeText;
    }

    return "Stable performance";
  };

  // =====================================================
  // CONTENT TREND
  // =====================================================

  const contentStatus =
    activePlatform === "x"
      ? xMetrics.contentViewGrowth > 0
        ? "Recent posts are getting more impressions"
        : xMetrics.contentViewGrowth < 0
        ? "Recent posts are getting fewer impressions"
        : "Stable performance"
      : getTrendStatus(
          contentViewGrowth,
          "Recent content is getting more views",
          "Recent content is getting fewer views"
        );

  // =====================================================
  // ENGAGEMENT TREND
  // =====================================================

  const engagementStatus =
    realEngagementRate > 0
      ? "Engagement data is available"
      : "Engagement data is unavailable";

  // =====================================================
  // VIEW / IMPRESSION TREND
  // =====================================================

  const viewTrendStatus =
    activeMonthlyData.length >= 2
      ? (() => {
          const latest =
            activeMonthlyData[
              activeMonthlyData.length - 1
            ]?.views || 0;

          const previous =
            activeMonthlyData[
              activeMonthlyData.length - 2
            ]?.views || 0;

          if (latest > previous) {
            return "Increasing ↗";
          }

          if (latest < previous) {
            return "Decreasing ↘";
          }

          return "Stable →";
        })()
      : "Stable →";

  // =====================================================
  // CREATOR ACTIVITY
  // =====================================================

  const creatorActivityStatus =
    activePlatform === "x"
      ? xPosts.length >= 3
        ? "Creator has recent X post activity"
        : "Limited recent X post data"
      : sortedVideos.length >= 3
      ? "Creator has recent video activity"
      : "Limited recent video data";

  // =====================================================
  // ACTIVE CREATOR NAME
  // =====================================================

  const activeCreatorName =
    activePlatform === "x"
      ? xDisplayName
      : channelName;

  // =====================================================
  // ACTIVE CREATOR IMAGE
  // =====================================================

  const activeCreatorImage =
    activePlatform === "x"
      ? xProfileImage
      : thumbnail;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="growth-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="growth-sidebar">

        <div
          className="growth-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span>✦</span>
          CreatorIQ
        </div>

        <nav className="growth-navigation">

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>▦</span>
            Dashboard
          </div>

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/content")
            }
          >
            <span>▤</span>
            Content
          </div>

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/audience")
            }
          >
            <span>◉</span>
            Audience
          </div>

          <div className="growth-nav-item active">
            <span>↗</span>
            Growth & Trends
          </div>

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/earnings")
            }
          >
            <span>₹</span>
            Earnings
          </div>

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/sponsorships")
            }
          >
            <span>◇</span>
            Sponsorships
          </div>

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/reports")
            }
          >
            <span>▧</span>
            Reports
          </div>

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/instagram-analytics")
            }
          >
            <span>◎</span>
            Instagram Analytics
          </div>

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/social-media")
            }
          >
            <span>🔗</span>
            Social Media
          </div>

          <div
            className="growth-nav-item"
            onClick={() =>
              navigate("/settings")
            }
          >
            <span>⚙</span>
            Settings
          </div>

        </nav>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="growth-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="growth-header">

          <div>

            <div className="growth-label">
              CREATOR INSIGHTS
            </div>

            <h1>
              Growth & Trends
            </h1>

            <p>
              Track{" "}
              <strong>
                {activeCreatorName}
              </strong>{" "}
              content performance, engagement,
              and available{" "}
              {activePlatform === "x"
                ? "X"
                : "YouTube"}{" "}
              trends.
            </p>

          </div>

          <div className="growth-live">
            <span></span>
            Live data
          </div>

        </header>

        {/* =================================================
            SELECTED CREATOR
        ================================================= */}

        <section className="growth-card growth-creator-card">

          <div className="growth-section-label">
            SELECTED CREATOR
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              marginTop: "16px",
            }}
          >

            {activeCreatorImage ? (
              <img
                src={activeCreatorImage}
                alt={activeCreatorName}
                referrerPolicy="no-referrer"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border:
                    "3px solid #e6eef6",
                }}
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  minWidth: "72px",
                  borderRadius: "50%",
                  background: "#173f6f",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              >
                {activePlatform === "x"
                  ? "X"
                  : activeCreatorName !==
                    "No channel selected"
                  ? activeCreatorName
                      .charAt(0)
                      .toUpperCase()
                  : "C"}
              </div>
            )}

            <div>

              <h2
                style={{
                  margin: 0,
                  marginBottom: "6px",
                }}
              >
                {activeCreatorName}
              </h2>

              <p
                className="growth-description"
                style={{
                  margin: 0,
                }}
              >
                {activePlatform === "x"
                  ? `@${xUsername} • X account growth and post insights`
                  : "Growth insights use available YouTube channel and video data."}
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            GROWTH / PERFORMANCE KPI CARDS
        ================================================= */}

        <section className="growth-kpi-grid">

          <div className="growth-kpi-card">

            <span>
              {activePlatform === "x"
                ? "IMPRESSION GROWTH"
                : "CONTENT VIEW GROWTH"}
            </span>

            <h2>
              {activePlatform === "x" &&
              xMetrics.olderAverageImpressions ===
                0
                ? "Unavailable"
                : formatPercentage(
                    contentViewGrowth
                  )}
            </h2>

            <p>
              {activePlatform === "x"
                ? "Recent 3 posts vs previous 3 posts"
                : "Recent 3 videos vs previous 3 videos"}
            </p>

          </div>

          <div className="growth-kpi-card">

            <span>
              ENGAGEMENT RATE
            </span>

            <h2>
              {formatPercentage(
                realEngagementRate
              )}
            </h2>

            <p>
              {activePlatform === "x"
                ? "Based on impressions, likes, replies and reposts"
                : "Based on actual views, likes and comments"}
            </p>

          </div>

          <div className="growth-kpi-card">

            <span>
              {activePlatform === "x"
                ? "AVERAGE IMPRESSIONS"
                : "AVERAGE VIEWS"}
            </span>

            <h2>
              {activePlatform === "x" &&
              xMetrics.totalImpressions ===
                0
                ? "Unavailable"
                : formatNumber(
                    averageViews
                  )}
            </h2>

            <p>
              {activePlatform === "x"
                ? "Average impressions per analyzed post"
                : "Average views per analyzed video"}
            </p>

          </div>

          <div className="growth-kpi-card">

            <span>
              {activePlatform === "x"
                ? "IMPRESSION TREND"
                : "VIEW TREND"}
            </span>

            <h2>
              {viewTrendStatus}
            </h2>

            <p>
              {activePlatform === "x"
                ? "Based on available monthly X impressions"
                : "Based on recent monthly content views"}
            </p>

          </div>

        </section>

        {/* =================================================
            PLATFORM STATISTICS
        ================================================= */}

        <section className="growth-kpi-grid">

          {activePlatform === "x" ? (
            <>
              <div className="growth-kpi-card">

                <span>
                  FOLLOWERS
                </span>

                <h2>
                  {formatNumber(
                    xFollowers
                  )}
                </h2>

                <p>
                  Current X follower count
                </p>

              </div>

              <div className="growth-kpi-card">

                <span>
                  FOLLOWING
                </span>

                <h2>
                  {formatNumber(
                    xFollowing
                  )}
                </h2>

                <p>
                  Current X following count
                </p>

              </div>

              <div className="growth-kpi-card">

                <span>
                  TOTAL POSTS
                </span>

                <h2>
                  {(() => {
                    const totalPosts =
                      xData?.account?.posts ??
                      xData?.account?.tweet_count ??
                      xData?.account?.tweets_count ??
                      xAccount?.posts ??
                      xAccount?.tweet_count ??
                      xAccount?.tweets_count ??
                      xData?.posts ??
                      xData?.tweet_count ??
                      xData?.tweets_count ??
                      xData?.total_posts ??
                      xData?.totalPosts ??
                      xData?.post_count ??
                      xData?.postCount;

                    if (
                      totalPosts === undefined ||
                      totalPosts === null ||
                      totalPosts === ""
                    ) {
                      return "Unavailable";
                    }

                    const numericTotalPosts =
                      Number(totalPosts);

                    if (
                      !Number.isFinite(
                        numericTotalPosts
                      )
                    ) {
                      return "Unavailable";
                    }

                    return Math.round(
                      numericTotalPosts
                    ).toLocaleString("en-IN");
                  })()}
                </h2>

                <p>
                  Total posts on this X account
                </p>

              </div>

              <div className="growth-kpi-card">

                <span>
                  ANALYZED POSTS
                </span>

                <h2>
                  {formatNumber(
                    xPosts.length
                  )}
                </h2>

                <p>
                  Posts available for analysis
                </p>

              </div>
            </>
          ) : (
            <>
              <div className="growth-kpi-card">

                <span>
                  SUBSCRIBERS
                </span>

                <h2>
                  {formatNumber(
                    subscribers
                  )}
                </h2>

                <p>
                  Current YouTube subscriber count
                </p>

              </div>

              <div className="growth-kpi-card">

                <span>
                  TOTAL VIEWS
                </span>

                <h2>
                  {formatNumber(
                    totalViews
                  )}
                </h2>

                <p>
                  Current channel view count
                </p>

              </div>

              <div className="growth-kpi-card">

                <span>
                  TOTAL VIDEOS
                </span>

                <h2>
                  {formatNumber(
                    totalVideos
                  )}
                </h2>

                <p>
                  Published videos on the channel
                </p>

              </div>

              <div className="growth-kpi-card">

                <span>
                  ANALYZED VIDEOS
                </span>

                <h2>
                  {formatNumber(
                    sortedVideos.length
                  )}
                </h2>

                <p>
                  Videos available for performance
                  analysis
                </p>

              </div>
            </>
          )}

        </section>

        {/* =================================================
            CONTENT PERFORMANCE CHART
        ================================================= */}

        <section className="growth-card growth-chart-card">

          <div className="growth-card-header">

            <div>

              <div className="growth-section-label">
                CONTENT PERFORMANCE
              </div>

              <h2>
                {activePlatform === "x"
                  ? "Monthly X Impressions"
                  : "Monthly Content Views"}
              </h2>

              <p>
                {activePlatform === "x"
                  ? "Actual impressions from available X posts grouped by publishing month."
                  : "Actual video views grouped by publishing month."}
              </p>

            </div>

            <div className="growth-filter">
              Last 6 Months
            </div>

          </div>

          <div className="growth-chart-wrapper">

            {activeMonthlyData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <LineChart
                  data={activeMonthlyData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#dce7f1"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#6d849b",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#6d849b",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) =>
                      formatNumber(value)
                    }
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#b8c9d9",
                      strokeDasharray:
                        "4 4",
                    }}
                    contentStyle={{
                      background: "#102a47",
                      border: "none",
                      borderRadius: "10px",
                      color: "#ffffff",
                      boxShadow:
                        "0 8px 20px rgba(16,42,71,0.18)",
                    }}
                    labelStyle={{
                      color: "#ffffff",
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}
                    formatter={(value) => [
                      `${Number(
                        value
                      ).toLocaleString()} ${
                        activePlatform === "x"
                          ? "impressions"
                          : "views"
                      }`,
                      activePlatform === "x"
                        ? "Impressions"
                        : "Views",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="views"
                    name={
                      activePlatform === "x"
                        ? "Impressions"
                        : "Views"
                    }
                    stroke="#173f6f"
                    strokeWidth={4}
                    dot={{
                      r: 5,
                      fill: "#ffffff",
                      stroke: "#173f6f",
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#173f6f",
                      stroke: "#ffffff",
                      strokeWidth: 3,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div
                style={{
                  height: "350px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "#6d849b",
                }}
              >

                <h3>
                  {activePlatform === "x"
                    ? "No X post data available"
                    : "No video data available"}
                </h3>

                <p>
                  {activePlatform === "x"
                    ? "Analyze an X account first to load real post data."
                    : "Analyze a YouTube channel first to load real video data."}
                </p>

                <button
                  onClick={() =>
                    navigate("/content")
                  }
                  style={{
                    marginTop: "10px",
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#173f6f",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  {activePlatform === "x"
                    ? "Analyze X Account"
                    : "Analyze Channel"}
                </button>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            LOWER CARDS
        ================================================= */}

        <section className="growth-lower-grid">

          <div className="growth-card">

            <div className="growth-section-label">
              PERFORMANCE
            </div>

            <h2>
              Creator Performance
            </h2>

            <p className="growth-description">
              Available performance metrics for{" "}
              <strong>
                {activeCreatorName}
              </strong>.
            </p>

            <div className="performance-list">

              <div>

                <span>
                  {activePlatform === "x"
                    ? "Impression Growth"
                    : "Content View Growth"}
                </span>

                <strong>
                  {activePlatform === "x" &&
                  xMetrics.olderAverageImpressions ===
                    0
                    ? "Unavailable"
                    : formatPercentage(
                        contentViewGrowth
                      )}
                </strong>

              </div>

              <div>

                <span>
                  Engagement Rate
                </span>

                <strong>
                  {formatPercentage(
                    realEngagementRate
                  )}
                </strong>

              </div>

              <div>

                <span>
                  {activePlatform === "x"
                    ? "Average Impressions"
                    : "Average Views"}
                </span>

                <strong>
                  {activePlatform === "x" &&
                  xMetrics.totalImpressions ===
                    0
                    ? "Unavailable"
                    : formatNumber(
                        averageViews
                      )}
                </strong>

              </div>

              <div>

                <span>
                  {activePlatform === "x"
                    ? "Followers"
                    : "Subscribers"}
                </span>

                <strong>
                  {formatNumber(
                    activePlatform === "x"
                      ? xFollowers
                      : subscribers
                  )}
                </strong>

              </div>

            </div>

          </div>

          <div className="growth-card">

            <div className="growth-section-label">
              TREND INSIGHTS
            </div>

            <h2>
              What's Growing
            </h2>

            <p className="growth-description">
              Insights generated only from
              available{" "}
              {activePlatform === "x"
                ? "X post"
                : "YouTube channel and video"}{" "}
              data.
            </p>

            <div className="trend-list">

              <div className="trend-item">

                <div className="trend-icon">
                  ↗
                </div>

                <div>

                  <strong>
                    {contentStatus}
                  </strong>

                  <p>
                    {activePlatform === "x"
                      ? "Recent X posts are compared with previous posts using their actual impression counts."
                      : "Recent videos are compared with the previous videos using their actual view counts."}
                  </p>

                </div>

              </div>

              <div className="trend-item">

                <div className="trend-icon">
                  ◉
                </div>

                <div>

                  <strong>
                    {engagementStatus}
                  </strong>

                  <p>
                    {activePlatform === "x"
                      ? "Engagement rate uses available impressions, likes, replies and reposts."
                      : "Engagement rate uses actual video views, likes and comments."}
                  </p>

                </div>

              </div>

              <div className="trend-item">

                <div className="trend-icon">
                  ◎
                </div>

                <div>

                  <strong>
                    {viewTrendStatus}
                  </strong>

                  <p>
                    {activePlatform === "x"
                      ? "Monthly X impressions are calculated from post dates and available impression counts."
                      : "Monthly content views are calculated from the publishing dates and actual video views."}
                  </p>

                </div>

              </div>

              <div className="trend-item">

                <div className="trend-icon">
                  ★
                </div>

                <div>

                  <strong>
                    {creatorActivityStatus}
                  </strong>

                  <p>
                    {activePlatform === "x"
                      ? "X activity is based on the number of posts available for analysis."
                      : "Creator activity is based on the number of videos available for analysis."}
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

export default GrowthTrends;