import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      // Save JWT token
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onLogin?.(response.data.user);

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Invalid email or password");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left branding section */}
      <div className="login-brand">

        <div className="brand-logo">
          ✦
          <span>CreatorIQ</span>
        </div>

        <div className="brand-content">

          <h1>
            Turn your content
            <br />
            into <span>insights.</span>
          </h1>

          <p>
            Track your content performance, understand your audience,
            and grow your creator business — all in one place.
          </p>

          <div className="stats-preview">

            <div>
              <strong>128K+</strong>
              <span>Views tracked</span>
            </div>

            <div>
              <strong>24K+</strong>
              <span>Creators</span>
            </div>

            <div>
              <strong>98%</strong>
              <span>Data accuracy</span>
            </div>

          </div>

        </div>

      </div>

      {/* Login section */}
      <div className="login-section">

        <div className="login-card">

          <div className="mobile-logo">
            ✦ CreatorIQ
          </div>

          <h2>Welcome back</h2>

          <p className="login-subtitle">
            Sign in to continue to your dashboard
          </p>

          {/* Error message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="input-group">

              <label>Email address</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

            {/* Password */}
            <div className="input-group">

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

            </div>

            <div className="forgot-password">
              <span>Forgot password?</span>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Register */}
          <div className="register-link">

            Don't have an account?

            <span onClick={() => navigate("/register")}>
              {" "}Create an account
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;