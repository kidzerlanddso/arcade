import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../api/axios";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

const getCurrentUserName = () => {
  const token = localStorage.getItem("token");

  if (!token) return "Profile";

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload.username || "Profile";
  } catch (error) {
    return "Profile";
  }
};

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const userName = getCurrentUserName();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const closeMenu = (event) => {
      if (!event.target.closest(".profile-menu")) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login", { replace: true });
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert("Please complete all password fields.");
      return;
    }

    if (!isStrongPassword(formData.newPassword)) {
      alert("New password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      alert("Password reset successfully.");
      setResetOpen(false);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Password reset failed.");
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/dashboard" className="app-brand" aria-label="Go to dashboard">
            <img src="src/assets/logo.png" alt="Logo" className="app-logo" />
          </Link>

          <nav className="app-header-nav" aria-label="Main navigation">
            <Link to="/dashboard">Dashboard</Link>

            <Link to="/profile">    Find an Alumni </Link>
            <Link to="/membership-request">    Membership Request</Link>

            <div className="profile-menu">
              <button
                type="button"
                className="profile-menu-button"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {userName} ▾
              </button>

              {menuOpen && (
                <div className="profile-menu-panel" role="menu">
                  <Link to="/profile/me" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      setResetOpen(true);
                    }}
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="btn btn-danger app-header-logout" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {children}

      {resetOpen && (
        <div className="modal-overlay" onClick={() => setResetOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button type="button" className="close-button" onClick={() => setResetOpen(false)}>
                ×
              </button>
            </div>

            <form className="auth-form" onSubmit={handleResetPassword}>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                placeholder="Current password"
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
              />

              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                placeholder="New password"
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, newPassword: event.target.value }))
                }
              />

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm new password"
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
              />

              <button type="submit" className="login-button">
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProtectedRoute;
