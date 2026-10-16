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
date: new Date(item.synced_at).toLocaleString(),
subscribers: item.subscribers || 0,
views: item.total_views || 0,
videos: item.video_count || 0,
}));

return (
<div
style={{
padding: "30px",
fontFamily: "Arial, sans-serif",
maxWidth: "1400px",
margin: "0 auto",
}}
> <h1>CreatorIQ Analytics Dashboard</h1>

  {error && (
    <p style={{ color: "red" }}>
      {error}
    </p>
  )}

  <hr />

  <h2>YouTube Analytics</h2>

  <div
    style={{
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
      flexWrap: "wrap",
    }}
  >
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          searchYouTube();
        }
      }}
      placeholder="Search YouTube channel..."
      style={{
        padding: "10px",
        width: "300px",
        fontSize: "16px",
      }}
    />

    <button
      onClick={searchYouTube}
      disabled={youtubeLoading}
      style={{
        padding: "10px 20px",
        cursor: "pointer",
      }}
    >
      {youtubeLoading ? "Loading..." : "Search"}
    </button>
  </div>

  {youtubeError && (
    <p style={{ color: "red" }}>
      {youtubeError}
    </p>
  )}

  {searchResults.length > 0 && (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        marginBottom: "25px",
      }}
    >
      <h3>Search Results</h3>

      {searchResults.map((channel) => (
        <div
          key={channel.channel_id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            padding: "12px",
            borderBottom: "1px solid #eee",
          }}
        >
          {channel.thumbnail && (
            <img
              src={channel.thumbnail}
              alt={channel.title}
              width="80"
              height="80"
              style={{ borderRadius: "50%" }}
            />
          )}

          <div style={{ flex: 1 }}>
            <h4>{channel.title}</h4>

            <p>
              {channel.description
                ? channel.description.substring(0, 150)
                : "No description"}
            </p>
          </div>

          <button
            onClick={() =>
              loadYouTubeChannel(channel.channel_id)
            }
          >
            Select
          </button>
        </div>
      ))}
    </div>
  )}

  {youtubeOverview && (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          {youtubeOverview.thumbnail && (
            <img
              src={youtubeOverview.thumbnail}
              alt={youtubeOverview.title}
              width="90"
              height="90"
              style={{ borderRadius: "50%" }}
            />
          )}

          <div>
            <h2>{youtubeOverview.title}</h2>
            <p>
              Channel ID: {youtubeOverview.channel_id}
            </p>
          </div>
        </div>

        <button
          onClick={syncYouTubeChannel}
          disabled={youtubeLoading}
          style={{
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          {youtubeLoading
            ? "Syncing..."
            : "Sync Channel"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
          }}
        >
          <h3>Subscribers</h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {youtubeOverview.subscribers.toLocaleString()}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
          }}
        >
          <h3>Total Views</h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {youtubeOverview.total_views.toLocaleString()}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
          }}
        >
          <h3>Videos</h3>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {youtubeOverview.video_count.toLocaleString()}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
          }}
        >
          <h3>Published</h3>
          <p>
            {new Date(
              youtubeOverview.published_at
            ).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h2>Top 5 Videos</h2>

      {topVideos.length > 0 ? (
        <div
          style={{
            overflowX: "auto",
            marginBottom: "35px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                  }}
                >
                  Video
                </th>
                <th style={{ padding: "10px" }}>
                  Views
                </th>
                <th style={{ padding: "10px" }}>
                  Likes
                </th>
                <th style={{ padding: "10px" }}>
                  Comments
                </th>
                <th style={{ padding: "10px" }}>
                  Published
                </th>
              </tr>
            </thead>

            <tbody>
              {topVideos.map((video) => (
                <tr key={video.video_id}>
                  <td
                    style={{
                      padding: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        width="120"
                        height="68"
                      />
                    )}

                    <span>{video.title}</span>
                  </td>

                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    {video.views.toLocaleString()}
                  </td>

                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    {video.likes.toLocaleString()}
                  </td>

                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    {video.comments.toLocaleString()}
                  </td>

                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    {new Date(
                      video.published_at
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No top videos available.</p>
      )}

      <h2>YouTube Growth History</h2>

      {youtubeGrowthData.length > 0 ? (
        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <LineChart data={youtubeGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="subscribers"
              name="Subscribers"
            />

            <Line
              type="monotone"
              dataKey="views"
              name="Total Views"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>
          No growth history available yet. Click
          "Sync Channel" to create a snapshot.
        </p>
      )}

      <hr />
    </div>
  )}

  <h2>Engagement Overview</h2>

  {engagement && (
    <div>
      <p>
        <strong>Total Engagement:</strong>{" "}
        {engagement.total_engagement}
      </p>

      <p>
        <strong>Engagement Rate:</strong>{" "}
        {engagement.engagement_rate}%
      </p>
    </div>
  )}

  <h2>Audience Overview</h2>

  {audience && (
    <div>
      <p>
        <strong>Followers:</strong>{" "}
        {audience.followers}
      </p>

      <p>
        <strong>New Followers:</strong>{" "}
        {audience.new_followers}
      </p>

      <p>
        <strong>Returning Followers:</strong>{" "}
        {audience.returning_followers}
      </p>

      <p>
        <strong>Growth Rate:</strong>{" "}
        {audience.growth_rate}%
      </p>
    </div>
  )}

  <h2>Growth Trends</h2>

  {trendData.length > 0 && (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          dataKey="value"
          name="Trend"
        />
      </LineChart>
    </ResponsiveContainer>
  )}

  <h2>Social Media Performance</h2>

  {platformData.length > 0 && (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <BarChart data={platformData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="platform" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Bar dataKey="followers" />
        <Bar dataKey="views" />
      </BarChart>
    </ResponsiveContainer>
  )}

  <h2>Platform Details</h2>

  {platformData.map((platform) => (
    <div key={platform.platform}>
      <h3>{platform.platform}</h3>
      <p>Followers: {platform.followers}</p>
      <p>Likes: {platform.likes}</p>
      <p>Comments: {platform.comments}</p>
      <p>Shares: {platform.shares}</p>
      <p>Views: {platform.views}</p>
    </div>
  ))}
</div>

);
}

export default App;
