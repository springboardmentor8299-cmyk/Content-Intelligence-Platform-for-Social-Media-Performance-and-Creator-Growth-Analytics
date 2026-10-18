import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./instagram-analytics.css";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: "▦" },
  { label: "Content", path: "/content", icon: "▤" },
  { label: "Audience", path: "/audience", icon: "◉" },
  { label: "Growth & Trends", path: "/growth-trends", icon: "↗" },
  { label: "Earnings", path: "/earnings", icon: "₹" },
  { label: "Sponsorships", path: "/sponsorships", icon: "◇" },
  { label: "Social Media", path: "/social-media", icon: "◎" },
  { label: "Reports", path: "/reports", icon: "▧" },
  { label: "Instagram Analytics", path: "/instagram-analytics", icon: "◎" },
  { label: "Settings", path: "/settings", icon: "⚙" },
];

const formatCount = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return new Intl.NumberFormat().format(value);
  }
  if (typeof value === "string" && value.trim()) {
    const count = value.trim();
    if (!/\d/.test(count)) {
      return null;
    }
    return count;
  }
  return null;
};

const postMetric = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const count = value.trim();
    const normalized = /^\d{1,3}(?:,\d{3})+$/.test(count)
      ? count.replaceAll(",", "")
      : count;
    const metric = Number(normalized);
    if (!Number.isFinite(metric)) {
      return null;
    }
    return metric >= 0 ? metric : null;
  }
  return null;
};

const getAverage = (posts, field) => {
  const values = posts
    .map((post) => postMetric(post[field]))
    .filter((value) => value !== null);

  if (values.length === 0) {
    return null;
  }

  return {
    value: values.reduce((total, value) => total + value, 0) / values.length,
    count: values.length,
  };
};

const getPostTimestamp = (post) => {
  if (typeof post.date !== "string" || !post.date.trim()) {
    return null;
  }

  const timestamp = Date.parse(post.date);
  return Number.isFinite(timestamp) ? timestamp : null;
};

