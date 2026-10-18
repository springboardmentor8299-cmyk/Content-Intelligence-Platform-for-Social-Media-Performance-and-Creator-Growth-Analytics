import "./Content.css";
import { useEffect, useState } from "react";

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
import api from "../services/api";


// =====================================================
// X PROFILE IMAGE QUALITY HELPER
// =====================================================

const getXProfileImage = (account) => {

  const image =
    account?.profile_image_url ||
    account?.profile_image ||
    "";

  if (!image) {
    return "";
  }

  // X commonly returns:
  // _normal.jpg
  // _bigger.jpg
  //
  // Removing these suffixes requests the
  // higher-resolution version when available.

  return image
    .replace("_normal.", ".")
    .replace("_bigger.", ".");

};


// =====================================================
// EXACT INTEGER HELPER FOR X POSTS
// =====================================================

const formatInteger = (number) => {

  if (
    number === undefined ||
    number === null ||
    number === ""
  ) {
    return "0";
  }

  const numericNumber = Number(number);

  if (Number.isNaN(numericNumber)) {
    return "0";
  }

  return Math.round(numericNumber).toLocaleString();

};


function Content() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [channelName, setChannelName] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // ACTIVE PLATFORM
  // =====================================================

  const [activePlatform, setActivePlatform] = useState(
    localStorage.getItem("activeSocialPlatform") || "youtube"
  );

  // =====================================================
  // GET ACTIVE PLATFORM
  // =====================================================

  const getActivePlatform = async () => {

    const savedPlatform =
      localStorage.getItem("activeSocialPlatform");

    const xConnected =
      localStorage.getItem("xConnected") === "true";

    const youtubeConnected =
      localStorage.getItem("youtubeConnected") === "true";

    // =================================================
    // X IS ACTIVE
    // =================================================

    if (
      savedPlatform === "x" &&
      xConnected
    ) {
      setActivePlatform("x");
      return "x";
    }

    // =================================================
    // YOUTUBE IS ACTIVE
    // =================================================

    if (
      savedPlatform === "youtube" &&
      youtubeConnected
    ) {
      setActivePlatform("youtube");
      return "youtube";
    }

    // =================================================
    // FALLBACK
    // =================================================

    if (savedPlatform === "x") {
      setActivePlatform("x");
      return "x";
    }

    if (savedPlatform === "youtube") {
      setActivePlatform("youtube");
      return "youtube";
    }

    // =================================================
    // DEFAULT
    // =================================================

    setActivePlatform("youtube");
    return "youtube";
  };

  // =====================================================
  // LISTEN FOR PLATFORM / ACCOUNT CHANGES
  // =====================================================

  useEffect(() => {

    const handlePlatformChange = () => {

      const platform =
        localStorage.getItem(
          "activeSocialPlatform"
        ) || "youtube";

      setActivePlatform(platform);

      // =================================================
      // X PLATFORM
      // =================================================

      if (platform === "x") {

        const savedXData =
          localStorage.getItem(
            "selectedXData"
          );

        const savedXSearchName =
          localStorage.getItem(
            "selectedXSearchName"
          );

        if (savedXData) {

          try {

            const parsedXData =
              JSON.parse(savedXData);

            setData(parsedXData);

            if (savedXSearchName) {
              setChannelName(
                savedXSearchName
              );
            }

            setError("");

          } catch (error) {

            console.error(
              "Saved X data could not be loaded:",
              error
            );

            setData(null);
          }

        } else {

          setData(null);
          setChannelName("");
          setError("");
        }

        return;
      }

      // =================================================
      // YOUTUBE PLATFORM
      // =================================================

      if (platform === "youtube") {

        const savedYoutubeData =
          localStorage.getItem(
            "selectedYoutubeData"
          );

        const savedYoutubeSearchName =
          localStorage.getItem(
            "selectedYoutubeSearchName"
          );

        if (savedYoutubeData) {

          try {

            const parsedYoutubeData =
              JSON.parse(
                savedYoutubeData
              );

            setData(
              parsedYoutubeData
            );

            if (savedYoutubeSearchName) {
              setChannelName(
                savedYoutubeSearchName
              );
            }

            setError("");

          } catch (error) {

            console.error(
              "Saved YouTube data could not be loaded:",
              error
            );

            setData(null);
          }

        } else {

          setData(null);
          setChannelName("");
          setError("");
        }
      }

    };

    // =================================================
    // STORAGE CHANGE
    // =================================================

    const handleStorageChange = (event) => {

      if (
        event.key ===
        "activeSocialPlatform"
      ) {
        handlePlatformChange();
      }

    };

    // =================================================
    // EVENTS
    // =================================================

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "selectedXAccountChanged",
      handlePlatformChange
    );

    window.addEventListener(
      "selectedYoutubeChannelChanged",
      handlePlatformChange
    );

    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "selectedXAccountChanged",
        handlePlatformChange
      );

      window.removeEventListener(
        "selectedYoutubeChannelChanged",
        handlePlatformChange
      );

    };

  }, []);

  // =====================================================
  // ANALYZE X ACCOUNT
  // =====================================================

  const analyzeXAccount = async (searchName) => {

    const cleanSearchName =
      searchName.trim();

    // =================================================
    // VALIDATE X SEARCH
    // =================================================

    if (!cleanSearchName) {

      setError(
        "Please enter an X account name."
      );

      return;
    }

    try {

      // =================================================
      // CHECK X CONNECTION
      // =================================================

      const isXConnected =
        localStorage.getItem(
          "xConnected"
        ) === "true";

      const savedPlatform =
        localStorage.getItem(
          "activeSocialPlatform"
        );

      if (
        !isXConnected ||
        savedPlatform !== "x"
      ) {

        setError(
          "X is not connected. Please connect X first."
        );

        return;
      }

      // =================================================
      // X ANALYZE API
      // =================================================

      const response = await api.get(
        "/social/x/analyze",
        {
          params: {
            name: cleanSearchName,
          },
        }
      );

      const result =
        response.data;

      // =================================================
      // SHOW RESULT
      // =================================================

      setData(result);
      setError("");

      // =================================================
      // SAVE SEARCH NAME
      // =================================================

      localStorage.setItem(
        "selectedXSearchName",
        cleanSearchName
      );

      // =================================================
      // SAVE COMPLETE X DATA
      // =================================================

      localStorage.setItem(
        "selectedXData",
        JSON.stringify(result)
      );

      // =================================================
      // SAVE X ACCOUNT
      // =================================================

      if (result?.account) {

        localStorage.setItem(
          "selectedXAccount",
          JSON.stringify(
            result.account
          )
        );

        if (result.account.user_id) {

          localStorage.setItem(
            "selectedXUserId",
            String(
              result.account.user_id
            )
          );

        }

        if (result.account.username) {

          localStorage.setItem(
            "selectedXUsername",
            result.account.username
          );

        }

        if (result.account.name) {

          localStorage.setItem(
            "selectedXName",
            result.account.name
          );

        }

      }

      // =================================================
      // SAVE X ANALYTICS
      // =================================================

      if (result?.analytics) {

        localStorage.setItem(
          "selectedXAnalytics",
          JSON.stringify(
            result.analytics
          )
        );

      } else {

        localStorage.removeItem(
          "selectedXAnalytics"
        );

      }

      // =================================================
      // SAVE X POSTS
      // =================================================

      if (result?.recent_posts) {

        localStorage.setItem(
          "selectedXPosts",
          JSON.stringify(
            result.recent_posts
          )
        );

      } else {

        localStorage.removeItem(
          "selectedXPosts"
        );

      }

      // =================================================
      // KEEP X ACTIVE
      // =================================================

      localStorage.setItem(
        "activeSocialPlatform",
        "x"
      );

      localStorage.setItem(
        "xConnected",
        "true"
      );

      localStorage.removeItem(
        "youtubeConnected"
      );

      // =================================================
      // NOTIFY OTHER PAGES
      // =================================================

      window.dispatchEvent(
        new Event(
          "selectedXAccountChanged"
        )
      );

      console.log(
        "Selected X account:",
        result?.account
      );

      console.log(
        "Selected X analytics:",
        result?.analytics
      );

      console.log(
        "Selected X posts:",
        result?.recent_posts
      );

    } catch (err) {

      console.error(
        "X analytics error:",
        err
      );

      // =================================================
      // CLEAR OLD X DATA AFTER ERROR
      // =================================================

      setData(null);

      localStorage.removeItem(
        "selectedXData"
      );

      localStorage.removeItem(
        "selectedXAccount"
      );

      localStorage.removeItem(
        "selectedXAnalytics"
      );

      localStorage.removeItem(
        "selectedXPosts"
      );

      localStorage.removeItem(
        "selectedXSearchName"
      );

      // =================================================
      // X API CREDITS DEPLETED
      // =================================================

      if (
        err.response?.status === 402
      ) {

        setError(
          "X API credits are depleted. Please check your TwitterAPIs account credits."
        );

      }

      // =================================================
      // UNAUTHORIZED
      // =================================================

      else if (
        err.response?.status === 401
      ) {

        setError(
          "X API authorization failed. Please check your TwitterAPIs API key."
        );

      }

      // =================================================
      // FORBIDDEN
      // =================================================

      else if (
        err.response?.status === 403
      ) {

        setError(
          "X API access is forbidden. Please check your TwitterAPIs API permissions."
        );

      }

      // =================================================
      // USER NOT FOUND
      // =================================================

      else if (
        err.response?.status === 404
      ) {

        setError(
          "X account not found. Please check the account name and try again."
        );

      }

      // =================================================
      // RATE LIMIT
      // =================================================

      else if (
        err.response?.status === 429
      ) {

        setError(
          "X API usage limit has been reached. Please try again later."
        );

      }

      // =================================================
      // BACKEND DETAIL
      // =================================================

      else if (
        err.response?.data?.detail
      ) {

        const detail =
          err.response.data.detail;

        if (
          typeof detail === "string"
        ) {

          setError(detail);

        } else if (
          Array.isArray(detail)
        ) {

          setError(
            detail
              .map(
                (item) =>
                  item?.msg ||
                  "Request validation failed."
              )
              .join(", ")
          );

        } else {

          setError(
            "Unable to fetch X account data."
          );

        }

      }

      // =================================================
      // API ERROR MESSAGE
      // =================================================

      else if (
        err.response?.data?.error?.message
      ) {

        setError(
          err.response.data.error.message
        );

      }

      // =================================================
      // DEFAULT ERROR
      // =================================================

      else {

        setError(
          "Unable to fetch X account data. Please try again."
        );

      }

    }

  };

  // =====================================================
  // ANALYZE YOUTUBE CHANNEL
  // =====================================================

  const analyzeYoutubeChannel = async (
    searchName
  ) => {

    const savedSearchName =
      localStorage.getItem(
        "selectedYoutubeSearchName"
      );

    const savedYoutubeData =
      localStorage.getItem(
        "selectedYoutubeData"
      );

    // =================================================
    // USE CACHED YOUTUBE DATA
    // =================================================

    if (
      savedSearchName &&
      savedYoutubeData &&
      savedSearchName.toLowerCase() ===
        searchName.toLowerCase()
    ) {

      try {

        const cachedResult =
          JSON.parse(
            savedYoutubeData
          );

        if (cachedResult) {

          setData(
            cachedResult
          );

          setError("");

          console.log(
            "Using cached YouTube channel data:",
            cachedResult?.channel
          );

          return;
        }

      } catch (cacheError) {

        console.error(
          "Cached YouTube data error:",
          cacheError
        );

        localStorage.removeItem(
          "selectedYoutubeData"
        );

        localStorage.removeItem(
          "selectedYoutubeSearchName"
        );

      }

    }

    // =================================================
    // YOUTUBE API
    // =================================================

    try {

      const response =
        await api.get(
          "/social/youtube/analyze",
          {
            params: {
              channel_name:
                searchName,
            },
          }
        );

      const result =
        response.data;

      // =================================================
      // SHOW RESULT
      // =================================================

      setData(result);

      // =================================================
      // SAVE SEARCH NAME
      // =================================================

      localStorage.setItem(
        "selectedYoutubeSearchName",
        searchName
      );

      // =================================================
      // SAVE ACTIVE PLATFORM
      // =================================================

      localStorage.setItem(
        "activeSocialPlatform",
        "youtube"
      );

      // =================================================
      // SAVE YOUTUBE CONNECTION
      // =================================================

      localStorage.setItem(
        "youtubeConnected",
        "true"
      );

      localStorage.removeItem(
        "xConnected"
      );

      // =================================================
      // SAVE SELECTED CHANNEL
      // =================================================

      if (result?.channel) {

        localStorage.setItem(
          "selectedYoutubeChannel",
          JSON.stringify(
            result.channel
          )
        );

        if (
          result.channel.channel_id
        ) {

          localStorage.setItem(
            "selectedYoutubeChannelId",
            String(
              result.channel.channel_id
            )
          );

        }

        if (
          result.channel.channel_name
        ) {

          localStorage.setItem(
            "selectedYoutubeChannelName",
            result.channel.channel_name
          );

        }

      }

      // =================================================
      // SAVE CHANNEL ANALYTICS
      // =================================================

      if (result?.analytics) {

        localStorage.setItem(
          "selectedYoutubeAnalytics",
          JSON.stringify(
            result.analytics
          )
        );

      } else {

        localStorage.removeItem(
          "selectedYoutubeAnalytics"
        );

      }

      // =================================================
      // SAVE RECENT VIDEOS
      // =================================================

      if (
        result?.recent_videos
      ) {

        localStorage.setItem(
          "selectedYoutubeVideos",
          JSON.stringify(
            result.recent_videos
          )
        );

      } else {

        localStorage.removeItem(
          "selectedYoutubeVideos"
        );

      }

      // =================================================
      // SAVE COMPLETE RESULT
      // =================================================

      localStorage.setItem(
        "selectedYoutubeData",
        JSON.stringify(result)
      );

      // =================================================
      // NOTIFY OTHER PAGES
      // =================================================

      window.dispatchEvent(
        new Event(
          "selectedYoutubeChannelChanged"
        )
      );

      console.log(
        "Selected YouTube channel:",
        result?.channel
      );

      console.log(
        "Selected YouTube analytics:",
        result?.analytics
      );

      console.log(
        "Selected YouTube videos:",
        result?.recent_videos
      );

    } catch (err) {

      console.error(
        "YouTube analytics error:",
        err
      );

      if (
        err.response?.data?.detail
      ) {

        const detail =
          err.response.data.detail;

        if (
          typeof detail === "string"
        ) {

          setError(detail);

        } else if (
          Array.isArray(detail)
        ) {

          setError(
            detail
              .map(
                (item) =>
                  item?.msg ||
                  "Request validation failed."
              )
              .join(", ")
          );

        } else {

          setError(
            "Unable to fetch YouTube channel data."
          );

        }

      } else if (
        err.response?.data?.error?.message
      ) {

        setError(
          err.response.data.error.message
        );

      } else {

        setError(
          "Unable to fetch YouTube channel data."
        );

      }

    }

  };

  // =====================================================
  // MAIN SEARCH
  // =====================================================

  const analyzeChannel = async () => {

    if (loading) {
      return;
    }

    const searchName =
      channelName.trim();

    if (!searchName) {

      setError(
        `Please enter a ${
          activePlatform === "x"
            ? "X account name"
            : "YouTube channel name"
        }.`
      );

      return;
    }

    // =================================================
    // GET ACTIVE PLATFORM
    // =================================================

    const platform =
      await getActivePlatform();

    setLoading(true);
    setError("");
    setData(null);

    try {

      // =================================================
      // X SEARCH
      // =================================================

      if (platform === "x") {

        await analyzeXAccount(
          searchName
        );

        return;
      }

      // =================================================
      // YOUTUBE SEARCH
      // =================================================

      await analyzeYoutubeChannel(
        searchName
      );

    } finally {

      setLoading(false);

    }

  };

  // =====================================================
  // FORMAT NUMBERS
  // =====================================================

  const formatNumber = (number) => {

    if (
      number === undefined ||
      number === null
    ) {

      return "0";

    }

    const numericNumber =
      Number(number);

    if (
      numericNumber >=
      1000000000
    ) {

      return (
        (
          numericNumber /
          1000000000
        ).toFixed(1) +
        "B"
      );

    }

    if (
      numericNumber >=
      1000000
    ) {

      return (
        (
          numericNumber /
          1000000
        ).toFixed(1) +
        "M"
      );

    }

    if (
      numericNumber >=
      1000
    ) {

      return (
        (
          numericNumber /
          1000
        ).toFixed(1) +
        "K"
      );

    }

    return numericNumber.toLocaleString();

  };

  // =====================================================
  // DATA
  // =====================================================

  const isX =
    activePlatform === "x";

  const channel =
    data?.channel;

  const xAccount =
    data?.account;

  const displayChannelName =
    isX
      ? (
          xAccount?.name ||
          xAccount?.username ||
          channelName ||
          "X Account"
        )
      : (
          channel?.channel_name ||
          channel?.name ||
          channel?.title ||
          channel?.channelName ||
          data?.channel_name ||
          data?.name ||
          channelName ||
          "YouTube Channel"
        );

  const analytics =
    data?.analytics;

  const videos =
    data?.recent_videos || [];

  const xPosts =
    data?.recent_posts || [];

  // =====================================================
  // CHANNEL IMAGE
  // =====================================================

  const channelImage =
    isX
      ? getXProfileImage(xAccount)
      : (
          channel?.thumbnail ||
          channel?.thumbnailUrl ||
          channel?.image ||
          channel?.imageUrl ||
          channel?.profileImage ||
          channel?.profilePicture ||
          data?.channel?.thumbnail ||
          ""
        );

  // =====================================================
  // YOUTUBE THUMBNAIL
  // =====================================================

  const getThumbnail = (video) => {

    if (video?.thumbnail) {
      return video.thumbnail;
    }

    if (video?.video_id) {

      return `https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`;

    }

    return null;

  };

  // =====================================================
  // X POST TEXT
  // =====================================================

  const getXPostText = (post) => {

    return (
      post?.text ||
      post?.full_text ||
      post?.content ||
      "X post"
    );

  };

  // =====================================================
  // X POST METRICS
  // =====================================================

  const getXMetrics = (post) => {

    return (
      post?.public_metrics ||
      post?.metrics ||
      {}
    );

  };

  // =====================================================
  // X POST IMAGES
  // =====================================================

  const getXPostImages = (post) => {

    const urls = [];

    const addUrl = (value) => {

      if (
        typeof value === "string" &&
        /^https?:\/\//i.test(value)
      ) {

        urls.push(value);

        return;
      }

      if (
        value &&
        typeof value === "object"
      ) {

        const url =
          value.media_url_https ||
          value.media_url ||
          value.image_url ||
          value.thumbnail_url ||
          value.preview_image_url;

        if (
          typeof url === "string" &&
          /^https?:\/\//i.test(url)
        ) {

          urls.push(url);

        }

      }

    };

    // Direct image fields

    addUrl(post?.media_url_https);

    addUrl(post?.media_url);

    addUrl(post?.image_url);

    addUrl(post?.thumbnail_url);

    addUrl(post?.preview_image_url);

    // Media array

    if (
      Array.isArray(post?.media)
    ) {

      post.media.forEach(
        (mediaItem) => {
          addUrl(mediaItem);
        }
      );

    }

    // Images array

    if (
      Array.isArray(post?.images)
    ) {

      post.images.forEach(
        (image) => {
          addUrl(image);
        }
      );

    }

    // Attachments

    if (
      Array.isArray(
        post?.attachments
      )
    ) {

      post.attachments.forEach(
        (attachment) => {
          addUrl(attachment);
        }
      );

    }

    // Twitter/X extended media

    if (
      Array.isArray(
        post?.extended_entities?.media
      )
    ) {

      post.extended_entities.media.forEach(
        (mediaItem) => {

          addUrl(
            mediaItem?.media_url_https
          );

          addUrl(
            mediaItem?.media_url
          );

          addUrl(
            mediaItem?.image_url
          );

          addUrl(
            mediaItem?.thumbnail_url
          );

          addUrl(
            mediaItem?.preview_image_url
          );

        }
      );

    }

    // Twitter/X entities media

    if (
      Array.isArray(
        post?.entities?.media
      )
    ) {

      post.entities.media.forEach(
        (mediaItem) => {

          addUrl(
            mediaItem?.media_url_https
          );

          addUrl(
            mediaItem?.media_url
          );

          addUrl(
            mediaItem?.image_url
          );

          addUrl(
            mediaItem?.thumbnail_url
          );

          addUrl(
            mediaItem?.preview_image_url
          );

        }
      );

    }

    return [
      ...new Set(urls)
    ];

  };

  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData = isX
    ? xPosts
        .slice()
        .reverse()
        .map((post) => {

          const metrics =
            getXMetrics(post);

          return {

            date: post.created_at
              ? new Date(
                  post.created_at
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                  }
                )
              : "",

            views:
              metrics.impression_count ||
              metrics.impressions ||
              0,

            engagement:
              (metrics.like_count || 0) +
              (metrics.reply_count || 0) +
              (metrics.retweet_count || 0) +
              (metrics.quote_count || 0),

          };

        })
    : videos
        .slice()
        .reverse()
        .map((video) => ({

          date: video.published_at
            ? new Date(
                video.published_at
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                }
              )
            : "",

          views:
            video.views || 0,

          engagement:
            (video.likes || 0) +
            (video.comments || 0),

        }));

  // =====================================================
  // TOP CONTENT
  // =====================================================

  const topVideos = isX
    ? xPosts
        .slice()
        .sort(
          (a, b) => {

            const aMetrics =
              getXMetrics(a);

            const bMetrics =
              getXMetrics(b);

            return (
              (
                bMetrics.impression_count ||
                bMetrics.impressions ||
                0
              ) -
              (
                aMetrics.impression_count ||
                aMetrics.impressions ||
                0
              )
            );

          }
        )
        .slice(0, 3)
    : videos
        .slice()
        .sort(
          (a, b) =>
            (b.views || 0) -
            (a.views || 0)
        )
        .slice(0, 3);

  // =====================================================
  // X TOTAL METRICS
  // =====================================================

  const xTotalViews =
    xPosts.reduce(
      (total, post) => {

        const metrics =
          getXMetrics(post);

        return (
          total +
          (
            metrics.impression_count ||
            metrics.impressions ||
            0
          )
        );

      },
      0
    );

  const xTotalLikes =
    xPosts.reduce(
      (total, post) => {

        const metrics =
          getXMetrics(post);

        return (
          total +
          (
            metrics.like_count ||
            metrics.likes ||
            0
          )
        );

      },
      0
    );

  const xTotalReplies =
    xPosts.reduce(
      (total, post) => {

        const metrics =
          getXMetrics(post);

        return (
          total +
          (
            metrics.reply_count ||
            metrics.replies ||
            0
          )
        );

      },
      0
    );

  const xTotalRetweets =
    xPosts.reduce(
      (total, post) => {

        const metrics =
          getXMetrics(post);

        return (
          total +
          (
            metrics.retweet_count ||
            metrics.retweets ||
            0
          )
        );

      },
      0
    );

  const xEngagementRate =
    xTotalViews > 0
      ? (
          (
            xTotalLikes +
            xTotalReplies +
            xTotalRetweets
          ) /
          xTotalViews
        ) *
        100
      : 0;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="content-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="content-sidebar">

        {/* LOGO */}

        <div
          className="content-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <span className="logo-mark">
            ✦
          </span>

          CreatorIQ

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="content-navigation">

          {/* DASHBOARD */}

          <div
            className="content-nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >

            <span>▦</span>

            Dashboard

          </div>

          {/* CONTENT */}

          <div className="content-nav-item active">

            <span>▤</span>

            Content

          </div>

          {/* AUDIENCE */}

          <div
            className="content-nav-item"
            onClick={() =>
              navigate("/audience")
            }
          >

            <span>◉</span>

            Audience

          </div>

          {/* GROWTH */}

          <div
            className="content-nav-item"
            onClick={() =>
              navigate("/growth-trends")
            }
          >

            <span>↗</span>

            Growth & Trends

          </div>

          {/* EARNINGS */}

          <div
            className="content-nav-item"
            onClick={() =>
              navigate("/earnings")
            }
          >

            <span>₹</span>

            Earnings

          </div>

          <div
            className="content-nav-item"
            onClick={() =>
              navigate("/sponsorships")
            }
          >

            <span>◇</span>

            Sponsorships

          </div>

          <div
            className="content-nav-item"
            onClick={() =>
              navigate("/reports")
            }
          >

            <span>▧</span>

            Reports

          </div>

          <div
            className="content-nav-item"
            onClick={() =>
              navigate("/instagram-analytics")
            }
          >

            <span>◎</span>

            Instagram Analytics

          </div>

          {/* SOCIAL MEDIA */}

          <div
            className="content-nav-item"
            onClick={() =>
              navigate("/social-media")
            }
          >

            <span>◎</span>

            Social Media

          </div>

          {/* SETTINGS */}

          <div
            className="content-nav-item"
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
          MAIN AREA
      ================================================= */}

      <main className="content-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="content-header">

          <div>

            <div className="page-label">
              CREATOR ANALYTICS
            </div>

            <h1>
              Content Analytics
            </h1>

            <p>

              Search any{" "}

              {isX
                ? "X account"
                : "YouTube channel"}{" "}

              and explore its public
              content performance.

            </p>

          </div>

          <div className="header-status">

            <span className="status-dot"></span>

            Live data

          </div>

        </header>

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="youtube-search-card">

          <div className="youtube-search-box">

            <div className="search-input-wrapper">

              <span
                className="search-symbol"
                aria-hidden="true"
              ></span>

              <input
                type="text"
                value={channelName}
                onChange={(e) => {

                  setChannelName(
                    e.target.value
                  );

                  if (error) {
                    setError("");
                  }

                }}
                onKeyDown={(e) => {

                  if (e.key === "Enter") {
                    analyzeChannel();
                  }

                }}
                placeholder={
                  isX
                    ? "Search X account name..."
                    : "Search YouTube channel..."
                }
                aria-label={
                  isX
                    ? "Search X account name"
                    : "Search YouTube channel"
                }
              />

            </div>

            <button
              className="analyze-button"
              onClick={analyzeChannel}
              disabled={loading}
            >

              {loading
                ? "Analyzing..."
                : isX
                ? "Analyze X Account →"
                : "Analyze Channel →"}

            </button>

          </div>

          {error && (
            <div className="content-error">
              {error}
            </div>
          )}

        </section>

        {/* =================================================
            X PROFILE
        ================================================= */}

        {isX && xAccount && (

          <section className="channel-profile-card">

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >

              {channelImage ? (

                <img
                  src={channelImage}
                  alt={displayChannelName}
                  referrerPolicy="no-referrer"
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                  onError={(e) => {

                    e.currentTarget.style.display =
                      "none";

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
                    flexShrink: 0,
                  }}
                >

                  {String(
                    displayChannelName
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

              )}

              <div>

                <h2
                  style={{
                    margin: 0,
                    color: "#182b3d",
                  }}
                >

                  {displayChannelName}

                </h2>

                {xAccount.username && (

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#56708f",
                    }}
                  >

                    @{xAccount.username}

                  </p>

                )}

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            YOUTUBE PROFILE
        ================================================= */}

        {!isX && channel && (

          <section className="channel-profile-card">

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >

              {channelImage ? (

                <img
                  src={channelImage}
                  alt={displayChannelName}
                  referrerPolicy="no-referrer"
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                  onError={(e) => {

                    e.currentTarget.style.display =
                      "none";

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
                    flexShrink: 0,
                  }}
                >

                  {String(
                    displayChannelName
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

              )}

              <h2
                style={{
                  margin: 0,
                  color: "#182b3d",
                }}
              >

                {displayChannelName}

              </h2>

            </div>

          </section>

        )}

        {/* =================================================
            X KPI CARDS
        ================================================= */}

        {data && isX && (

          <section className="content-kpi-grid">

            {/* FOLLOWERS */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  FOLLOWERS
                </span>

                <div className="blue-kpi-icon">
                  ◎
                </div>

              </div>

              <h2>
                {formatNumber(
                  xAccount?.followers
                )}
              </h2>

              <p>
                X account followers
              </p>

            </div>

            {/* FOLLOWING */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  FOLLOWING
                </span>

                <div className="blue-kpi-icon">
                  ◉
                </div>

              </div>

              <h2>
                {formatNumber(
                  xAccount?.following
                )}
              </h2>

              <p>
                Accounts following
              </p>

            </div>

            {/* POSTS */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  POSTS
                </span>

                <div className="blue-kpi-icon">
                  ▤
                </div>

              </div>

              <h2>
                {formatInteger(
                  xAccount?.posts ??
                  xAccount?.tweet_count
                )}
              </h2>

              <p>
                Total posts
              </p>

            </div>

            {/* IMPRESSIONS */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  IMPRESSIONS
                </span>

                <div className="blue-kpi-icon">
                  ◉
                </div>

              </div>

              <h2>
                {formatNumber(
                  xTotalViews
                )}
              </h2>

              <p>
                Recent post impressions
              </p>

            </div>

            {/* LIKES */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  LIKES
                </span>

                <div className="blue-kpi-icon">
                  ♡
                </div>

              </div>

              <h2>
                {formatNumber(
                  xTotalLikes
                )}
              </h2>

              <p>
                Recent post likes
              </p>

            </div>

            {/* ENGAGEMENT */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  ENGAGEMENT RATE
                </span>

                <div className="blue-kpi-icon">
                  %
                </div>

              </div>

              <h2>
                {xEngagementRate.toFixed(2)}%
              </h2>

              <p>
                Recent post engagement
              </p>

            </div>

          </section>

        )}

        {/* =================================================
            YOUTUBE KPI CARDS
        ================================================= */}

        {data && !isX && (

          <section className="content-kpi-grid">

            {/* TOTAL VIEWS */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  TOTAL VIEWS
                </span>

                <div className="blue-kpi-icon">
                  ◉
                </div>

              </div>

              <h2>
                {formatNumber(
                  channel?.total_views
                )}
              </h2>

              <p>
                Channel lifetime views
              </p>

            </div>

            {/* LIKES */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  LIKES
                </span>

                <div className="blue-kpi-icon">
                  ♡
                </div>

              </div>

              <h2>
                {formatNumber(
                  analytics?.recent_video_likes
                )}
              </h2>

              <p>
                Recent video likes
              </p>

            </div>

            {/* COMMENTS */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  COMMENTS
                </span>

                <div className="blue-kpi-icon">
                  ◌
                </div>

              </div>

              <h2>
                {formatNumber(
                  analytics?.recent_video_comments
                )}
              </h2>

              <p>
                Recent video comments
              </p>

            </div>

            {/* ENGAGEMENT */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  ENGAGEMENT RATE
                </span>

                <div className="blue-kpi-icon">
                  %
                </div>

              </div>

              <h2>
                {analytics?.engagement_rate ?? 0}%
              </h2>

              <p>
                Average engagement
              </p>

            </div>

            {/* SUBSCRIBERS */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  SUBSCRIBERS
                </span>

                <div className="blue-kpi-icon">
                  ◎
                </div>

              </div>

              <h2>
                {formatNumber(
                  channel?.subscribers
                )}
              </h2>

              <p>
                Channel subscribers
              </p>

            </div>

            {/* VIDEOS */}

            <div className="content-kpi-card">

              <div className="kpi-top">

                <span>
                  VIDEOS
                </span>

                <div className="blue-kpi-icon">
                  ▤
                </div>

              </div>

              <h2>
                {formatNumber(
                  channel?.video_count
                )}
              </h2>

              <p>
                Total published videos
              </p>

            </div>

          </section>

        )}

        {/* =================================================
            CONTENT PERFORMANCE
        ================================================= */}

        {data && (

          <section className="blue-chart-card">

            <div className="section-heading-row">

              <div>

                <div className="section-label">
                  PERFORMANCE
                </div>

                <h2>

                  {isX
                    ? "X Content Performance Trend"
                    : "Content Performance Trend"}

                </h2>

                <p>

                  {isX
                    ? "Impressions and engagement from recent posts"
                    : "Views and engagement from recent videos"}

                </p>

              </div>

              <div className="chart-legend-custom">

                <span>

                  <i className="legend-blue"></i>

                  {isX
                    ? "Impressions"
                    : "Views"}

                </span>

                <span>

                  <i className="legend-light-blue"></i>

                  Engagement

                </span>

              </div>

            </div>

            <div className="content-chart">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <LineChart
                  data={chartData}
                  margin={{
                    top: 15,
                    right: 20,
                    left: 5,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#d8e3f0"
                  />

                  <XAxis
                    dataKey="date"
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
                    axisLine={{
                      stroke: "#cbd8e8",
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#10243f",
                      border:
                        "1px solid #294d78",
                      borderRadius: "10px",
                      color: "#ffffff",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="views"
                    name={
                      isX
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

                  <Line
                    type="monotone"
                    dataKey="engagement"
                    name="Engagement"
                    stroke="#4e82b8"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#4e82b8",
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </section>

        )}

        {/* =================================================
            TOP PERFORMING CONTENT
        ================================================= */}

        {data && (

          <section className="top-content-section">

            <div className="section-heading-row">

              <div>

                <div className="section-label">
                  CONTENT RANKING
                </div>

                <h2>
                  Top Performing Content
                </h2>

                <p>

                  {isX
                    ? "Your most viewed recent X posts"
                    : "Your most viewed recent videos"}

                </p>

              </div>

              <div className="video-count-badge">

                {topVideos.length}{" "}

                {isX
                  ? "posts"
                  : "videos"}

              </div>

            </div>

            {topVideos.length === 0 ? (

              <div className="empty-content">
                No content found.
              </div>

            ) : (

              <div className="top-video-grid">

                {topVideos.map(
                  (item, index) => {

                    if (isX) {

                      const metrics =
                        getXMetrics(item);

                      const postImages =
                        getXPostImages(item);

                      return (

                        <div
                          className="top-video-card"
                          key={
                            item.id ||
                            index
                          }
                        >

                          <div className="top-video-thumbnail">

                            {postImages.length > 0 ? (

                              <img
                                src={
                                  postImages[0]
                                }
                                alt="X post"
                                referrerPolicy="no-referrer"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                onError={(e) => {

                                  e.currentTarget.style.display =
                                    "none";

                                  const fallback =
                                    e.currentTarget.parentElement.querySelector(
                                      ".x-image-fallback"
                                    );

                                  if (fallback) {
                                    fallback.style.display =
                                      "flex";
                                  }

                                }}
                              />

                            ) : null}

                            <div
                              className="thumbnail-fallback x-image-fallback"
                              style={{
                                display:
                                  postImages.length > 0
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              𝕏
                            </div>

                            <div className="ranking-number">
                              #{index + 1}
                            </div>

                          </div>

                          <div className="top-video-details">

                            <h3>
                              {getXPostText(
                                item
                              )}
                            </h3>

                            <div className="video-stats">

                              <span>

                                ◉{" "}

                                {formatNumber(
                                  metrics.impression_count ||
                                  metrics.impressions
                                )}{" "}

                                impressions

                              </span>

                              <span>

                                ♡{" "}

                                {formatNumber(
                                  metrics.like_count ||
                                  metrics.likes
                                )}

                              </span>

                              <span>

                                ◌{" "}

                                {formatNumber(
                                  metrics.reply_count ||
                                  metrics.replies
                                )}

                              </span>

                            </div>

                            {item.created_at && (

                              <div className="published-date">

                                Published{" "}

                                {new Date(
                                  item.created_at
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}

                              </div>

                            )}

                          </div>

                        </div>

                      );

                    }

                    const thumbnail =
                      getThumbnail(item);

                    return (

                      <div
                        className="top-video-card"
                        key={
                          item.video_id ||
                          index
                        }
                      >

                        <div className="top-video-thumbnail">

                          {thumbnail ? (

                            <img
                              src={thumbnail}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              onError={(e) => {

                                e.currentTarget.style.display =
                                  "none";

                                e.currentTarget.parentElement.classList.add(
                                  "thumbnail-fallback"
                                );

                              }}
                            />

                          ) : (

                            <div className="thumbnail-fallback">
                              ▶
                            </div>

                          )}

                          <div className="ranking-number">
                            #{index + 1}
                          </div>

                          <div className="play-overlay">
                            ▶
                          </div>

                        </div>

                        <div className="top-video-details">

                          <h3>
                            {item.title}
                          </h3>

                          <div className="video-stats">

                            <span>

                              ◉{" "}

                              {formatNumber(
                                item.views
                              )}{" "}

                              views

                            </span>

                            <span>

                              ♡{" "}

                              {formatNumber(
                                item.likes
                              )}

                            </span>

                            <span>

                              ◌{" "}

                              {formatNumber(
                                item.comments
                              )}

                            </span>

                          </div>

                          {item.published_at && (

                            <div className="published-date">

                              Published{" "}

                              {new Date(
                                item.published_at
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}

                            </div>

                          )}

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </section>

        )}

        {/* =================================================
            LATEST CONTENT
        ================================================= */}

        {data && (

          <section className="latest-content-section">

            <div className="section-label">
              RECENT CONTENT
            </div>

            <h2>

              {isX
                ? "Latest X Posts"
                : "Latest Videos"}

            </h2>

            <p className="latest-subtitle">

              {isX
                ? "Recent posts published by this X account."
                : "Recent videos published by this channel."}

            </p>

            {(
              isX
                ? xPosts.length === 0
                : videos.length === 0
            ) ? (

              <div className="empty-content">
                No recent content found.
              </div>

            ) : (

              <div className="latest-video-list">

                {isX

                  ? xPosts.map(
                      (post, index) => {

                        const metrics =
                          getXMetrics(post);

                        const postImages =
                          getXPostImages(post);

                        return (

                          <div
                            className="latest-video-row"
                            key={
                              post.id ||
                              index
                            }
                          >

                            <div className="latest-video-info">

                              <div className="latest-thumbnail">

                                {postImages.length > 0 ? (

                                  <img
                                    src={
                                      postImages[0]
                                    }
                                    alt="X post"
                                    referrerPolicy="no-referrer"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                    onError={(e) => {

                                      e.currentTarget.style.display =
                                        "none";

                                      const fallback =
                                        e.currentTarget.parentElement.querySelector(
                                          ".x-image-fallback"
                                        );

                                      if (fallback) {
                                        fallback.style.display =
                                          "flex";
                                      }

                                    }}
                                  />

                                ) : null}

                                <div
                                  className="thumbnail-fallback x-image-fallback"
                                  style={{
                                    display:
                                      postImages.length > 0
                                        ? "none"
                                        : "flex",
                                  }}
                                >
                                  𝕏
                                </div>

                              </div>

                              <div className="latest-title">

                                {getXPostText(
                                  post
                                )}

                              </div>

                            </div>

                            <div className="latest-stat">

                              <span>
                                IMPRESSIONS
                              </span>

                              <strong>

                                {formatNumber(
                                  metrics.impression_count ||
                                  metrics.impressions
                                )}

                              </strong>

                            </div>

                            <div className="latest-stat">

                              <span>
                                LIKES
                              </span>

                              <strong>

                                {formatNumber(
                                  metrics.like_count ||
                                  metrics.likes
                                )}

                              </strong>

                            </div>

                            <div className="latest-stat">

                              <span>
                                REPOSTS
                              </span>

                              <strong>

                                {formatNumber(
                                  metrics.retweet_count ||
                                  metrics.retweets
                                )}

                              </strong>

                            </div>

                          </div>

                        );

                      }
                    )

                  : videos.map(
                      (video, index) => {

                        const thumbnail =
                          getThumbnail(video);

                        return (

                          <div
                            className="latest-video-row"
                            key={
                              video.video_id ||
                              index
                            }
                          >

                            <div className="latest-video-info">

                              <div className="latest-thumbnail">

                                {thumbnail ? (

                                  <img
                                    src={thumbnail}
                                    alt={video.title}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {

                                      e.currentTarget.style.display =
                                        "none";

                                      e.currentTarget.parentElement.classList.add(
                                        "thumbnail-fallback"
                                      );

                                    }}
                                  />

                                ) : (

                                  <div className="thumbnail-fallback">
                                    ▶
                                  </div>

                                )}

                                <span className="small-play">
                                  ▶
                                </span>

                              </div>

                              <div className="latest-title">

                                {video.title}

                              </div>

                            </div>

                            <div className="latest-stat">

                              <span>
                                VIEWS
                              </span>

                              <strong>

                                {formatNumber(
                                  video.views
                                )}

                              </strong>

                            </div>

                            <div className="latest-stat">

                              <span>
                                LIKES
                              </span>

                              <strong>

                                {formatNumber(
                                  video.likes
                                )}

                              </strong>

                            </div>

                            <div className="latest-stat">

                              <span>
                                COMMENTS
                              </span>

                              <strong>

                                {formatNumber(
                                  video.comments
                                )}

                              </strong>

                            </div>

                          </div>

                        );

                      }
                    )}

              </div>

            )}

          </section>

        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!data &&
          !loading &&
          !error && (

            <section className="content-empty-state">

              <div className="empty-icon">

                {isX
                  ? "𝕏"
                  : "▶"}

              </div>

              <h2>

                Analyze a{" "}

                {isX
                  ? "X Account"
                  : "YouTube Channel"}

              </h2>

              <p>

                Search for any{" "}

                {isX
                  ? "X account name"
                  : "YouTube channel"}{" "}

                above to see real public
                content analytics.

              </p>

            </section>

          )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <section className="content-empty-state">

            <div className="loading-spinner"></div>

            <h2>

              Analyzing{" "}

              {isX
                ? "X account"
                : "channel"}

              ...

            </h2>

            <p>

              Fetching public{" "}

              {isX
                ? "X"
                : "YouTube"}{" "}

              analytics.

            </p>

          </section>

        )}

      </main>

    </div>
  );
}

export default Content;