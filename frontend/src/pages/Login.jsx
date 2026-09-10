import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      localStorage.setItem(
        "access_token",
        response.data.access_token
      );

      // Save user role
      localStorage.setItem(
        "user_role",
        response.data.role
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.detail ||
          "Invalid email or password"
        );
      } else {
        setError(
          "Unable to connect to the backend. Make sure FastAPI is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>CreatorIQ</h1>

        <p className="login-subtitle">
          Creator Intelligence OS
        </p>

        <h2>Welcome Back</h2>

        <p>
          Sign in to access your creator dashboard.
        </p>

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              borderRadius: "8px",
              background: "#3f1d1d",
              color: "#ff7b7b",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="register-text">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Register
          </button>

        </p>

      </div>
    </div>
  );
}

export default Login;