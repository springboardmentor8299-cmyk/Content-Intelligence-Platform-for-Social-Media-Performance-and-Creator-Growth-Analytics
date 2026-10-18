import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Creator");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      alert("Account created successfully!");

      navigate("/");
    } catch (error) {
      console.error(error);

      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left Section */}
      <div className="login-brand">
        <div className="brand-logo">
          ✦
          <span>CreatorIQ</span>
        </div>

        <div className="brand-content">
          <h1>
            Build your
            <br />
            creator <span>journey.</span>
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

      {/* Right Section */}
      <div className="login-section">
        <div className="login-card">

          <div className="mobile-logo">
            ✦ CreatorIQ
          </div>

          <h2>Create your account</h2>

          <p className="login-subtitle">
            Get started with your CreatorIQ dashboard
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* Name */}
            <div className="input-group">
              <label>Full name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div className="input-group">
              <label>Account type</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Creator">Creator</option>
                <option value="Agency">Agency</option>
                <option value="Marketing Team">
                  Marketing Team
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

          </form>

          <div className="register-link">
            Already have an account?
            <span onClick={() => navigate("/")}>
              {" "}Sign in
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Register;