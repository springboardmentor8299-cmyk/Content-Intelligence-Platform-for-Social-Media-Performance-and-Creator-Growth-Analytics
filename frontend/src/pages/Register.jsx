import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("creator");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: name,
        email: email,
        password: password,
        role: role,
      });

      alert("Registration successful!");

      navigate("/login");

    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.detail ||
          "Registration failed"
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

        <h2>Create Account</h2>

        <p>
          Register to access your creator dashboard.
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

        <form onSubmit={handleRegister}>

          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <label>Role</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #34405c",
              borderRadius: "8px",
              background: "#0e1527",
              color: "white",
            }}
          >
            <option value="creator">Creator</option>
            <option value="agency">Agency</option>
            <option value="marketing_team">
              Marketing Team
            </option>
            <option value="administrator">
              Administrator
            </option>
          </select>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p className="register-text">
          Already have an account?{" "}

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </p>

      </div>
    </div>
  );
}

export default Register;