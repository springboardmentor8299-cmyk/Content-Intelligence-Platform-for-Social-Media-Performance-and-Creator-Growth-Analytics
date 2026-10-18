const API_URL = "http://127.0.0.1:8000";

export async function analyzeYouTubeChannel(channelName) {
  const response = await fetch(
    `${API_URL}/social/youtube/analyze?channel_name=${encodeURIComponent(channelName)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to analyze YouTube channel");
  }

  return data;
}