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

const API_URL =
  "https://expert-chainsaw-gx76j44jv9jqfvvp9-8000.app.github.dev";

function App() {
  const [engagement, setEngagement] = useState(null);
  const [audience, setAudience] = useState(null);
  const [trends, setTrends] = useState(null);
  const [socialMedia, setSocialMedia] = useState(null);
  const [error, setError] = useState("");

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
          fetch(`${API_URL}/analytics/trends?data=100,120,150,180,200`),
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
        setError(`API Error: ${err.message}`);
      }
    };

    loadAnalytics();
  }, []);

  const trendData =
    trends?.data?.map((value, index) => ({
      name: `Day ${index + 1}`,
      value,
    })) || [];

  const platformData = socialMedia?.platforms || [];

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1>CreatorIQ Analytics Dashboard</h1>

      {error && <p>{error}</p>}

      <hr />

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
            <strong>Followers:</strong> {audience.followers}
          </p>
          <p>
            <strong>New Followers:</strong> {audience.new_followers}
          </p>
          <p>
            <strong>Returning Followers:</strong>{" "}
            {audience.returning_followers}
          </p>
          <p>
            <strong>Growth Rate:</strong> {audience.growth_rate}%
          </p>
        </div>
      )}

      <h2>Growth Trends</h2>

      {trendData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" />
          </LineChart>
        </ResponsiveContainer>
      )}

      <h2>Social Media Performance</h2>

      {platformData.length > 0 && (
        <ResponsiveContainer width="100%" height={350}>
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
