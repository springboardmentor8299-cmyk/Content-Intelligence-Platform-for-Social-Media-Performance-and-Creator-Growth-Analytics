import "./Dashboard.css";

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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NotificationBell from "../components/NotificationBell";

function Dashboard() {
  const navigate = useNavigate();
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Could not read the signed-in user.", error);
  }
  const isCreator = currentUser?.role === "Creator";
  const userName = currentUser?.name || currentUser?.role || "Account";
  const navItems = isCreator
    ? [
        ["▦", "Dashboard", "/dashboard"],
        ["▤", "Content", "/content"],
        ["◉", "Audience", "/audience"],
        ["↗", "Growth & Trends", "/growth-trends"],
        ["₹", "Earnings", "/earnings"],
        ["◇", "Sponsorships", "/sponsorships"],
        ["▧", "Reports", "/reports"],
        ["◎", "Instagram Analytics", "/instagram-analytics"],
        ["🔗", "Social Media", "/social-media"],
        ["⚙", "Settings", "/settings"],
      ]
    : [
        ["▦", "Dashboard", "/dashboard"],
        ["⚙", "Settings", "/settings"],
      ];

  // =====================================================
  // DATABASE DATA
  // =====================================================

  const [analytics, setAnalytics] = useState([]);
  const [growth, setGrowth] = useState([]);

  // =====================================================
  // SOCIAL CONNECTION
  // =====================================================

  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [xConnected, setXConnected] = useState(false);

  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [xLoading, setXLoading] = useState(false);

  // =====================================================
  // SELECTED SOCIAL DATA
  // =====================================================

  const [selectedYoutubeData, setSelectedYoutubeData] = useState(null);
  const [selectedXData, setSelectedXData] = useState(null);

  // =====================================================
  // LOAD DATABASE DATA
  // =====================================================

  useEffect(() => {
    if (!isCreator || !currentUser?.id) {
      return;
    }

    const loadData = async () => {
      try {
        const analyticsResponse = await api.get(
          `/analytics/${currentUser.id}`
        );

        const growthResponse = await api.get(
          `/analytics/${currentUser.id}/growth`
        );

        setAnalytics(
          Array.isArray(analyticsResponse.data)
            ? analyticsResponse.data
            : []
        );

        setGrowth(
          Array.isArray(growthResponse.data?.growth)
            ? growthResponse.data.growth
            : []
        );
      } catch (error) {
        console.error(
          "Error loading dashboard data:",
          error
        );

        setAnalytics([]);
        setGrowth([]);
      }
    };

    loadData();
  }, [currentUser?.id, isCreator]);

  // =====================================================
  // LOAD SAVED SOCIAL DATA
  // =====================================================

  useEffect(() => {
    try {
      const savedYoutubeData =
        localStorage.getItem("selectedYoutubeData");

      const savedXData =
        localStorage.getItem("selectedXData");

      if (savedYoutubeData) {
        setSelectedYoutubeData(
          JSON.parse(savedYoutubeData)
        );
      }

      if (savedXData) {
        setSelectedXData(
          JSON.parse(savedXData)
        );
      }
    } catch (error) {
      console.error(
        "Error loading saved social data:",
        error
      );
    }
  }, []);

  // =====================================================
  // SOCIAL STATUS
  // =====================================================

  useEffect(() => {
    const checkSocialStatus = () => {
      const activePlatform =
        localStorage.getItem(
          "activeSocialPlatform"
        );

      const savedYoutube =
        localStorage.getItem(
          "youtubeConnected"
        ) === "true";

      const savedX =
        localStorage.getItem(
          "xConnected"
        ) === "true";

      if (activePlatform === "youtube") {
        setYoutubeConnected(true);
        setXConnected(false);
        return;
      }

      if (activePlatform === "x") {
        setYoutubeConnected(false);
        setXConnected(true);
        return;
      }

      if (savedYoutube && !savedX) {
        setYoutubeConnected(true);
        setXConnected(false);
        return;
      }

      if (savedX && !savedYoutube) {
        setYoutubeConnected(false);
        setXConnected(true);
        return;
      }

      setYoutubeConnected(false);
      setXConnected(false);
    };

    checkSocialStatus();

    window.addEventListener(
      "storage",
      checkSocialStatus
    );

    window.addEventListener(
      "activeSocialPlatformChanged",
      checkSocialStatus
    );

    window.addEventListener(
      "selectedYoutubeChannelChanged",
      checkSocialStatus
    );

    window.addEventListener(
      "selectedXAccountChanged",
      checkSocialStatus
    );

    return () => {
      window.removeEventListener(
        "storage",
        checkSocialStatus
      );

      window.removeEventListener(
        "activeSocialPlatformChanged",
        checkSocialStatus
      );

      window.removeEventListener(
        "selectedYoutubeChannelChanged",
        checkSocialStatus
      );

      window.removeEventListener(
        "selectedXAccountChanged",
        checkSocialStatus
      );
    };
  }, []);

  // =====================================================
  // CONNECT YOUTUBE
  // =====================================================

  const handleYoutubeConnect = async () => {
    try {
      setYoutubeLoading(true);

      const response = await api.get(
        "/social/youtube/analyze",
        {
          params: {
            channel_name: "MrBeast",
          },
        }
      );

      const result = response.data;

      console.log("MRBEAST DATA:", result);

      setYoutubeConnected(true);
      setXConnected(false);

      localStorage.setItem(
        "youtubeConnected",
        "true"
      );

      localStorage.removeItem("xConnected");

      localStorage.setItem(
        "activeSocialPlatform",
        "youtube"
      );

      localStorage.setItem(
        "selectedYoutubeData",
        JSON.stringify(result)
      );

      localStorage.setItem(
        "selectedYoutubeAnalytics",
        JSON.stringify(result)
      );

      if (result?.channel) {
        localStorage.setItem(
          "selectedYoutubeChannel",
          JSON.stringify(result.channel)
        );

        const channelName =
          result.channel.name ||
          result.channel.title ||
          "MrBeast";

        localStorage.setItem(
          "selectedYoutubeChannelName",
          channelName
        );

        const channelId =
          result.channel.id ||
          result.channel.channel_id;

        if (channelId) {
          localStorage.setItem(
            "selectedYoutubeChannelId",
            channelId
          );
        }
      }

      setSelectedYoutubeData(result);

      window.dispatchEvent(
        new Event(
          "selectedYoutubeChannelChanged"
        )
      );

      window.dispatchEvent(
        new Event(
          "activeSocialPlatformChanged"
        )
      );
    } catch (error) {
      console.error(
        "YouTube connection error:",
        error
      );

      console.error(
        "YouTube API response:",
        error?.response?.data
      );

      setYoutubeConnected(false);

      alert(
        error?.response?.data?.detail ||
          "Unable to connect YouTube."
      );
    } finally {
      setYoutubeLoading(false);
    }
  };

  // =====================================================
  // CONNECT X
  // =====================================================

  const handleXConnect = async () => {
    try {
      setXLoading(true);

      const response = await api.get(
        "/social/x/analyze",
        {
          params: {
            name: "elonmusk",
          },
        }
      );

      const result = response.data;

      console.log("ELON MUSK DATA:", result);

      setXConnected(true);
      setYoutubeConnected(false);

      localStorage.setItem(
        "xConnected",
        "true"
      );

      localStorage.removeItem(
        "youtubeConnected"
      );

      localStorage.setItem(
        "activeSocialPlatform",
        "x"
      );

      localStorage.setItem(
        "selectedXData",
        JSON.stringify(result)
      );

      if (result?.account) {
        localStorage.setItem(
          "selectedXAccount",
          JSON.stringify(result.account)
        );

        localStorage.setItem(
          "selectedXUsername",
          result.account.username ||
            result.account.screen_name ||
            "elonmusk"
        );
      }

      setSelectedXData(result);

      window.dispatchEvent(
        new Event(
          "selectedXAccountChanged"
        )
      );

      window.dispatchEvent(
        new Event(
          "activeSocialPlatformChanged"
        )
      );
    } catch (error) {
      console.error(
        "X connection error:",
        error
      );

      console.error(
        "X API response:",
        error?.response?.data
      );

      setXConnected(false);

      alert(
        error?.response?.data?.detail ||
          "Unable to connect X."
      );
    } finally {
      setXLoading(false);
    }
  };

  // =====================================================
  // SIGN OUT
  // =====================================================

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // =====================================================
  // ACTIVE PLATFORM
  // =====================================================

  const activePlatform =
    localStorage.getItem(
      "activeSocialPlatform"
    );

  // =====================================================
  // NUMBER HELPER
  // =====================================================

  const toNumber = (value) => {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    const stringValue = String(value)
      .trim()
      .replace(/,/g, "");

    const match = stringValue.match(
      /^(-?\d+(?:\.\d+)?)([KMB])?$/i
    );

    if (!match) {
      const parsed = parseFloat(stringValue);

      return Number.isFinite(parsed)
        ? parsed
        : 0;
    }

    const number = parseFloat(match[1]);
    const suffix = match[2]?.toUpperCase();

    if (suffix === "K") {
      return number * 1000;
    }

    if (suffix === "M") {
      return number * 1000000;
    }

    if (suffix === "B") {
      return number * 1000000000;
    }

    return number;
  };

  // =====================================================
  // YOUTUBE CHANNEL
  // =====================================================

  const youtubeChannel =
    selectedYoutubeData?.channel ||
    selectedYoutubeData?.data?.channel ||
    selectedYoutubeData?.creator ||
    selectedYoutubeData?.user ||
    null;

  // =====================================================
  // YOUTUBE STATISTICS
  // =====================================================

  const youtubeStatistics =
    youtubeChannel?.statistics ||
    selectedYoutubeData?.statistics ||
    selectedYoutubeData?.data?.statistics ||
    {};

  // =====================================================
  // YOUTUBE VIEWS
  // =====================================================

  const youtubeViews = toNumber(
    youtubeStatistics?.viewCount ??
      youtubeStatistics?.view_count ??
      youtubeStatistics?.views ??
      youtubeChannel?.viewCount ??
      youtubeChannel?.view_count ??
      youtubeChannel?.views ??
      youtubeChannel?.total_views ??
      selectedYoutubeData?.viewCount ??
      selectedYoutubeData?.view_count ??
      selectedYoutubeData?.views ??
      selectedYoutubeData?.total_views ??
      selectedYoutubeData?.totalViews ??
      0
  );

  // =====================================================
  // YOUTUBE SUBSCRIBERS
  // =====================================================

  const youtubeSubscribers = toNumber(
    youtubeStatistics?.subscriberCount ??
      youtubeStatistics?.subscriber_count ??
      youtubeStatistics?.subscribers ??
      youtubeChannel?.subscriberCount ??
      youtubeChannel?.subscriber_count ??
      youtubeChannel?.subscribers ??
      selectedYoutubeData?.subscriberCount ??
      selectedYoutubeData?.subscriber_count ??
      selectedYoutubeData?.subscribers ??
      0
  );

  // =====================================================
  // TOTAL YOUTUBE VIDEOS
  // =====================================================

  const youtubeVideoCount = toNumber(
    youtubeStatistics?.videoCount ??
      youtubeStatistics?.video_count ??
      youtubeStatistics?.videosCount ??
      youtubeChannel?.videoCount ??
      youtubeChannel?.video_count ??
      selectedYoutubeData?.videoCount ??
      selectedYoutubeData?.video_count ??
      selectedYoutubeData?.videos_count ??
      selectedYoutubeData?.total_videos ??
      0
  );

  // =====================================================
  // YOUTUBE VIDEOS LIST
  // =====================================================

  const youtubeVideos =
    Array.isArray(
      selectedYoutubeData?.videos
    )
      ? selectedYoutubeData.videos
      : Array.isArray(
          selectedYoutubeData?.recent_videos
        )
      ? selectedYoutubeData.recent_videos
      : Array.isArray(
          selectedYoutubeData?.data?.videos
        )
      ? selectedYoutubeData.data.videos
      : [];

  // =====================================================
  // VIDEO METRIC HELPERS
  // =====================================================

  const getVideoViews = (video) =>
    toNumber(
      video?.views ??
        video?.view_count ??
        video?.viewCount ??
        video?.statistics?.viewCount ??
        video?.statistics?.view_count ??
        0
    );

  const getVideoLikes = (video) =>
    toNumber(
      video?.likes ??
        video?.like_count ??
        video?.likeCount ??
        video?.statistics?.likeCount ??
        video?.statistics?.like_count ??
        0
    );

  const getVideoComments = (video) =>
    toNumber(
      video?.comments ??
        video?.comment_count ??
        video?.commentCount ??
        video?.statistics?.commentCount ??
        video?.statistics?.comment_count ??
        0
    );

  // =====================================================
  // GET YOUTUBE THUMBNAIL
  // =====================================================

  const getVideoThumbnail = (video) => {
    return (
      video?.thumbnail ||
      video?.thumbnail_url ||
      video?.thumbnailUrl ||
      video?.image ||
      video?.image_url ||
      video?.imageUrl ||
      video?.thumbnails?.maxres?.url ||
      video?.thumbnails?.high?.url ||
      video?.thumbnails?.medium?.url ||
      video?.thumbnails?.default?.url ||
      video?.snippet?.thumbnails?.maxres?.url ||
      video?.snippet?.thumbnails?.high?.url ||
      video?.snippet?.thumbnails?.medium?.url ||
      video?.snippet?.thumbnails?.default?.url ||
      ""
    );
  };

  // =====================================================
  // GET VIDEO TITLE
  // =====================================================

  const getVideoTitle = (video) => {
    return (
      video?.title ||
      video?.name ||
      video?.snippet?.title ||
      "YouTube Video"
    );
  };

  // =====================================================
  // YOUTUBE ENGAGEMENT RATE
  // =====================================================

  const directYoutubeEngagementRate =
    selectedYoutubeData?.engagement_rate ??
    selectedYoutubeData?.engagementRate ??
    selectedYoutubeData?.engagement_percentage ??
    selectedYoutubeData?.engagementPercentage ??
    youtubeChannel?.engagement_rate ??
    youtubeChannel?.engagementRate ??
    null;

  let youtubeEngagementRate = toNumber(
    directYoutubeEngagementRate
  );

  // =====================================================
  // CALCULATE ENGAGEMENT FROM VIDEOS
  // =====================================================

  if (
    (!Number.isFinite(
      youtubeEngagementRate
    ) ||
      youtubeEngagementRate === 0) &&
    youtubeVideos.length > 0
  ) {
    let views = 0;
    let likes = 0;
    let comments = 0;

    youtubeVideos.forEach((video) => {
      views += getVideoViews(video);
      likes += getVideoLikes(video);
      comments += getVideoComments(video);
    });

    if (views > 0) {
      youtubeEngagementRate =
        ((likes + comments) / views) * 100;
    }
  }

  if (
    !Number.isFinite(
      youtubeEngagementRate
    )
  ) {
    youtubeEngagementRate = 0;
  }

  // =====================================================
  // YOUTUBE AVERAGE METRICS
  // =====================================================

  const youtubeAverageLikes =
    youtubeVideos.length > 0
      ? youtubeVideos.reduce(
          (sum, video) =>
            sum + getVideoLikes(video),
          0
        ) / youtubeVideos.length
      : 0;

  const youtubeAverageViews =
    youtubeVideos.length > 0
      ? youtubeVideos.reduce(
          (sum, video) =>
            sum + getVideoViews(video),
          0
        ) / youtubeVideos.length
      : 0;

  const youtubeAverageComments =
    youtubeVideos.length > 0
      ? youtubeVideos.reduce(
          (sum, video) =>
            sum + getVideoComments(video),
          0
        ) / youtubeVideos.length
      : 0;

  // =====================================================
  // X ACCOUNT
  // =====================================================

  const xAccount =
    selectedXData?.account ||
    selectedXData?.user ||
    selectedXData?.data?.account ||
    selectedXData?.data?.user ||
    null;

  const xPublicMetrics =
    xAccount?.public_metrics ||
    xAccount?.publicMetrics ||
    {};

  const xFollowers = toNumber(
    xAccount?.followers ??
      xAccount?.followers_count ??
      xAccount?.follower_count ??
      xPublicMetrics?.followers_count ??
      xPublicMetrics?.followers ??
      selectedXData?.followers ??
      selectedXData?.followers_count ??
      0
  );

  const xPosts = toNumber(
    xAccount?.posts ??
      xAccount?.tweet_count ??
      xAccount?.tweets_count ??
      xPublicMetrics?.tweet_count ??
      selectedXData?.posts_count ??
      selectedXData?.tweet_count ??
      selectedXData?.total_posts ??
      0
  );

  // =====================================================
  // X POSTS
  // =====================================================

  const xRecentPosts =
    Array.isArray(
      selectedXData?.recent_posts
    )
      ? selectedXData.recent_posts
      : Array.isArray(
          selectedXData?.recentPosts
        )
      ? selectedXData.recentPosts
      : Array.isArray(
          selectedXData?.posts
        )
      ? selectedXData.posts
      : [];

  // =====================================================
  // X IMPRESSIONS HELPER
  // =====================================================

  const getXPostViews = (post) => {
    return toNumber(
      post?.impression_count ??
        post?.impressions ??
        post?.impressionCount ??
        post?.views ??
        post?.view_count ??
        post?.viewCount ??
        post?.public_metrics?.impression_count ??
        post?.publicMetrics?.impression_count ??
        post?.public_metrics?.impressions ??
        post?.publicMetrics?.impressions ??
        0
    );
  };

  // =====================================================
  // X TOTAL IMPRESSIONS
  // =====================================================

  const xTotalViews =
    xRecentPosts.reduce(
      (sum, post) =>
        sum + getXPostViews(post),
      0
    );

  // =====================================================
  // X ENGAGEMENTS
  // Likes + Replies + Reposts
  // =====================================================

  const xLikes =
    xRecentPosts.reduce(
      (sum, post) =>
        sum +
        toNumber(
          post?.like_count ??
            post?.likes ??
            post?.public_metrics
              ?.like_count ??
            post?.publicMetrics
              ?.like_count ??
            0
        ),
      0
    );

  const xReplies =
    xRecentPosts.reduce(
      (sum, post) =>
        sum +
        toNumber(
          post?.reply_count ??
            post?.replies ??
            post?.public_metrics
              ?.reply_count ??
            post?.publicMetrics
              ?.reply_count ??
            0
        ),
      0
    );

  const xReposts =
    xRecentPosts.reduce(
      (sum, post) =>
        sum +
        toNumber(
          post?.retweet_count ??
            post?.reposts ??
            post?.public_metrics
              ?.retweet_count ??
            post?.publicMetrics
              ?.retweet_count ??
            0
        ),
      0
    );

  const xEngagement =
    xLikes +
    xReplies +
    xReposts;

  // =====================================================
  // X AVERAGE METRICS
  // =====================================================

  const xAverageLikes =
    xRecentPosts.length > 0
      ? xLikes / xRecentPosts.length
      : 0;

  const xAverageViews =
    xRecentPosts.length > 0
      ? xRecentPosts.reduce(
          (sum, post) =>
            sum + getXPostViews(post),
          0
        ) / xRecentPosts.length
      : 0;

  const xAverageReplies =
    xRecentPosts.length > 0
      ? xReplies / xRecentPosts.length
      : 0;

  // =====================================================
  // FORMAT NUMBERS
  // =====================================================

  const formatLargeNumber = (value) => {
    const number = toNumber(value);

    if (number >= 1000000000) {
      return `${(
        number / 1000000000
      ).toFixed(1)}B`;
    }

    if (number >= 1000000) {
      return `${(
        number / 1000000
      ).toFixed(1)}M`;
    }

    if (number >= 1000) {
      return `${(
        number / 1000
      ).toFixed(1)}K`;
    }

    return number.toLocaleString();
  };

  // =====================================================
  // PERFORMANCE AXIS FORMAT
  // =====================================================

  const formatAxisValue = (value) => {
    if (value >= 1000000000) {
      return `${(
        value / 1000000000
      ).toFixed(0)}B`;
    }

    if (value >= 1000000) {
      return `${(
        value / 1000000
      ).toFixed(0)}M`;
    }

    if (value >= 1000) {
      return `${(
        value / 1000
      ).toFixed(0)}K`;
    }

    return value;
  };

  // =====================================================
  // KPI VALUES
  // =====================================================

  let totalViews = 0;
  let totalFollowers = 0;
  let totalEngagement = 0;
  let totalVideos = 0;

  if (
    activePlatform === "youtube" &&
    selectedYoutubeData
  ) {
    totalViews = youtubeViews;

    totalFollowers =
      youtubeSubscribers;

    totalEngagement =
      youtubeEngagementRate;

    totalVideos =
      youtubeVideoCount ||
      youtubeVideos.length;
  } else if (
    activePlatform === "x" &&
    selectedXData
  ) {
    totalViews = xTotalViews;

    totalFollowers = xFollowers;

    totalVideos = xPosts;

    totalEngagement =
      xEngagement;
  } else {
    totalViews =
      analytics.reduce(
        (sum, item) =>
          sum +
          toNumber(
            item.views || 0
          ),
        0
      );

    totalFollowers =
      analytics.length > 0
        ? toNumber(
            analytics[
              analytics.length - 1
            ]?.followers || 0
          )
        : 0;

    totalEngagement = 0;
    totalVideos = 0;
  }

  // =====================================================
  // TOP YOUTUBE VIDEOS
  // =====================================================

  const topYoutubeVideos =
    youtubeVideos
      .slice()
      .sort(
        (a, b) =>
          getVideoViews(b) -
          getVideoViews(a)
      )
      .slice(0, 3);

  // =====================================================
  // TOP X POSTS
  // =====================================================

  const topXPosts =
    xRecentPosts
      .slice()
      .sort(
        (a, b) =>
          toNumber(
            b?.like_count ??
              b?.likes ??
              b?.public_metrics
                ?.like_count ??
              b?.publicMetrics
                ?.like_count ??
              0
          ) -
          toNumber(
            a?.like_count ??
              a?.likes ??
              a?.public_metrics
                ?.like_count ??
              a?.publicMetrics
                ?.like_count ??
              0
          )
      )
      .slice(0, 3);

  // =====================================================
  // PERFORMANCE DATA
  // =====================================================

  let performanceData = [];

  if (
    activePlatform === "youtube" &&
    youtubeVideos.length > 0
  ) {
    performanceData =
      youtubeVideos
        .slice(0, 5)
        .map(
          (video, index) => ({
            name: `video-${index}`,
            title: getVideoTitle(video),
            views: getVideoViews(video),
          })
        );
  } else if (
    activePlatform === "x" &&
    xRecentPosts.length > 0
  ) {
    performanceData =
      xRecentPosts
        .slice(0, 5)
        .map(
          (post, index) => ({
            name: `post-${index}`,
            title:
              post?.text ||
              post?.content ||
              "X Post",
            views: getXPostViews(post),
          })
        );
  } else {
    performanceData =
      growth
        .slice(0, 5)
        .map(
          (item, index) => ({
            name: `data-${index}`,
            title: `Performance ${index + 1}`,
            views: toNumber(
              item.views || 0
            ),
          })
        );
  }

  // =====================================================
  // PERFORMANCE Y-AXIS
  // =====================================================

  const maxPerformanceValue =
    performanceData.length > 0
      ? Math.max(
          ...performanceData.map(
            (item) =>
              toNumber(item.views)
          )
        )
      : 0;

  // =====================================================
  // Y AXIS
  // X = 1M INTERVALS
  // YOUTUBE = 5M INTERVALS
  // =====================================================

  let performanceMax = 5000000;
  let performanceTicks = [];

  if (activePlatform === "x") {
    const minimumXMax = 5000000;

    performanceMax =
      maxPerformanceValue > minimumXMax
        ? Math.ceil(
            maxPerformanceValue /
              1000000
          ) * 1000000
        : minimumXMax;

    for (
      let value = 0;
      value <= performanceMax;
      value += 1000000
    ) {
      performanceTicks.push(value);
    }
  } else {
    const fiveMillion = 5000000;

    performanceMax =
      maxPerformanceValue > 0
        ? Math.ceil(
            maxPerformanceValue /
              fiveMillion
          ) * fiveMillion
        : fiveMillion;

    for (
      let value = 0;
      value <= performanceMax;
      value += fiveMillion
    ) {
      performanceTicks.push(value);
    }
  }

  // =====================================================
  // AUDIENCE DATA
  // PLATFORM-SPECIFIC TERMS
  // =====================================================

  const youtubeAudienceData = [
    {
      name: "Avg Likes",
      value: youtubeAverageLikes,
    },
    {
      name: "Avg Views",
      value: youtubeAverageViews,
    },
    {
      name: "Avg Comments",
      value: youtubeAverageComments,
    },
  ];

  const xAudienceData = [
    {
      name: "Avg Likes",
      value: xAverageLikes,
    },
    {
      name: "Avg Impressions",
      value: xAverageViews,
    },
    {
      name: "Avg Replies",
      value: xAverageReplies,
    },
  ];

  // =====================================================
  // BLUE PIE COLORS
  // =====================================================

  const audiencePieColors = [
    "#173f6f",
    "#28547f",
    "#6fa8dc",
  ];

  // =====================================================
  // CREATOR NAME
  // =====================================================

  const creatorName =
    activePlatform === "youtube"
      ? youtubeChannel?.name ||
        youtubeChannel?.title ||
        "MrBeast"
      : activePlatform === "x"
      ? xAccount?.name ||
        xAccount?.username ||
        "Elon Musk"
      : "Creator";

  // =====================================================
  // CUSTOM PERFORMANCE TOOLTIP
  // =====================================================

  const PerformanceTooltip = ({
    active,
    payload,
  }) => {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    const item =
      payload[0]?.payload;

    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #dbeafe",
          borderRadius: "12px",
          padding: "12px 15px",
          maxWidth: "320px",
          boxShadow:
            "0 8px 24px rgba(23,63,111,0.12)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#173f6f",
            marginBottom: "7px",
            lineHeight: "1.4",
          }}
        >
          {item?.title}
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#52708f",
          }}
        >
          {activePlatform === "x"
            ? "Impressions: "
            : "Views: "}

          <strong
            style={{
              color: "#28547f",
            }}
          >
            {formatLargeNumber(
              item?.views
            )}
          </strong>
        </div>
      </div>
    );
  };

  // =====================================================
  // X MEDIA / THUMBNAIL HELPER
  // =====================================================

  const getXPostMediaUrl = (post) => {
    const findUrl = (item) => {
      if (!item) {
        return "";
      }

      if (typeof item === "string") {
        return item;
      }

      if (typeof item === "object") {
        return (
          item?.media_url_https ||
          item?.media_url ||
          item?.mediaUrl ||
          item?.image_url ||
          item?.imageUrl ||
          item?.thumbnail_url ||
          item?.thumbnailUrl ||
          item?.url ||
          item?.src ||
          ""
        );
      }

      return "";
    };

    const mediaCandidates = [
      post?.media_url_https,
      post?.media_url,
      post?.mediaUrl,
      post?.image_url,
      post?.imageUrl,
      post?.thumbnail,
      post?.thumbnail_url,
      post?.thumbnailUrl,
      post?.media_urls?.[0],
      post?.mediaUrls?.[0],
      post?.image_urls?.[0],
      post?.imageUrls?.[0],
      post?.images?.[0],
      post?.media?.[0],
      post?.media,
      post?.extended_entities?.media?.[0],
      post?.extendedEntities?.media?.[0],
      post?.entities?.media?.[0],
      post?.extended_entities?.media,
      post?.extendedEntities?.media,
    ];

    for (const item of mediaCandidates) {
      const url = findUrl(item);

      if (url) {
        return url;
      }
    }

    return "";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className={`dashboard ${
        localStorage.getItem("theme") === "dark" ? "dark-mode" : ""
      }`}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <div
          className="sidebar-logo"
          onClick={() =>
            navigate("/dashboard")
          }
          style={{
            cursor: "pointer",
          }}
        >
          ✦ CreatorIQ
        </div>

        <nav className="sidebar-nav">
          {navItems.map(([icon, label, path]) => (
            <div
              key={path}
              className={`nav-item${path === "/dashboard" ? " active" : ""}`}
              onClick={() => navigate(path)}
            >
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="profile-section">

            <div className="profile-avatar">
              M
            </div>

            <div className="profile-info">
              <strong>
                {userName}
              </strong>

              <span>
                {currentUser?.role || "User"} account
              </span>
            </div>

          </div>

          <div
            className="nav-item signout-item"
            onClick={handleSignOut}
          >
            <span>⇥</span>
            Sign Out
          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <h1>{isCreator ? "Creator Dashboard" : `${userName} Dashboard`}</h1>

            <p>
              {isCreator
                ? "Welcome back! Here's how your content is performing."
                : "Welcome back to CreatorIQ."}
            </p>

          </div>

          <NotificationBell />

        </header>

        {isCreator ? (
        <>
        {/* =================================================
            SOCIAL INTEGRATION
        ================================================= */}

        <section className="social-integration-card">

          <div className="social-integration-header">

            <div>

              <h2>
                Social Media Integration
              </h2>

              <p>
                Connect your social media accounts
                to manage and analyze your content.
              </p>

            </div>

          </div>

          <div className="social-platform-grid">

            {/* =================================================
                YOUTUBE
            ================================================= */}

            <div className="social-platform-card">

              <div className="social-platform-left">

                <div className="social-platform-icon youtube-icon">
                  ▶
                </div>

                <div className="social-platform-info">

                  <h3>
                    YouTube
                  </h3>

                  <p>
                    Connect your YouTube channel
                    to view analytics and performance.
                  </p>

                  <span
                    className={
                      youtubeConnected
                        ? "social-status connected"
                        : "social-status disconnected"
                    }
                  >
                    <span className="status-dot">
                    </span>

                    {youtubeConnected
                      ? "Connected"
                      : "Not Connected"}
                  </span>

                </div>

              </div>

              <button
                className={
                  youtubeConnected
                    ? "social-connect-btn connected-btn"
                    : "social-connect-btn"
                }
                onClick={
                  handleYoutubeConnect
                }
                disabled={
                  youtubeLoading ||
                  youtubeConnected
                }
              >
                {youtubeLoading
                  ? "Connecting..."
                  : youtubeConnected
                  ? "Connected"
                  : "Connect"}
              </button>

            </div>

            {/* =================================================
                X
            ================================================= */}

            <div className="social-platform-card">

              <div className="social-platform-left">

                <div className="social-platform-icon x-icon">
                  X
                </div>

                <div className="social-platform-info">

                  <h3>
                    X
                  </h3>

                  <p>
                    Connect your X account to manage
                    and analyze your social activity.
                  </p>

                  <span
                    className={
                      xConnected
                        ? "social-status connected"
                        : "social-status disconnected"
                    }
                  >
                    <span className="status-dot">
                    </span>

                    {xConnected
                      ? "Connected"
                      : "Not Connected"}
                  </span>

                </div>

              </div>

              <button
                className={
                  xConnected
                    ? "social-connect-btn connected-btn"
                    : "social-connect-btn"
                }
                onClick={
                  handleXConnect
                }
                disabled={
                  xLoading ||
                  xConnected
                }
              >
                {xLoading
                  ? "Connecting..."
                  : xConnected
                  ? "Connected"
                  : "Connect"}
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="kpi-grid">

          {/* =================================================
              TOTAL VIEWS / IMPRESSIONS
          ================================================= */}

          <div className="kpi-card">

            <div className="kpi-header">

              <span>
                {activePlatform === "x"
                  ? "Total Impressions"
                  : "Total Views"}
              </span>

              <div className="kpi-icon">
                ◉
              </div>

            </div>

            <h2>
              {formatLargeNumber(
                totalViews
              )}
            </h2>

          </div>

          {/* =================================================
              SUBSCRIBERS / FOLLOWERS
          ================================================= */}

          <div className="kpi-card">

            <div className="kpi-header">

              <span>
                {activePlatform === "youtube"
                  ? "Subscribers"
                  : "Followers"}
              </span>

              <div className="kpi-icon">
                ◎
              </div>

            </div>

            <h2>
              {formatLargeNumber(
                totalFollowers
              )}
            </h2>

          </div>

          {/* =================================================
              ENGAGEMENT / ENGAGEMENTS
          ================================================= */}

          <div className="kpi-card">

            <div className="kpi-header">

              <span>
                {activePlatform === "x"
                  ? "Engagements"
                  : "Engagement Rate"}
              </span>

              <div className="kpi-icon">
                ♡
              </div>

            </div>

            <h2>
              {activePlatform === "youtube"
                ? `${Number(
                    totalEngagement
                  ).toFixed(2)}%`
                : formatLargeNumber(
                    totalEngagement
                  )}
            </h2>

          </div>

          {/* =================================================
              VIDEOS / POSTS
          ================================================= */}

          <div className="kpi-card">

            <div className="kpi-header">

              <span>
                {activePlatform === "x"
                  ? "Posts"
                  : "Videos"}
              </span>

              <div className="kpi-icon">
                {activePlatform === "x"
                  ? "𝕏"
                  : "▷"}
              </div>

            </div>

            <h2>
              {formatLargeNumber(
                totalVideos
              )}
            </h2>

          </div>

        </section>

        {/* =================================================
            CHARTS
        ================================================= */}

        <section className="charts-grid">

          {/* =================================================
              PERFORMANCE
          ================================================= */}

          <div className="chart-card">

            <h3>
              Performance Overview
            </h3>

            <p>
              {activePlatform === "youtube"
                ? `${creatorName}'s recent 5 videos`
                : activePlatform === "x"
                ? `${creatorName}'s recent 5 posts`
                : "Content performance"}
            </p>

            <div className="chart-container">

              {performanceData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >

                  <LineChart
                    data={performanceData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      stroke="#dbeafe"
                      strokeDasharray="4 4"
                    />

                    {/* X AXIS HIDDEN */}

                    <XAxis
                      dataKey="name"
                      hide={true}
                    />

                    <YAxis
                      ticks={
                        performanceTicks
                      }
                      domain={[
                        0,
                        performanceMax,
                      ]}
                      tickFormatter={
                        formatAxisValue
                      }
                      tick={{
                        fill: "#6b86a3",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    {/* TOOLTIP */}

                    <Tooltip
                      content={
                        <PerformanceTooltip />
                      }
                    />

                    {/* LINE */}

                    <Line
                      type="monotone"
                      dataKey="views"
                      name={
                        activePlatform === "x"
                          ? "Impressions"
                          : "Views"
                      }
                      stroke="#173f6f"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#28547f",
                        strokeWidth: 2,
                        stroke: "#ffffff",
                      }}
                      activeDot={{
                        r: 7,
                        fill: "#173f6f",
                        stroke: "#ffffff",
                        strokeWidth: 2,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div className="empty-chart">
                  No performance data available
                </div>

              )}

            </div>

          </div>

          {/* =================================================
              AUDIENCE
          ================================================= */}

          <div className="chart-card">

            <h3>
              Audience Overview
            </h3>

            <p>
              {creatorName}'s audience summary
            </p>

            {/* =================================================
                YOUTUBE AUDIENCE
            ================================================= */}

            {activePlatform === "youtube" &&
            selectedYoutubeData ? (

              <div
                style={{
                  height: "280px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={
                        youtubeAudienceData
                      }
                      cx="50%"
                      cy="48%"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >

                      {youtubeAudienceData.map(
                        (entry, index) => (

                          <Cell
                            key={`youtube-pie-${index}`}
                            fill={
                              audiencePieColors[
                                index %
                                  audiencePieColors.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatLargeNumber(
                          value
                        )
                      }
                      contentStyle={{
                        borderRadius:
                          "12px",
                        border:
                          "1px solid #dbeafe",
                        boxShadow:
                          "0 8px 24px rgba(23,63,111,0.10)",
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span
                          style={{
                            color:
                              "#52708f",
                            fontSize:
                              "12px",
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            ) : activePlatform === "x" &&
              selectedXData ? (

              /* =================================================
                  X AUDIENCE
              ================================================= */

              <div
                style={{
                  height: "280px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={
                        xAudienceData
                      }
                      cx="50%"
                      cy="48%"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >

                      {xAudienceData.map(
                        (entry, index) => (

                          <Cell
                            key={`x-pie-${index}`}
                            fill={
                              audiencePieColors[
                                index %
                                  audiencePieColors.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatLargeNumber(
                          value
                        )
                      }
                      contentStyle={{
                        borderRadius:
                          "12px",
                        border:
                          "1px solid #dbeafe",
                        boxShadow:
                          "0 8px 24px rgba(23,63,111,0.10)",
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span
                          style={{
                            color:
                              "#52708f",
                            fontSize:
                              "12px",
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <div className="empty-chart">
                Connect a social account
                to view audience information.
              </div>

            )}

          </div>

        </section>

        {/* =================================================
            BOTTOM SECTION
        ================================================= */}

        <section className="bottom-grid">

          {/* =================================================
              TOP PERFORMING CONTENT
          ================================================= */}

          <div className="content-card">

            <h3>
              {activePlatform === "youtube"
                ? "Top Performing Videos"
                : activePlatform === "x"
                ? "Top Performing X Posts"
                : "Top Performing Content"}
            </h3>

            {/* =================================================
                YOUTUBE
            ================================================= */}

            {activePlatform === "youtube" &&
            topYoutubeVideos.length > 0 ? (

              topYoutubeVideos.map(
                (video, index) => {

                  const title =
                    getVideoTitle(video);

                  const views =
                    getVideoViews(video);

                  const thumbnail =
                    getVideoThumbnail(video);

                  return (

                    <div
                      className="content-item"
                      key={
                        video?.id ||
                        video?.video_id ||
                        index
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 0",
                      }}
                    >

                      {/* SMALL THUMBNAIL */}

                      {thumbnail ? (

                        <img
                          src={thumbnail}
                          alt={title}
                          loading="lazy"
                          style={{
                            width: "72px",
                            height: "42px",
                            objectFit:
                              "cover",
                            borderRadius:
                              "7px",
                            flexShrink: 0,
                            display:
                              "block",
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div
                          style={{
                            width: "72px",
                            height: "42px",
                            borderRadius:
                              "7px",
                            background:
                              "#dbeafe",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            color:
                              "#28547f",
                            fontSize:
                              "18px",
                            flexShrink: 0,
                          }}
                        >
                          ▶
                        </div>

                      )}

                      {/* VIDEO INFORMATION */}

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >

                        <span
                          style={{
                            display: "block",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {title}
                        </span>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                          }}
                        >
                          {formatLargeNumber(
                            views
                          )}{" "}
                          views
                        </strong>

                      </div>

                    </div>

                  );
                }
              )

            ) : activePlatform === "x" &&
              topXPosts.length > 0 ? (

              /* =================================================
                  X
              ================================================= */

              topXPosts.map(
                (post, index) => {

                  const text =
                    post?.text ||
                    post?.content ||
                    `X Post ${index + 1}`;

                  const likes =
                    toNumber(
                      post?.like_count ??
                        post?.likes ??
                        post?.public_metrics
                          ?.like_count ??
                        post?.publicMetrics
                          ?.like_count ??
                        0
                    );

                  const mediaUrl =
                    getXPostMediaUrl(post);

                  return (

                    <div
                      className="content-item"
                      key={
                        post?.id ||
                        post?.tweet_id ||
                        index
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 0",
                      }}
                    >

                      {/* X THUMBNAIL / MEDIA */}

                      {mediaUrl ? (

                        <img
                          src={mediaUrl}
                          alt="X post"
                          loading="lazy"
                          style={{
                            width: "72px",
                            height: "42px",
                            objectFit:
                              "cover",
                            borderRadius:
                              "7px",
                            flexShrink: 0,
                            display:
                              "block",
                          }}
                          onError={(event) => {
                            console.error(
                              "X thumbnail failed:",
                              mediaUrl
                            );

                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div
                          style={{
                            width: "72px",
                            height: "42px",
                            borderRadius:
                              "7px",
                            background:
                              "#dbeafe",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            color:
                              "#28547f",
                            fontSize:
                              "18px",
                            flexShrink: 0,
                          }}
                        >
                          X
                        </div>

                      )}

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >

                        <span
                          style={{
                            display:
                              "block",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {text}
                        </span>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                          }}
                        >
                          {formatLargeNumber(
                            likes
                          )}{" "}
                          likes
                        </strong>

                      </div>

                    </div>

                  );
                }
              )

            ) : (

              <div className="empty-content">
                No content available.
              </div>

            )}

          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div className="content-card">

            <h3>
              Quick Actions
            </h3>

            <button
              onClick={() =>
                navigate("/content")
              }
            >
              Create Content
            </button>

            <button
              onClick={() =>
                navigate(
                  "/growth-trends"
                )
              }
            >
              View Growth & Trends
            </button>

            <button
              onClick={() =>
                navigate("/settings")
              }
            >
              Edit Profile
            </button>

          </div>

        </section>
        </>
        ) : (
          <section className="content-card role-dashboard-empty">
            <h2>{userName} dashboard</h2>
            <p>
              {currentUser?.role === "Administrator"
                ? "Administrator management tools are not implemented in this release."
                : "This account type does not yet have linked campaign, client, or workspace data in CreatorIQ. No creator analytics or financial information is shown here. Those features will become available when authorized account relationships are supported."}
            </p>
          </section>
        )}

      </main>

    </div>
  );
}

export default Dashboard;