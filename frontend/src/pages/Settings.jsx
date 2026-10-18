import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  // =========================
  // PROFILE
  // =========================

  const [profile, setProfile] = useState({
    name: "Shaik Nazroom",
    email: "shaik@example.com",
  });

  const [editingProfile, setEditingProfile] = useState(false);

  // =========================
  // SECURITY
  // =========================

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  // =========================
  // NOTIFICATIONS
  // =========================

  const [notifications, setNotifications] = useState({
    email: true,
    analytics: true,
    marketing: false,
  });

  // =========================
  // APPEARANCE
  // =========================

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const role = JSON.parse(localStorage.getItem("user") || "null")?.role;
  const navigationItems = role === "Creator"
    ? [
        ["▦", "Dashboard", "/dashboard"],
        ["▤", "Content", "/content"],
        ["◉", "Audience", "/audience"],
        ["↗", "Growth & Trends", "/growth-trends"],
        ["₹", "Earnings", "/earnings"],
        ["◇", "Sponsorships", "/sponsorships"],
        ["▧", "Reports", "/reports"],
        ["◎", "Instagram Analytics", "/instagram-analytics"],
        ["🔗", "Social Media", "/social-media"],
        ["⚙", "Settings", "/settings"],
      ]
    : [
        ["▦", "Dashboard", "/dashboard"],
        ["⚙", "Settings", "/settings"],
      ];

  // =========================
  // YOUTUBE
  // =========================

  const [youtubeConnected, setYoutubeConnected] = useState(false);

  // =========================
  // LOAD SAVED SETTINGS
  // =========================

  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications");

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedProfile = localStorage.getItem("profile");

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const youtubeStatus = localStorage.getItem("youtubeConnected");

    if (youtubeStatus === "true") {
      setYoutubeConnected(true);
    }
  }, []);

  // =========================
  // DARK MODE
  // =========================

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // =========================
  // PROFILE
  // =========================

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = () => {
    localStorage.setItem("profile", JSON.stringify(profile));

    setEditingProfile(false);

    alert("Profile updated successfully!");
  };

  // =========================
  // PASSWORD
  // =========================

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const updatePassword = () => {
    if (
      !passwords.current ||
      !passwords.newPassword ||
      !passwords.confirm
    ) {
      alert("Please fill all password fields.");
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      alert("New passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    alert("Password changed successfully!");

    setPasswords({
      current: "",
      newPassword: "",
      confirm: "",
    });

    setShowPasswordForm(false);
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // =========================
  // DELETE ACCOUNT
  // =========================

  const deleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.clear();

    alert("Account deleted.");

    window.location.href = "/register";
  };

  // =========================
  // NOTIFICATIONS
  // =========================

  const toggleNotification = (type) => {
    const updatedNotifications = {
      ...notifications,
      [type]: !notifications[type],
    };

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "notifications",
      JSON.stringify(updatedNotifications)
    );
  };

  // =========================
  // APPEARANCE
  // =========================

  const toggleDarkMode = () => {
    setDarkMode((previous) => !previous);
  };

  // =========================
  // YOUTUBE
  // =========================

  const connectYouTube = () => {
    window.location.href =
      "http://localhost:8000/social/youtube/login";
  };

  const disconnectYouTube = () => {
    localStorage.removeItem("youtubeConnected");

    setYoutubeConnected(false);

    alert("YouTube disconnected.");
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="settings-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <nav className="settings-navigation" aria-label="Main navigation">
        {navigationItems.map(([icon, label, path]) => (
          <button
            key={path}
            className={`settings-nav-item${path === "/settings" ? " active" : ""}`}
            onClick={() => navigate(path)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>


      {/* =========================
          PROFILE
      ========================= */}

      <section className="settings-card">

        <div className="card-title">
          <h2>Profile</h2>
        </div>


        <div className="profile-content">

          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>


          <div className="profile-fields">

            <div className="form-group">

              <label>Name</label>

              {editingProfile ? (

                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />

              ) : (

                <div className="profile-value">
                  {profile.name}
                </div>

              )}

            </div>


            <div className="form-group">

              <label>Email</label>

              {editingProfile ? (

                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />

              ) : (

                <div className="profile-value">
                  {profile.email}
                </div>

              )}

            </div>


            <div className="profile-buttons">

              {editingProfile ? (

                <>
                  <button
                    className="primary-btn"
                    onClick={saveProfile}
                  >
                    Save Changes
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      setEditingProfile(false)
                    }
                  >
                    Cancel
                  </button>
                </>

              ) : (

                <button
                  className="primary-btn"
                  onClick={() =>
                    setEditingProfile(true)
                  }
                >
                  Edit Profile
                </button>

              )}

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          SECURITY
      ========================= */}

      <section className="settings-card">

        <div className="card-title">
          <h2>Security</h2>
        </div>


        <div className="security-row">

          <div>
            <h3>Password</h3>
          </div>


          <button
            className="secondary-btn"
            onClick={() =>
              setShowPasswordForm(
                !showPasswordForm
              )
            }
          >
            {showPasswordForm
              ? "Cancel"
              : "Change Password"}
          </button>

        </div>


        {/* PASSWORD FORM */}

        {showPasswordForm && (

          <div className="password-form">

            <div className="form-group">

              <label>Current Password</label>

              <input
                type="password"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />

            </div>


            <div className="form-group">

              <label>New Password</label>

              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />

            </div>


            <div className="form-group">

              <label>Confirm New Password</label>

              <input
                type="password"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />

            </div>


            <button
              className="primary-btn"
              onClick={updatePassword}
            >
              Update Password
            </button>

          </div>

        )}


        <div className="security-actions">

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>


          <button
            className="delete-btn"
            onClick={deleteAccount}
          >
            Delete Account
          </button>

        </div>

      </section>


      {/* =========================
          NOTIFICATIONS
      ========================= */}

      <section className="settings-card">

        <div className="card-title">
          <h2>Notifications</h2>
        </div>


        {/* EMAIL */}

        <div className="setting-option">

          <div>
            <h3>Email Notifications</h3>
          </div>


          <label className="switch">

            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() =>
                toggleNotification("email")
              }
            />

            <span className="slider"></span>

          </label>

        </div>


        {/* ANALYTICS */}

        <div className="setting-option">

          <div>
            <h3>Analytics Reports</h3>
          </div>


          <label className="switch">

            <input
              type="checkbox"
              checked={notifications.analytics}
              onChange={() =>
                toggleNotification("analytics")
              }
            />

            <span className="slider"></span>

          </label>

        </div>


        {/* MARKETING */}

        <div className="setting-option">

          <div>
            <h3>Marketing Emails</h3>
          </div>


          <label className="switch">

            <input
              type="checkbox"
              checked={notifications.marketing}
              onChange={() =>
                toggleNotification("marketing")
              }
            />

            <span className="slider"></span>

          </label>

        </div>

      </section>


      {/* =========================
          APPEARANCE
      ========================= */}

      <section className="settings-card">

        <div className="card-title">
          <h2>Appearance</h2>
        </div>


        <div className="setting-option">

          <div>
            <h3>Dark Mode</h3>
          </div>


          <label className="switch">

            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />

            <span className="slider"></span>

          </label>

        </div>

      </section>


      {/* =========================
          CONNECTED ACCOUNTS
      ========================= */}

      <section className="settings-card">

        <div className="card-title">
          <h2>Connected Accounts</h2>
        </div>


        {/* YOUTUBE */}

        <div className="social-account">

          <div className="social-info">

            <div className="youtube-icon">
              ▶
            </div>


            <div>

              <h3>YouTube</h3>

              <p>
                {youtubeConnected
                  ? "YouTube account connected"
                  : "YouTube account not connected"}
              </p>

            </div>

          </div>


          {youtubeConnected ? (

            <button
              className="disconnect-btn"
              onClick={disconnectYouTube}
            >
              Disconnect
            </button>

          ) : (

            <button
              className="youtube-btn"
              onClick={connectYouTube}
            >
              Connect
            </button>

          )}

        </div>


        {/* INSTAGRAM */}

        <div className="social-account">

          <div className="social-info">

            <div className="instagram-icon">
              ◎
            </div>


            <div>

              <h3>Instagram</h3>

              <p>
                Integration coming soon
              </p>

            </div>

          </div>


          <button
            className="disabled-btn"
            disabled
          >
            Coming Soon
          </button>

        </div>

      </section>

    </div>
  );
}

export default Settings;