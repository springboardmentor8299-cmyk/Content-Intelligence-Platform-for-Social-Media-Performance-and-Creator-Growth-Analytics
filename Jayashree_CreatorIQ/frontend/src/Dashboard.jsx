import { useState } from "react";

const API_URL = "https://expert-chainsaw-gx76j44jv9jqfwvp9-8000.app.github.dev";

function Dashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed");
        return;
      }

      setMessage(data.message);
      setRole(data.role);
      setLoggedIn(true);
    } catch (error) {
      setMessage("Could not connect to backend");
    }
  }

  if (loggedIn) {
    return (
      <div>
        <h1>CreatorIQ Dashboard</h1>
        <p>Welcome, {username}!</p>
        <p>Role: {role}</p>

        <h2>Overview</h2>
        <p>Total Views: 0</p>
        <p>Total Followers: 0</p>
        <p>Total Engagement: 0%</p>
      </div>
    );
  }

  return (
    <div>
      <h1>CreatorIQ Login</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label>Username</label>
          <br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <br />

        <button type="submit">Login</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Dashboard;