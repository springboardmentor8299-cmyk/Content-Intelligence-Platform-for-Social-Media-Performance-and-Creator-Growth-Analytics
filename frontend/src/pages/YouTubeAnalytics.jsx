import { useState } from "react";
import { analyzeYouTubeChannel } from "../services/youtubeService";

function YouTubeAnalytics() {
  const [channelName, setChannelName] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!channelName.trim()) {
      setError("Please enter a YouTube channel name.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const result = await analyzeYouTubeChannel(channelName.trim());
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="youtube-page">

      <h1>YouTube Analytics</h1>

      <p>
        Analyze public YouTube channel performance
      </p>

      {/* SEARCH */}

      <div className="youtube-search">

        <input
          type="text"
          placeholder="Enter YouTube channel name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAnalyze();
            }
          }}
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="youtube-error">
          {error}
        </div>
      )}

      {/* RESULTS */}

      {data && (
        <div className="youtube-results">

          {/* CHANNEL */}

          <div className="channel-info">

            <img
              src={data.channel.thumbnail}
              alt={data.channel.channel_name}
            />

            <div>
              <h2>{data.channel.channel_name}</h2>

              <p>
                {data.channel.description ||
                  "No description available."}
              </p>
            </div>

          </div>

          {/* CHANNEL ANALYTICS */}

          <div className="analytics-grid">

            <div className="analytics-card">
              <h3>Subscribers</h3>
              <strong>
                {data.channel.subscribers.toLocaleString()}
              </strong>
            </div>

            <div className="analytics-card">
              <h3>Total Views</h3>
              <strong>
                {data.channel.total_views.toLocaleString()}
              </strong>
            </div>

            <div className="analytics-card">
              <h3>Total Videos</h3>
              <strong>
                {data.channel.video_count.toLocaleString()}
              </strong>
            </div>

            <div className="analytics-card">
              <h3>Engagement Rate</h3>
              <strong>
                {data.analytics.engagement_rate}%
              </strong>
            </div>

          </div>

          {/* RECENT ANALYTICS */}

          <h2>Recent Video Analytics</h2>

          <div className="analytics-grid">

            <div className="analytics-card">
              <h3>Recent Views</h3>
              <strong>
                {data.analytics.recent_video_views.toLocaleString()}
              </strong>
            </div>

            <div className="analytics-card">
              <h3>Recent Likes</h3>
              <strong>
                {data.analytics.recent_video_likes.toLocaleString()}
              </strong>
            </div>

            <div className="analytics-card">
              <h3>Recent Comments</h3>
              <strong>
                {data.analytics.recent_video_comments.toLocaleString()}
              </strong>
            </div>

          </div>

          {/* RECENT VIDEOS */}

          <h2>Recent Videos</h2>

          <div className="recent-videos">

            {data.recent_videos.map((video) => (

              <div
                className="video-card"
                key={video.video_id}
              >

                <h3>{video.title}</h3>

                <p>
                  Published:{" "}
                  {new Date(
                    video.published_at
                  ).toLocaleDateString()}
                </p>

                <div className="video-stats">

                  <span>
                    👁️ {video.views.toLocaleString()}
                  </span>

                  <span>
                    ❤️ {video.likes.toLocaleString()}
                  </span>

                  <span>
                    💬 {video.comments.toLocaleString()}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export default YouTubeAnalytics;