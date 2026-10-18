import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import api from "./services/api";

import Login from "./pages/login";
import Register from "./pages/register";

import Dashboard from "./pages/dashboard";
import Content from "./pages/content";
import Audience from "./pages/Audience";
import GrowthTrends from "./pages/growth-trends";
import Earnings from "./pages/Earnings";
import SocialMedia from "./pages/SocialMedia";
import Settings from "./pages/Settings";
import Sponsorships from "./pages/Sponsorships";
import Reports from "./pages/Reports";
import InstagramAnalytics from "./pages/InstagramAnalytics";

const ALL_ROLES = ["Creator", "Marketing Team", "Agency", "Administrator"];
const CREATOR_ROLES = ["Creator"];

function ProtectedRoute({ user, ready, authError, allowedRoles, children }) {
  if (!ready) {
    return <div className="session-loading">Loading your session...</div>;
  }

  if (authError) {
    return (
      <div className="session-error" role="alert">
        {authError}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(
    () => !localStorage.getItem("token")
  );
  const [authError, setAuthError] = useState("");

  const handleLogin = (loggedInUser) => {
    setAuthError("");
    setUser(loggedInUser);
  };

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      localStorage.getItem("theme") === "dark"
    );

    if (!localStorage.getItem("token")) {
      localStorage.removeItem("user");
      return;
    }

    api.get("/auth/me")
      .then(({ data }) => {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        } else {
          setAuthError("Unable to verify your session. Check the backend and reload.");
        }
      })
      .finally(() => setAuthReady(true));
  }, []);

  return (

    <BrowserRouter>

      <Routes>

        {/* =========================
            LOGIN
        ========================= */}

        <Route path="/" element={<Login onLogin={handleLogin} />} />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />


        {/* =========================
            REGISTER
        ========================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            DASHBOARD
        ========================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={ALL_ROLES}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================
            CONTENT
        ========================= */}

        <Route
          path="/content"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={CREATOR_ROLES}
            >
              <Content />
            </ProtectedRoute>
          }
        />


        {/* =========================
            AUDIENCE
        ========================= */}

        <Route
          path="/audience"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={CREATOR_ROLES}
            >
              <Audience />
            </ProtectedRoute>
          }
        />


        {/* =========================
            GROWTH & TRENDS
        ========================= */}

        <Route
          path="/growth-trends"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={CREATOR_ROLES}
            >
              <GrowthTrends />
            </ProtectedRoute>
          }
        />


        {/* =========================
            EARNINGS
        ========================= */}

        <Route
          path="/earnings"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={CREATOR_ROLES}
            >
              <Earnings />
            </ProtectedRoute>
          }
        />


        {/* =========================
            SOCIAL MEDIA
        ========================= */}

        <Route
          path="/social-media"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={CREATOR_ROLES}
            >
              <SocialMedia />
            </ProtectedRoute>
          }
        />


        {/* =========================
            SETTINGS
        ========================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={ALL_ROLES}
            >
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={CREATOR_ROLES}
            >
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instagram-analytics"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={CREATOR_ROLES}
            >
              <InstagramAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sponsorships"
          element={
            <ProtectedRoute
              user={user}
              ready={authReady}
              authError={authError}
              allowedRoles={CREATOR_ROLES}
            >
              <Sponsorships />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;