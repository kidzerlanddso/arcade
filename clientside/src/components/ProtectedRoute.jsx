import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import api, { setAccessToken } from "../api/axios";
import kl_logo from "../assets/logo.png";

const readSession = () => {
  const token = localStorage.getItem("token");
  if (!token)
    return {
      authenticated: false,
      admin: false,
      sparkles: false,
      username: "Account",
    };

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    const admin = [true, 1, "1", "true"].includes(payload.admin);
    const sparkles = [true, 1, "1", "true"].includes(payload.sparkles);
    return {
      authenticated: true,
      admin,
      sparkles,
      username: payload.username || "Account",
    };
  } catch {
    return {
      authenticated: true,
      admin: ["true", "1"].includes(localStorage.getItem("isAdmin")),
      sparkles: ["true", "1"].includes(localStorage.getItem("isSparkles")),
      username: "Account",
    };
  }
};

const isStrongPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

function ProtectedRoute({ children, adminOnly = false, sparklesOnly = false }) {
  const navigate = useNavigate();
  const session = readSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setAccessToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("isSparkles");
      navigate("/login", { replace: true });
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      alert("Please complete all password fields.");
      return;
    }
    if (!isStrongPassword(formData.newPassword)) {
      alert(
        "Use at least 8 characters with uppercase, lowercase, a number, and a special character.",
      );
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    try {
      await api.post("/auth/reset-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      alert("Password updated.");
      setResetOpen(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert(error?.response?.data?.message || "Password update failed.");
    }
  };

  if (!session.authenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !session.admin) {
    return session.sparkles ? (
      <Navigate to="/arcade/sparkles" replace />
    ) : (
      <Navigate to="/login" replace />
    );
  }
  if (sparklesOnly && !session.admin && !session.sparkles) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Link
            to={
              session.sparkles && !session.admin
                ? "/arcade/sparkles"
                : "/dashboard"
            }
            className="app-brand"
            aria-label={
              session.sparkles && !session.admin
                ? "Sparkles home"
                : "Dashboard home"
            }
          >
            <span className="app-brand-title">
              <img src={kl_logo} alt="" />
            </span>
          </Link>
          <button
            type="button"
            className="app-header-menu-toggle"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="app-header-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            id="app-header-navigation"
            className={`app-header-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Main navigation"
          >
            {session.admin ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/arcade/customers" onClick={() => setMenuOpen(false)}>
                  KL Arcade
                </Link>
              </>
            ) : null}
            {(session.admin || session.sparkles) && (
              <Link to="/arcade/sparkles" onClick={() => setMenuOpen(false)}>
                Sparkles
              </Link>
            )}
            {session.admin ? (
              <>
                <Link
                  to="/arcade/receivables"
                  onClick={() => setMenuOpen(false)}
                >
                  Receivables
                </Link>
                <Link to="/arcade/payables" onClick={() => setMenuOpen(false)}>
                  Payables
                </Link>
              </>
            ) : null}
            <details className="profile-menu">
              <summary className="profile-menu-button">
                {session.username}
              </summary>
              <div className="profile-menu-panel">
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setResetOpen(true);
                  }}
                >
                  Reset password
                </button>
                <button
                  type="button"
                  className="btn btn-danger app-header-logout"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            </details>
          </nav>
        </div>
      </header>

      {children}

      {resetOpen && (
        <div className="modal-overlay" onClick={() => setResetOpen(false)}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Reset password</h2>
              <button
                type="button"
                className="close-button"
                onClick={() => setResetOpen(false)}
                aria-label="Close"
              >
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
                  setFormData((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                required
              />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                placeholder="New password"
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                required
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm new password"
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                required
              />
              <button type="submit" className="login-button">
                Update password
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProtectedRoute;
