import "./audience.css";

import { useEffect, useMemo, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { useNavigate } from "react-router-dom";

function Audience() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [activePlatform, setActivePlatform] = useState(
    localStorage.getItem("activeSocialPlatform") || "youtube"
  );

  const [channel, setChannel] = useState(null);
  const [youtubeData, setYoutubeData] = useState(null);

  const [xAccount, setXAccount] = useState(null);
  const [xData, setXData] = useState(null);

  // =====================================================
  // LOAD SELECTED CREATOR / ACCOUNT
  // =====================================================

  useEffect(() => {
    const loadSelectedData = () => {
      try {
        const platform =
          localStorage.getItem("activeSocialPlatform") ||
          "youtube";

        setActivePlatform(platform);

        // =================================================
        // YOUTUBE
        // =================================================

        if (platform === "youtube") {
          const savedChannel = localStorage.getItem(
            "selectedYoutubeChannel"
          );

          const savedYoutubeData = localStorage.getItem(
            "selectedYoutubeData"
          );

          if (savedChannel) {
            const parsedChannel = JSON.parse(savedChannel);
            setChannel(parsedChannel);
          } else {
            setChannel(null);
          }

          if (savedYoutubeData) {
            const parsedData = JSON.parse(savedYoutubeData);

            setYoutubeData(parsedData);

            if (!savedChannel && parsedData?.channel) {
              setChannel(parsedData.channel);
            }
          } else {
            setYoutubeData(null);
          }

          setXAccount(null);
          setXData(null);
        }

        // =================================================
        // X
        // =================================================

        if (platform === "x") {
          const savedXAccount =
            localStorage.getItem("selectedXAccount");

          const savedXData =
            localStorage.getItem("selectedXData");

          if (savedXAccount) {
            const parsedXAccount =
              JSON.parse(savedXAccount);

            setXAccount(parsedXAccount);
          } else {
            setXAccount(null);
          }

          if (savedXData) {
            const parsedXData = JSON.parse(savedXData);

            setXData(parsedXData);

            if (!savedXAccount && parsedXData?.account) {
              setXAccount(parsedXData.account);
            }
          } else {
            setXData(null);
          }

          setChannel(null);
          setYoutubeData(null);
        }
      } catch (error) {
        console.error(
          "Error loading selected audience data:",
          error
        );
      }
    };

    loadSelectedData();

    // =====================================================
    // LISTEN FOR CONTENT PAGE CHANGES
    // =====================================================

    const handleYoutubeChange = () => {
      loadSelectedData();
    };

    const handleXChange = () => {
      loadSelectedData();
    };

    const handlePlatformChange = () => {
      loadSelectedData();
    };

    window.addEventListener(
      "selectedYoutubeChannelChanged",
      handleYoutubeChange
    );

    window.addEventListener(
      "selectedXAccountChanged",
      handleXChange
    );

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
        "selectedYoutubeChannelChanged",
        handleYoutubeChange
      );

      window.removeEventListener(
        "selectedXAccountChanged",
        handleXChange
      );

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
  // IS X?
  // =====================================================

  const isX = activePlatform === "x";

  // =====================================================
  // CHANNEL / ACCOUNT NAME
  // =====================================================

  const channelName = isX
    ? (
        xAccount?.username ||
        xAccount?.name ||
        xAccount?.display_name ||
        xAccount?.screen_name ||
        xData?.account?.username ||
        xData?.account?.name ||
        xData?.username ||
        "Selected X Account"
      )
    : (
        channel?.channel_name ||
        channel?.name ||
        channel?.title ||
        channel?.channelName ||
        youtubeData?.channel?.channel_name ||
        "Selected Creator"
      );

  // =====================================================
  // CHANNEL / PROFILE IMAGE
  // =====================================================

  const channelImage = isX
    ? (
        xAccount?.profile_image_url ||
        xAccount?.profile_image ||
        xAccount?.profileImage ||
        xAccount?.profile_picture ||
        xAccount?.profilePicture ||
        xData?.account?.profile_image_url ||
        xData?.account?.profile_image ||
        xData?.account?.profileImage ||
        ""
      )
    : (
        channel?.thumbnail ||
        channel?.thumbnailUrl ||
        channel?.image ||
        channel?.imageUrl ||
        channel?.profileImage ||
        channel?.profilePicture ||
        youtubeData?.channel?.thumbnail ||
        ""
      );

  // =====================================================
  // X PROFILE IMAGE QUALITY
  // =====================================================

  const finalChannelImage = isX
    ? channelImage
        ?.replace("_normal.", ".")
        .replace("_bigger.", ".")
    : channelImage;

  // =====================================================
  // YOUTUBE SUBSCRIBERS
  // =====================================================

  const youtubeSubscribers = Number(
    channel?.subscribers ||
      channel?.subscriber_count ||
      channel?.subscriberCount ||
      channel?.statistics?.subscriberCount ||
      youtubeData?.channel?.subscribers ||
      0
  );

  // =====================================================
  // X FOLLOWERS
  // =====================================================

  const xFollowers = Number(
    xAccount?.followers ||
      xAccount?.followers_count ||
      xAccount?.public_metrics?.followers_count ||
      xAccount?.statistics?.followers_count ||
      xData?.account?.followers ||
      xData?.account?.followers_count ||
      xData?.account?.public_metrics?.followers_count ||
      0
  );

  // =====================================================
  // X FOLLOWING
  // =====================================================

  const xFollowing = Number(
    xAccount?.following ||
      xAccount?.following_count ||
      xAccount?.friends_count ||
      xAccount?.public_metrics?.following_count ||
      xAccount?.statistics?.following_count ||
      xData?.account?.following ||
      xData?.account?.following_count ||
      xData?.account?.public_metrics?.following_count ||
      0
  );

  // =====================================================
  // SUBSCRIBERS / FOLLOWERS
  // =====================================================

  const subscribers = isX
    ? xFollowers
    : youtubeSubscribers;

  // =====================================================
  // YOUTUBE TOTAL VIEWS
  // =====================================================

  const totalViews = Number(
    channel?.total_views ||
      channel?.totalViews ||
      channel?.views ||
      channel?.view_count ||
      channel?.viewCount ||
      channel?.statistics?.viewCount ||
      youtubeData?.channel?.total_views ||
      0
  );

  // =====================================================
  // X TOTAL POSTS
  // =====================================================

  /*
    X can return the total post count using different field
    names depending on the API response.

    We check all possible locations.

    IMPORTANT:
    We also check "posts" because some responses may store
    the total count there.
  */

  const rawXPosts =
    xAccount?.tweet_count ??
    xAccount?.tweets_count ??
    xAccount?.posts_count ??
    xAccount?.posts ??
    xAccount?.statuses_count ??
    xAccount?.public_metrics?.tweet_count ??
    xAccount?.public_metrics?.tweets_count ??
    xAccount?.public_metrics?.posts_count ??
    xData?.account?.tweet_count ??
    xData?.account?.tweets_count ??
    xData?.account?.posts_count ??
    xData?.account?.posts ??
    xData?.tweet_count ??
    xData?.tweets_count ??
    xData?.posts_count ??
    xData?.posts ??
    0;

  // =====================================================
  // CONVERT X POSTS TO NUMBER
  // =====================================================

  const convertXPostCount = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    if (typeof value === "number") {
      return Math.round(value);
    }

    const stringValue = String(value)
      .trim()
      .replace(/,/g, "");

    // Example: "2.9K"
    if (/^[0-9.]+K$/i.test(stringValue)) {
      return Math.round(
        parseFloat(stringValue) * 1000
      );
    }

    // Example: "2.9M"
    if (/^[0-9.]+M$/i.test(stringValue)) {
      return Math.round(
        parseFloat(stringValue) * 1000000
      );
    }

    // Example: "2.9B"
    if (/^[0-9.]+B$/i.test(stringValue)) {
      return Math.round(
        parseFloat(stringValue) * 1000000000
      );
    }

    const numericValue = Number(stringValue);

    return Number.isFinite(numericValue)
      ? Math.round(numericValue)
      : 0;
  };

  const totalXPosts =
    convertXPostCount(rawXPosts);

  // =====================================================
  // YOUTUBE TOTAL VIDEOS
  // =====================================================

  const videoCount = Number(
    channel?.video_count ||
      channel?.videoCount ||
      channel?.videos ||
      channel?.statistics?.videoCount ||
      youtubeData?.channel?.video_count ||
      0
  );

  // =====================================================
  // X RECENT POSTS
  // =====================================================

  const recentXPosts =
    xData?.recent_posts ||
    xData?.recentPosts ||
    xData?.posts ||
    xAccount?.recent_posts ||
    [];

  // =====================================================
  // YOUTUBE RECENT VIDEOS
  // =====================================================

  const recentVideos =
    youtubeData?.recent_videos ||
    youtubeData?.recentVideos ||
    [];

  // =====================================================
  // ACTIVE RECENT CONTENT
  // =====================================================

  const recentContent = isX
    ? recentXPosts
    : recentVideos;

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (number) => {
    const value = Number(number);

    if (!Number.isFinite(value)) {
      return "0";
    }

    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + "B";
    }

    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }

    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }

    return value.toLocaleString();
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // =====================================================
  // GET X POST METRICS
  // =====================================================

  const getXMetrics = (post) => {
    const metrics =
      post?.public_metrics ||
      post?.metrics ||
      {};

    return {
      views: Number(
        metrics.impression_count ||
          metrics.impressions ||
          post?.views ||
          post?.impressions ||
          0
      ),

      likes: Number(
        metrics.like_count ||
          metrics.likes ||
          post?.likes ||
          0
      ),

      comments: Number(
        metrics.reply_count ||
          metrics.replies ||
          metrics.comments ||
          post?.comments ||
          0
      ),

      reposts: Number(
        metrics.retweet_count ||
          metrics.reposts ||
          post?.retweets ||
          post?.reposts ||
          0
      ),
    };
  };

  // =====================================================
  // TOTAL RECENT VIEWS
  // =====================================================

  const totalRecentViews = isX
    ? recentXPosts.reduce(
        (sum, post) =>
          sum + getXMetrics(post).views,
        0
      )
    : recentVideos.reduce(
        (sum, video) =>
          sum + Number(video.views || 0),
        0
      );

  // =====================================================
  // TOTAL RECENT LIKES
  // =====================================================

  const totalRecentLikes = isX
    ? recentXPosts.reduce(
        (sum, post) =>
          sum + getXMetrics(post).likes,
        0
      )
    : recentVideos.reduce(
        (sum, video) =>
          sum + Number(video.likes || 0),
        0
      );

  // =====================================================
  // TOTAL RECENT COMMENTS
  // =====================================================

  const totalRecentComments = isX
    ? recentXPosts.reduce(
        (sum, post) =>
          sum + getXMetrics(post).comments,
        0
      )
    : recentVideos.reduce(
        (sum, video) =>
          sum + Number(video.comments || 0),
        0
      );

  // =====================================================
  // AVERAGE VIEWS
  // =====================================================

  const averageViews =
    recentContent.length > 0
      ? Math.round(
          totalRecentViews /
            recentContent.length
        )
      : 0;

  // =====================================================
  // AVERAGE LIKES
  // =====================================================

  const averageLikes =
    recentContent.length > 0
      ? Math.round(
          totalRecentLikes /
            recentContent.length
        )
      : 0;

  // =====================================================
  // AVERAGE COMMENTS
  // =====================================================

  const averageComments =
    recentContent.length > 0
      ? Math.round(
          totalRecentComments /
            recentContent.length
        )
      : 0;

  // =====================================================
  // ENGAGEMENT RATE
  // =====================================================

  const engagementRate = isX
    ? (
        xFollowers > 0
          ? (
              ((totalRecentLikes +
                totalRecentComments) /
                xFollowers) *
              100
            ).toFixed(2)
          : "0.00"
      )
    : (
        totalRecentViews > 0
          ? (
              ((totalRecentLikes +
                totalRecentComments) /
                totalRecentViews) *
              100
            ).toFixed(2)
          : "0.00"
      );

  // =====================================================
  // AUDIENCE BEHAVIOR DATA
  // =====================================================

  const behaviorData = useMemo(() => {
    if (isX) {
      return recentXPosts
        .slice(0, 8)
        .map((post, index) => {
          const fullTitle =
            post.text ||
            post.title ||
            `Post ${index + 1}`;

          let shortTitle = fullTitle;

          if (shortTitle.length > 18) {
            shortTitle =
              shortTitle.substring(0, 18) +
              "...";
          }

          const metrics =
            getXMetrics(post);

          return {
            name: shortTitle,
            fullTitle: fullTitle,
            views: metrics.views,
            likes: metrics.likes,
            comments: metrics.comments,
          };
        });
    }

    return recentVideos
      .slice(0, 8)
      .map((video, index) => {
        const fullTitle =
          video.title ||
          `Video ${index + 1}`;

        let shortTitle = fullTitle;

        if (shortTitle.length > 18) {
          shortTitle =
            shortTitle.substring(0, 18) +
            "...";
        }

        return {
          name: shortTitle,
          fullTitle: fullTitle,
          views: Number(video.views || 0),
          likes: Number(video.likes || 0),
          comments: Number(video.comments || 0),
        };
      });
  }, [
    isX,
    recentXPosts,
    recentVideos,
  ]);

  // =====================================================
  // ENGAGEMENT DISTRIBUTION DATA
  // =====================================================

  const engagementDistribution = useMemo(() => {
    return [
      {
        name: isX ? "Impressions" : "Views",
        value: totalRecentViews,
      },
      {
        name: "Likes",
        value: totalRecentLikes,
      },
      {
        name: isX ? "Replies" : "Comments",
        value: totalRecentComments,
      },
    ].filter((item) => item.value > 0);
  }, [
    isX,
    totalRecentViews,
    totalRecentLikes,
    totalRecentComments,
  ]);

  // =====================================================
  // NO SELECTED CREATOR
  // =====================================================

  const noChannel = isX
    ? !xAccount && !xData
    : !channel && !youtubeData;

  // =====================================================
  // CUSTOM TOOLTIP FOR GRAPH
  // =====================================================

  const CustomGraphTooltip = ({
    active,
    payload,
  }) => {
    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null;
    }

    const data = payload[0]?.payload;

    if (!data) {
      return null;
    }

    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5ebf1",
          borderRadius: "10px",
          padding: "14px 16px",
          boxShadow:
            "0 8px 25px rgba(23,63,111,0.12)",
          maxWidth: "320px",
        }}
      >
        <div
          style={{
            fontWeight: "700",
            color: "#182b3d",
            fontSize: "14px",
            lineHeight: "1.4",
            marginBottom: "10px",
          }}
        >
          {data.fullTitle}
        </div>

        {payload.map((item) => (
          <div
            key={item.dataKey}
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: "25px",
              fontSize: "13px",
              marginTop: "5px",
            }}
          >
            <span
              style={{
                color: "#60758c",
              }}
            >
              {item.name}
            </span>

            <strong
              style={{
                color: "#173F6F",
              }}
            >
              {formatNumber(item.value)}
            </strong>
          </div>
        ))}
      </div>
    );
  };

  // =====================================================
  // PIE COLORS
  // =====================================================

  const pieColors = [
    "#173F6F",
    "#4E82B8",
    "#8EACC9",
  ];

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="audience-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="audience-sidebar">

        {/* LOGO */}

        <div
          className="audience-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span className="audience-logo-mark">
            ✦
          </span>

          CreatorIQ
        </div>

        {/* NAVIGATION */}

        <nav className="audience-navigation">

          <div
            className="audience-nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>▦</span>
            Dashboard
          </div>

          <div
            className="audience-nav-item"
            onClick={() =>
              navigate("/content")
            }
          >
            <span>▤</span>
            Content
          </div>

          <div className="audience-nav-item active">
            <span>◉</span>
            Audience
          </div>

          <div
            className="audience-nav-item"
            onClick={() =>
              navigate("/growth-trends")
            }
          >
            <span>↗</span>
            Growth & Trends
          </div>

          <div
            className="audience-nav-item"
            onClick={() =>
              navigate("/earnings")
            }
          >
            <span>₹</span>
            Earnings
          </div>

          <div
            className="audience-nav-item"
            onClick={() =>
              navigate("/sponsorships")
            }
          >
            <span>◇</span>
            Sponsorships
          </div>

          <div
            className="audience-nav-item"
            onClick={() =>
              navigate("/reports")
            }
          >
            <span>▧</span>
            Reports
          </div>

          <div
            className="audience-nav-item"
            onClick={() =>
              navigate("/instagram-analytics")
            }
          >
            <span>◎</span>
            Instagram Analytics
          </div>

          <div
            className="audience-nav-item"
            onClick={() =>
              navigate("/social-media")
            }
          >
            <span>◎</span>
            Social Media
          </div>

          <div
            className="audience-nav-item"
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

      <main className="audience-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="audience-header">

          <div>

            <div className="audience-page-label">
              CREATOR INSIGHTS
            </div>

            <h1>
              Audience Analytics
            </h1>

            <p>
              Understand audience size,
              engagement and content
              performance.
            </p>

            {(channel || xAccount || xData) && (
              <div
                style={{
                  marginTop: "14px",
                  fontWeight: "600",
                  color: "#173F6F",
                }}
              >
                Analyzing: {channelName}
              </div>
            )}

          </div>

          <div className="audience-live">

            <span className="audience-live-dot"></span>

            {isX ? "X data" : "YouTube data"}

          </div>

        </header>

        {/* =================================================
            NO CHANNEL / ACCOUNT
        ================================================= */}

        {noChannel ? (

          <section className="audience-loading">

            <h2>
              {isX
                ? "No X account selected"
                : "No YouTube channel selected"}
            </h2>

            <p>
              {isX
                ? "Please analyze an X account from the Content page first."
                : "Please analyze a YouTube channel from the Content page first."}
            </p>

            <button
              onClick={() =>
                navigate("/content")
              }
              style={{
                marginTop: "20px",
                padding: "12px 22px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: "#173F6F",
                color: "#ffffff",
                fontWeight: "600",
              }}
            >
              Go to Content
            </button>

          </section>

        ) : (

          <>

            {/* =================================================
                SECTION 1
                SELECTED CREATOR / ACCOUNT
            ================================================= */}

            <section className="audience-card">

              <div className="audience-section-label">
                SELECTED CREATOR
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  marginTop: "15px",
                }}
              >

                {finalChannelImage ? (

                  <img
                    src={finalChannelImage}
                    alt={channelName}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />

                ) : (

                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      background: "#173F6F",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: "700",
                    }}
                  >
                    {channelName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                )}

                <div>

                  <h2 style={{ margin: 0 }}>
                    {isX
                      ? `@${String(channelName).replace(/^@/, "")}`
                      : channelName}
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                    }}
                  >
                    {isX
                      ? "X audience overview"
                      : "YouTube audience overview"}
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                SECTION 2
                KPI CARDS
            ================================================= */}

            <section className="audience-kpi-grid">

              {/* FOLLOWERS / SUBSCRIBERS */}

              <div className="audience-kpi-card">

                <div className="audience-kpi-top">

                  <span>
                    {isX
                      ? "TOTAL FOLLOWERS"
                      : "TOTAL FOLLOWERS"}
                  </span>

                  <div className="audience-kpi-icon">
                    ◎
                  </div>

                </div>

                <h2>
                  {formatNumber(
                    subscribers
                  )}
                </h2>

                <p>
                  {isX
                    ? "X followers"
                    : "YouTube subscribers"}
                </p>

              </div>

              {/* TOTAL VIEWS / FOLLOWING */}

              <div className="audience-kpi-card">

                <div className="audience-kpi-top">

                  <span>
                    {isX
                      ? "FOLLOWING"
                      : "TOTAL VIEWS"}
                  </span>

                  <div className="audience-kpi-icon">
                    ◉
                  </div>

                </div>

                <h2>
                  {formatNumber(
                    isX
                      ? xFollowing
                      : totalViews
                  )}
                </h2>

                <p>
                  {isX
                    ? "X accounts followed"
                    : "Channel lifetime views"}
                </p>

              </div>

              {/* TOTAL POSTS / VIDEOS */}

              <div className="audience-kpi-card">

                <div className="audience-kpi-top">

                  <span>
                    {isX
                      ? "TOTAL POSTS"
                      : "TOTAL VIDEOS"}
                  </span>

                  <div className="audience-kpi-icon">
                    ▤
                  </div>

                </div>

                <h2>
                  {isX
                    ? totalXPosts.toLocaleString("en-IN")
                    : formatNumber(videoCount)}
                </h2>

                <p>
                  {isX
                    ? "Posts published"
                    : "Published videos"}
                </p>

              </div>

              {/* AVG VIEWS / IMPRESSIONS */}

              <div className="audience-kpi-card">

                <div className="audience-kpi-top">

                  <span>
                    {isX
                      ? "AVG. IMPRESSIONS"
                      : "AVG. VIEWS"}
                  </span>

                  <div className="audience-kpi-icon">
                    ◉
                  </div>

                </div>

                <h2>
                  {formatNumber(
                    averageViews
                  )}
                </h2>

                <p>
                  {isX
                    ? "Per recent post"
                    : "Per recent video"}
                </p>

              </div>

            </section>

            {/* =================================================
                SECTION 3
                AUDIENCE INSIGHTS
            ================================================= */}

            <section className="audience-card">

              <div className="audience-section-label">
                AUDIENCE INSIGHTS
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >

                <div>

                  <h2>
                    Audience Engagement
                  </h2>

                  <p>
                    {isX
                      ? `Public engagement signals based on ${channelName}'s recent X posts.`
                      : `Public engagement signals based on ${channelName}'s recent videos.`}
                  </p>

                </div>

                <div
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    background: "#eef5fb",
                    color: "#173F6F",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {recentContent.length}{" "}
                  {isX
                    ? "posts analyzed"
                    : "videos analyzed"}
                </div>

              </div>

              <div
                className="audience-kpi-grid"
                style={{
                  marginTop: "25px",
                }}
              >

                {/* AVG LIKES */}

                <div className="audience-kpi-card">

                  <div className="audience-kpi-top">

                    <span>
                      AVG. LIKES
                    </span>

                    <div className="audience-kpi-icon">
                      ♥
                    </div>

                  </div>

                  <h2>
                    {formatNumber(
                      averageLikes
                    )}
                  </h2>

                  <p>
                    {isX
                      ? "Per recent post"
                      : "Per recent video"}
                  </p>

                </div>

                {/* AVG COMMENTS / REPLIES */}

                <div className="audience-kpi-card">

                  <div className="audience-kpi-top">

                    <span>
                      {isX
                        ? "AVG. REPLIES"
                        : "AVG. COMMENTS"}
                    </span>

                    <div className="audience-kpi-icon">
                      ◌
                    </div>

                  </div>

                  <h2>
                    {formatNumber(
                      averageComments
                    )}
                  </h2>

                  <p>
                    {isX
                      ? "Per recent post"
                      : "Per recent video"}
                  </p>

                </div>

                {/* ENGAGEMENT RATE */}

                <div className="audience-kpi-card">

                  <div className="audience-kpi-top">

                    <span>
                      ENGAGEMENT RATE
                    </span>

                    <div className="audience-kpi-icon">
                      ↗
                    </div>

                  </div>

                  <h2>
                    {engagementRate}%
                  </h2>

                  <p>
                    {isX
                      ? "Likes + replies / followers"
                      : "Likes + comments / views"}
                  </p>

                </div>

                {/* TOTAL INTERACTIONS */}

                <div className="audience-kpi-card">

                  <div className="audience-kpi-top">

                    <span>
                      TOTAL INTERACTIONS
                    </span>

                    <div className="audience-kpi-icon">
                      ♥
                    </div>

                  </div>

                  <h2>
                    {formatNumber(
                      totalRecentLikes +
                        totalRecentComments
                    )}
                  </h2>

                  <p>
                    {isX
                      ? "Likes + replies"
                      : "Likes + comments"}
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                SECTION 4
                AUDIENCE BEHAVIOR
            ================================================= */}

            <section className="audience-card">

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >

                <div>

                  <div className="audience-section-label">
                    AUDIENCE BEHAVIOR
                  </div>

                  <h2>
                    Audience Engagement
                  </h2>

                  <p>
                    {isX
                      ? "Compare impressions, likes and replies across recent X posts."
                      : "Compare views, likes and comments across recent videos."}
                  </p>

                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    alignItems: "center",
                    fontSize: "13px",
                    color: "#60758c",
                  }}
                >

                  <span>

                    <span
                      style={{
                        display:
                          "inline-block",
                        width: "9px",
                        height: "9px",
                        borderRadius:
                          "50%",
                        background:
                          "#173F6F",
                        marginRight: "6px",
                      }}
                    ></span>

                    {isX
                      ? "Impressions"
                      : "Views"}

                  </span>

                  <span>

                    <span
                      style={{
                        display:
                          "inline-block",
                        width: "9px",
                        height: "9px",
                        borderRadius:
                          "50%",
                        background:
                          "#4E82B8",
                        marginRight: "6px",
                      }}
                    ></span>

                    Likes

                  </span>

                  <span>

                    <span
                      style={{
                        display:
                          "inline-block",
                        width: "9px",
                        height: "9px",
                        borderRadius:
                          "50%",
                        background:
                          "#8EACC9",
                        marginRight: "6px",
                      }}
                    ></span>

                    {isX
                      ? "Replies"
                      : "Comments"}

                  </span>

                </div>

              </div>

              <div
                style={{
                  width: "100%",
                  height: "380px",
                  marginTop: "30px",
                }}
              >

                {behaviorData.length > 0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={behaviorData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 20,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 11,
                        }}
                        interval={0}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={
                          formatNumber
                        }
                        width={60}
                      />

                      <Tooltip
                        content={
                          <CustomGraphTooltip />
                        }
                      />

                      <Line
                        type="monotone"
                        dataKey="views"
                        name={
                          isX
                            ? "Impressions"
                            : "Views"
                        }
                        stroke="#173F6F"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                        }}
                        activeDot={{
                          r: 7,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="likes"
                        name="Likes"
                        stroke="#4E82B8"
                        strokeWidth={2}
                        dot={{
                          r: 3,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="comments"
                        name={
                          isX
                            ? "Replies"
                            : "Comments"
                        }
                        stroke="#8EACC9"
                        strokeWidth={2}
                        dot={{
                          r: 3,
                        }}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                ) : (

                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      background:
                        "#f7f9fc",
                      borderRadius: "12px",
                      color: "#66788a",
                    }}
                  >
                    No recent{" "}
                    {isX
                      ? "post"
                      : "video"}{" "}
                    performance data
                    available.
                  </div>

                )}

              </div>

            </section>

            {/* =================================================
                SECTION 5
                ENGAGEMENT DISTRIBUTION
            ================================================= */}

            <section className="audience-card">

              <div className="audience-section-label">
                ENGAGEMENT DISTRIBUTION
              </div>

              <h2>
                Audience Interaction Distribution
              </h2>

              <p>
                {isX
                  ? `Overview of how impressions, likes and replies are distributed across ${channelName}'s recent X content.`
                  : `Overview of how views, likes and comments are distributed across ${channelName}'s recent content.`}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 1fr) minmax(260px, 360px)",
                  gap: "35px",
                  alignItems: "center",
                  marginTop: "25px",
                }}
              >

                {/* PIE CHART */}

                <div
                  style={{
                    width: "100%",
                    height: "330px",
                  }}
                >

                  {engagementDistribution.length >
                  0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={
                            engagementDistribution
                          }
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={75}
                          outerRadius={115}
                          paddingAngle={3}
                          label={({ name }) =>
                            name
                          }
                        >

                          {engagementDistribution.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  pieColors[
                                    index %
                                      pieColors.length
                                  ]
                                }
                              />
                            )
                          )}

                        </Pie>

                        <Tooltip
                          formatter={(
                            value,
                            name
                          ) => [
                            formatNumber(value),
                            name,
                          ]}
                        />

                        <Legend />

                      </PieChart>

                    </ResponsiveContainer>

                  ) : (

                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "#f7f9fc",
                        borderRadius:
                          "12px",
                        color:
                          "#66788a",
                      }}
                    >
                      No engagement
                      distribution data
                      available.
                    </div>

                  )}

                </div>

                {/* ENGAGEMENT SUMMARY */}

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "14px",
                  }}
                >

                  {/* RECENT VIEWS / IMPRESSIONS */}

                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      background:
                        "#f7f9fc",
                      border:
                        "1px solid #edf1f5",
                    }}
                  >

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color:
                          "#708297",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      {isX
                        ? "Recent Impressions"
                        : "Recent Views"}
                    </div>

                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "24px",
                        fontWeight: "700",
                        color:
                          "#173F6F",
                      }}
                    >
                      {formatNumber(
                        totalRecentViews
                      )}
                    </div>

                  </div>

                  {/* RECENT LIKES */}

                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      background:
                        "#f7f9fc",
                      border:
                        "1px solid #edf1f5",
                    }}
                  >

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color:
                          "#708297",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      Recent Likes
                    </div>

                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "24px",
                        fontWeight: "700",
                        color:
                          "#173F6F",
                      }}
                    >
                      {formatNumber(
                        totalRecentLikes
                      )}
                    </div>

                  </div>

                  {/* RECENT COMMENTS / REPLIES */}

                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      background:
                        "#f7f9fc",
                      border:
                        "1px solid #edf1f5",
                    }}
                  >

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color:
                          "#708297",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      {isX
                        ? "Recent Replies"
                        : "Recent Comments"}
                    </div>

                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "24px",
                        fontWeight: "700",
                        color:
                          "#173F6F",
                      }}
                    >
                      {formatNumber(
                        totalRecentComments
                      )}
                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SECTION 6
                QUICK AUDIENCE SUMMARY
            ================================================= */}

            <section className="audience-card">

              <div className="audience-section-label">
                AUDIENCE SUMMARY
              </div>

              <h2>
                {isX
                  ? `@${String(channelName).replace(/^@/, "")}`
                  : channelName}
              </h2>

              <p>
                {isX
                  ? "Key publicly available audience signals for this X account."
                  : "Key publicly available audience signals for this YouTube creator."}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "18px",
                  marginTop: "25px",
                }}
              >

                {/* FOLLOWERS / SUBSCRIBERS */}

                <div
                  style={{
                    padding: "22px",
                    background:
                      "#f7f9fc",
                    borderRadius:
                      "12px",
                    border:
                      "1px solid #edf1f5",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color:
                        "#708297",
                      fontWeight:
                        "600",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    {isX
                      ? "Followers"
                      : "Subscribers"}
                  </span>

                  <h3
                    style={{
                      margin:
                        "8px 0 0",
                      fontSize:
                        "24px",
                      color:
                        "#173F6F",
                    }}
                  >
                    {formatNumber(
                      subscribers
                    )}
                  </h3>

                </div>

                {/* VIEWS / FOLLOWING */}

                <div
                  style={{
                    padding: "22px",
                    background:
                      "#f7f9fc",
                    borderRadius:
                      "12px",
                    border:
                      "1px solid #edf1f5",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color:
                        "#708297",
                      fontWeight:
                        "600",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    {isX
                      ? "Following"
                      : "Total Views"}
                  </span>

                  <h3
                    style={{
                      margin:
                        "8px 0 0",
                      fontSize:
                        "24px",
                      color:
                        "#173F6F",
                    }}
                  >
                    {formatNumber(
                      isX
                        ? xFollowing
                        : totalViews
                    )}
                  </h3>

                </div>

                {/* POSTS / VIDEOS */}

                <div
                  style={{
                    padding: "22px",
                    background:
                      "#f7f9fc",
                    borderRadius:
                      "12px",
                    border:
                      "1px solid #edf1f5",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color:
                        "#708297",
                      fontWeight:
                        "600",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    {isX
                      ? "Posts"
                      : "Published Videos"}
                  </span>

                  <h3
                    style={{
                      margin:
                        "8px 0 0",
                      fontSize:
                        "24px",
                      color:
                        "#173F6F",
                    }}
                  >
                    {isX
                      ? totalXPosts.toLocaleString("en-IN")
                      : formatNumber(videoCount)}
                  </h3>

                </div>

              </div>

            </section>

          </>

        )}

      </main>

    </div>
  );
}

export default Audience;