const getLocalDateString = (timestamp) => {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const formatAverage = (average) => (
  average === null
    ? "Unavailable"
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(average.value)
);

const safeHttpUrl = (value) => {
  if (typeof value !== "string" || !value) {
    return null;
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

function getErrorMessage(error) {
  const status = error.response?.status;
  const detail = error.response?.data?.detail;

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 422) {
    return typeof detail === "string"
      ? detail
      : "Enter a valid Instagram username.";
  }
  if (status === 429) {
    return typeof detail === "string"
      ? detail
      : "The profile data service is rate limited. Try again later.";
  }
  if (status === 503) {
    return typeof detail === "string"
      ? detail
      : "Instagram profile lookup is not configured on the backend.";
  }
  if (status === 404) {
    return typeof detail === "string" ? detail : "Instagram profile was not found.";
  }
  if (status === 502 || status === 504) {
    return typeof detail === "string"
      ? detail
      : "The profile data service is temporarily unavailable.";
  }
  if (status) {
    return "Could not load this Instagram profile. Please try again.";
  }
  return "Could not connect to CreatorIQ. Check that the backend is running.";
}

function formatPostDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function InstagramAnalytics() {
  const navigate = useNavigate();
  const isSearchingRef = useRef(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [searchedUsername, setSearchedUsername] = useState("");
  const [lastFetched, setLastFetched] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [dateRangeError, setDateRangeError] = useState("");
  const [postSort, setPostSort] = useState("date");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  const searchProfile = async (event) => {
    event.preventDefault();
    if (isSearchingRef.current) {
      return;
    }
    if (!localStorage.getItem("token")) {
      setError("Sign in to look up public Instagram profiles.");
      return;
    }

    const username = usernameInput.trim().replace(/^@/, "");
    if (!/^(?!\.)(?!.*\.\.)[A-Za-z0-9._]{1,30}(?<!\.)$/.test(username)) {
      setError("Enter a username with up to 30 letters, numbers, dots, or underscores.");
      return;
    }

    isSearchingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const response = await api.get(
        `/instagram/profile/${encodeURIComponent(username)}`
      );
      setProfileData(response.data);
      setSearchedUsername(username);
      setLastFetched(new Date());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      isSearchingRef.current = false;
      setLoading(false);
    }
  };

  const profile = profileData?.profile;
  const posts = Array.isArray(profileData?.posts) ? profileData.posts : [];
  const hasInvalidDateRange = Boolean(startDate && endDate && endDate < startDate);
  const filteredPosts = posts
    .map((post, index) => ({ post, index, timestamp: getPostTimestamp(post) }))
    .filter(({ timestamp }) => {
      if (!appliedStartDate && !appliedEndDate) {
        return true;
      }

      if (timestamp === null) {
        return false;
      }

      const postDate = getLocalDateString(timestamp);
      return (!appliedStartDate || postDate >= appliedStartDate) &&
        (!appliedEndDate || postDate <= appliedEndDate);
    })
    .sort((left, right) => {
      if (postSort === "likes" || postSort === "comments") {
        const field = postSort;
        const leftMetric = postMetric(left.post[field]);
        const rightMetric = postMetric(right.post[field]);
        if (leftMetric === null && rightMetric !== null) return 1;
        if (rightMetric === null && leftMetric !== null) return -1;
        if (leftMetric !== null && rightMetric !== null && leftMetric !== rightMetric) {
          return rightMetric - leftMetric;
        }
      }

      if (left.timestamp === null && right.timestamp !== null) return 1;
      if (right.timestamp === null && left.timestamp !== null) return -1;
      if (left.timestamp !== null && right.timestamp !== null) {
        return right.timestamp - left.timestamp;
      }
      return left.index - right.index;
    });
  const averageLikes = getAverage(posts, "likes");
  const averageComments = getAverage(posts, "comments");
  const numericFollowers = postMetric(profile?.followers);
  const likesTotal = posts.reduce((total, post) => total + (postMetric(post.likes) ?? 0), 0);
  const commentsTotal = posts.reduce((total, post) => total + (postMetric(post.comments) ?? 0), 0);
  const validEngagementPostCount = posts.filter(
    (post) => postMetric(post.likes) !== null || postMetric(post.comments) !== null
  ).length;
  const estimatedEngagementRate = numericFollowers > 0 && validEngagementPostCount > 0
    ? ((likesTotal + commentsTotal) / numericFollowers) * 100
    : null;
  const bestLikes = posts.reduce((best, post) => {
    const likes = postMetric(post.likes);
    return likes !== null && (best === null || likes > best) ? likes : best;
  }, null);
  const bestComments = posts.reduce((best, post) => {
    const comments = postMetric(post.comments);
    return comments !== null && (best === null || comments > best) ? comments : best;
  }, null);
  const chartPosts = filteredPosts.map(({ post, index, timestamp }) => ({
    name: timestamp === null
      ? `Post ${index + 1}`
      : `${new Date(timestamp).toLocaleDateString()} (#${index + 1})`,
    likes: postMetric(post.likes),
    comments: postMetric(post.comments),
    views: postMetric(post.video_view_count ?? post.video_play_count),
  }));
  const hasComparablePostMetrics =
    chartPosts.filter((post) => post.likes !== null).length > 1 ||
    chartPosts.filter((post) => post.comments !== null).length > 1;
  const hasComparablePostViews =
    chartPosts.filter((post) => post.views !== null).length > 1;
  const followerCount = formatCount(profile?.followers);
  const followingCount = formatCount(profile?.following);
  const postCount = formatCount(profile?.posts_count);

  return (
    <div className="instagram-page">
      <aside className="instagram-sidebar">
        <button
          className="instagram-logo"
          onClick={() => navigate("/dashboard")}
        >
          ✦ CreatorIQ
        </button>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.path}
              className={item.path === "/instagram-analytics" ? "active" : ""}
              aria-current={item.path === "/instagram-analytics" ? "page" : undefined}
              onClick={() => navigate(item.path)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="instagram-main">
        <header className="instagram-header">
          <div>
            <span className="instagram-eyebrow">SOCIAL MEDIA · PUBLIC DATA</span>
            <h1>Instagram Analytics</h1>
            <p>
              Explore public profile details and recent posts. This is a profile
              snapshot, not private Instagram Insights.
            </p>
          </div>
        </header>

        <section className="instagram-search-card">
          <form onSubmit={searchProfile}>
            <label htmlFor="instagram-username">Instagram username</label>
            <div className="instagram-search-row">
              <div className="instagram-username-field">
                <span aria-hidden="true">@</span>
                <input
                  id="instagram-username"
                  type="text"
                  autoComplete="off"
                  placeholder="username"
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                  disabled={loading || !isAuthenticated}
                  maxLength={31}
                />
              </div>
              <button
                className="instagram-primary"
                type="submit"
                disabled={loading || !isAuthenticated}
              >
                {loading ? "Searching..." : profileData ? "Search again" : "Search"}
              </button>
              {profileData && (
                <button
                  className="instagram-secondary"
                  type="button"
                  onClick={searchProfile}
                  disabled={loading}
                >
                  Refresh
                </button>
              )}
            </div>
            <p className="instagram-help">Enter a username with or without @.</p>
          </form>
          {!isAuthenticated && (
            <div className="instagram-inline-message">
              Sign in to search public Instagram profiles.
              <button onClick={() => navigate("/login")}>Sign in</button>
            </div>
          )}
          {error && <div className="instagram-message error" role="alert">{error}</div>}
          {loading && (
            <div className="instagram-loading" role="status">
              <span className="instagram-spinner" />
              Fetching public profile data...
            </div>
          )}
        </section>

        {profile && (
          <>
            <div className="instagram-result-meta" role="status">
              <span>
                Public profile snapshot for <strong>@{profile.username || searchedUsername}</strong>
              </span>
              {lastFetched && (
                <span>Last fetched {lastFetched.toLocaleString()}</span>
              )}
            </div>

            <section className="instagram-profile-card">
              <div className="instagram-profile-top">
                {safeHttpUrl(profile.profile_pic_url) ? (
                  <img
                    className="instagram-avatar"
                    src={safeHttpUrl(profile.profile_pic_url)}
                    alt={`${profile.username || searchedUsername} profile`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="instagram-avatar-placeholder" aria-hidden="true">◎</div>
                )}
                <div className="instagram-profile-heading">
                  <div className="instagram-profile-username">
                    <h2>@{profile.username || searchedUsername}</h2>
                    {profile.is_verified === true && (
                      <span className="instagram-verified" aria-label="Verified">✓</span>
                    )}
                  </div>
                  {typeof profile.full_name === "string" && profile.full_name && (
                    <p>{profile.full_name}</p>
                  )}
                  {typeof profile.category_name === "string" && profile.category_name && (
                    <span className="instagram-category">{profile.category_name}</span>
                  )}
                  {profile.is_professional_account === true && (
                    <span className="instagram-category">Professional account</span>
                  )}
                </div>
              </div>

              {typeof profile.biography === "string" && profile.biography && (
                <p className="instagram-biography">{profile.biography}</p>
              )}

              <div className="instagram-profile-stats">
                {followerCount !== null && (
                  <div><strong>{followerCount}</strong><span>Followers</span></div>
                )}
                {followingCount !== null && (
                  <div><strong>{followingCount}</strong><span>Following</span></div>
                )}
                {postCount !== null && (
                  <div><strong>{postCount}</strong><span>Posts</span></div>
                )}
                <div>
                  <strong>{profile.is_verified === true ? "Yes" : profile.is_verified === false ? "No" : "—"}</strong>
                  <span>Verified</span>
                </div>
              </div>

              {safeHttpUrl(profile.external_url) && (
                <a
                  className="instagram-external-link"
                  href={safeHttpUrl(profile.external_url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit profile website ↗
                </a>
              )}
            </section>

            <section className="instagram-overview-section" aria-label="Profile overview metrics">
              <div className="instagram-overview-heading">
                <div>
                  <span className="instagram-section-eyebrow">PROFILE SNAPSHOT</span>
                  <h2>Overview</h2>
                </div>
                <span>Current public counts and metrics from {posts.length} posts returned</span>
              </div>
              <div className="instagram-overview-grid">
                <article className="instagram-overview-card">
                  <span>Followers</span>
                  <strong>{followerCount ?? "Unavailable"}</strong>
                  <small>Current profile snapshot</small>
                </article>
                <article className="instagram-overview-card">
                  <span>Following</span>
                  <strong>{followingCount ?? "Unavailable"}</strong>
                  <small>Current profile snapshot</small>
                </article>
                <article className="instagram-overview-card">
                  <span>Total posts</span>
                  <strong>{postCount ?? "Unavailable"}</strong>
                  <small>Current profile snapshot</small>
                </article>
                <article className="instagram-overview-card">
                  <span>Average likes</span>
                  <strong>{formatAverage(averageLikes)}</strong>
                  <small>
                    {averageLikes
                      ? `Across ${averageLikes.count} posts with visible likes`
                      : "Unavailable in retrieved posts"}
                  </small>
                </article>
                <article className="instagram-overview-card">
                  <span>Average comments</span>
                  <strong>{formatAverage(averageComments)}</strong>
                  <small>
                    {averageComments
                      ? `Across ${averageComments.count} posts with visible comments`
                      : "Unavailable in retrieved posts"}
                  </small>
                </article>
                <article className="instagram-overview-card engagement">
                  <span>Estimated engagement rate</span>
                  <strong>
                    {estimatedEngagementRate === null
                      ? "Unavailable"
                      : `${estimatedEngagementRate.toFixed(2)}%`}
                  </strong>
                  <small>
                    {estimatedEngagementRate === null
                      ? "Requires visible interactions and a non-zero follower count"
                      : `(Interactions from ${validEngagementPostCount} returned posts ÷ current followers)`}
                  </small>
                </article>
              </div>
              <p className="instagram-methodology">
                Estimated engagement uses the sum of available likes and comments
                from the retrieved posts divided by current followers × 100.
                Missing interaction counts are excluded. This is an estimate from
                a public snapshot, not official Instagram Insights.
              </p>
            </section>

            {hasComparablePostMetrics && (
              <section className="instagram-section-card">
                <div className="instagram-section-heading">
                  <div>
                    <span className="instagram-section-eyebrow">RECENT PUBLIC POSTS</span>
                    <h2>Likes and comments by post</h2>
                  </div>
                </div>
                <p className="instagram-chart-caption">
                  Recent-post comparison for the posts returned by SerpApi.
                  Missing values are not estimated; this is not historical account analytics.
                </p>
                <div className="instagram-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartPosts} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5ebf2" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="likes" fill="#315efb" name="Likes" />
                      <Bar dataKey="comments" fill="#39a6a3" name="Comments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {hasComparablePostViews && (
              <section className="instagram-section-card">
                <div className="instagram-section-heading">
                  <div>
                    <span className="instagram-section-eyebrow">VIDEO POSTS</span>
                    <h2>Views by recent post</h2>
                  </div>
                </div>
                <p className="instagram-chart-caption">
                  View or play counts are shown only when supplied for at least
                  two retrieved posts. This is not a historical view trend.
                </p>
                <div className="instagram-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartPosts} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5ebf2" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="views" fill="#8b5cf6" name="Views / plays" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <section className="instagram-section-card">
              <div className="instagram-section-heading">
                <div>
                  <span className="instagram-section-eyebrow">PROFILE CONTENT</span>
                  <h2>Recent public posts</h2>
                </div>
                <div className="instagram-post-heading-actions">
                  <label className="instagram-date-toggle">
                    <input
                      type="checkbox"
                      checked={showDateFilter}
                      onChange={(event) => {
                        const enabled = event.target.checked;
                        setShowDateFilter(enabled);
                        if (!enabled) {
                          setStartDate("");
                          setEndDate("");
                          setAppliedStartDate("");
                          setAppliedEndDate("");
                          setDateRangeError("");
                        }
                      }}
                    />
                    <span className="instagram-date-toggle-check" aria-hidden="true">✓</span>
                    Filter by date
                  </label>
                  <span className="instagram-post-count">
                    {posts.length} {posts.length === 1 ? "post" : "posts"} returned
                  </span>
                </div>
              </div>

              <div className="instagram-post-controls">
                {showDateFilter && (
                  <div className="instagram-date-filters">
                    <label>
                      Start date
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => {
                          setStartDate(event.target.value);
                          setDateRangeError("");
                        }}
                      />
                    </label>
                    <label>
                      End date
                      <input
                        type="date"
                        value={endDate}
                        onChange={(event) => {
                          setEndDate(event.target.value);
                          setDateRangeError("");
                        }}
                      />
                    </label>
                    <button
                      className="instagram-apply-filters"
                      type="button"
                      onClick={() => {
                        if (hasInvalidDateRange) {
                          setDateRangeError(
                            "The end date must be the same as or later than the start date."
                          );
                          return;
                        }
                        setAppliedStartDate(startDate);
                        setAppliedEndDate(endDate);
                        setDateRangeError("");
                      }}
                    >
                      Apply dates
                    </button>
                    {(startDate || endDate) && (
                      <button
                        className="instagram-clear-filters"
                        type="button"
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                          setAppliedStartDate("");
                          setAppliedEndDate("");
                          setDateRangeError("");
                        }}
                      >
                        Clear dates
                      </button>
                    )}
                  </div>
                )}
                <label className="instagram-sort-control">
                  Sort by
                  <select
                    value={postSort}
                    onChange={(event) => setPostSort(event.target.value)}
                  >
                    <option value="date">Date</option>
                    <option value="likes">Likes</option>
                    <option value="comments">Comments</option>
                  </select>
                </label>
              </div>
              <p className="instagram-filter-note">
                Date filters apply only to retrieved posts with usable publication
                dates; SerpApi may return only a subset of the account’s posts.
              </p>
              {dateRangeError && (
                <div className="instagram-message error" role="alert">
                  {dateRangeError}
                </div>
              )}

              {posts.length === 0 ? (
                <div className="instagram-empty">
                  <strong>No public posts were included in this response.</strong>
                  <p>
                    SerpApi returned the profile snapshot only. Historical
                    insights, reach, impressions, and audience demographics are
                    not provided by this profile lookup.
                  </p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="instagram-empty">
                  <strong>
                    {dateRangeError
                      ? "Check the selected date range."
                      : "No retrieved posts match these dates."}
                  </strong>
                  <p>
                    {dateRangeError
                      ? "Choose an end date that is not earlier than the start date."
                      : "Posts without a usable publication date cannot match a date filter. Clear the dates to see all retrieved posts."}
                  </p>
                </div>
              ) : (
                <div className="instagram-post-grid">
                  {filteredPosts.map(({ post, index }) => {
                    const date = formatPostDate(post.date);
                    const likes = formatCount(post.likes);
                    const comments = formatCount(post.comments);
                    const views = formatCount(
                      post.video_view_count ?? post.video_play_count
                    );
                    const likesValue = postMetric(post.likes);
                    return (
                      <article className="instagram-post-card" key={post.id || post.shortcode || index}>
                        {safeHttpUrl(post.media_url) ? (
                          <img
                            className="instagram-post-media"
                            src={safeHttpUrl(post.media_url)}
                            alt={typeof post.caption === "string" ? post.caption : `Public post ${index + 1}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="instagram-post-placeholder">◎</div>
                        )}
                        <div className="instagram-post-body">
                          <div className="instagram-best-post-labels">
                            {likesValue !== null && bestLikes !== null && likesValue === bestLikes && (
                              <span className="instagram-best-post">Top likes</span>
                            )}
                            {postMetric(post.comments) !== null &&
                              bestComments !== null &&
                              postMetric(post.comments) === bestComments && (
                                <span className="instagram-best-post">Top comments</span>
                              )}
                          </div>
                          <div className="instagram-post-details">
                            {date && <span>{date}</span>}
                            {post.is_video === true && <span>Video</span>}
                          </div>
                          {typeof post.caption === "string" && post.caption && (
                            <p className="instagram-post-caption">{post.caption}</p>
                          )}
                          <div className="instagram-post-metrics">
                            <span>♥ {likes ?? "Unavailable"} likes</span>
                            <span>▢ {comments ?? "Unavailable"} comments</span>
                            {postMetric(post.video_view_count ?? post.video_play_count) !== null && (
                              <span>▶ {views} views / plays</span>
                            )}
                          </div>
                          {safeHttpUrl(post.url) && (
                            <a href={safeHttpUrl(post.url)} target="_blank" rel="noreferrer">
                              View post ↗
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {!profile && !loading && !error && (
          <section className="instagram-empty instagram-first-search">
            <span aria-hidden="true">◎</span>
            <strong>Look up a public Instagram profile</strong>
            <p>Search by username to view the profile snapshot and any recent posts returned by SerpApi.</p>
          </section>
        )}
      </main>
    </div>
  );
}
