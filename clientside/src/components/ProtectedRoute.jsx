import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import api, { setAccessToken } from "../api/axios";
import logo from "../assets/logo.png";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

const getAdminFromToken = () => {
  const currentToken = localStorage.getItem("token");

  if (!currentToken) return false;

  try {
    const payload = JSON.parse(atob(currentToken.split(".")[1] || ""));
    const adminValue = payload.admin;
    if (adminValue !== undefined && adminValue !== null) {
      return (
        adminValue === true ||
        adminValue === 1 ||
        adminValue === "1" ||
        adminValue === "true"
      );
    }
  } catch (error) {
    console.error("Error decoding token for admin status:", error);
  }

  const storedAdmin = localStorage.getItem("isAdmin");
  return storedAdmin === "true" || storedAdmin === "1";
};
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
  const adminMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(() => getAdminFromToken());
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingMembershipCount, setPendingMembershipCount] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const closeMenu = (event) => {
      const clickedOutsideAdmin =
        adminMenuRef.current && !adminMenuRef.current.contains(event.target);
      const clickedOutsideProfile =
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target);

      if (clickedOutsideAdmin) {
        setAdminMenuOpen(false);
      }

      if (clickedOutsideProfile) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    setAdminMenuOpen(false);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }

    let isMounted = true;

    const loadPendingMembershipCount = async () => {
      try {
        const response = await api.get(
          "/auth/membership-requests/pending-requests",
        );
        if (isMounted) {
          setPendingMembershipCount(Number(response.data?.count || 0));
        }
      } catch (error) {
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          console.error("Failed to load membership request count:", error);
        }
      }
    };

    loadPendingMembershipCount();
    const refreshTimer = window.setInterval(loadPendingMembershipCount, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, [isAdmin]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setAccessToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
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
        "New password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.",
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

      alert("Password reset successfully.");
      setResetOpen(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
          <Link
            to="/dashboard"
            className="app-brand"
            aria-label="Go to dashboard"
          >
            <img src={logo} alt="Logo" className="app-logo" />
          </Link>
          <div>
            <span className="brand-panel">
              <h2>AlumniConnect</h2>
            </span>{" "}
          </div>

          <button
            type="button"
            className="app-header-menu-toggle"
            aria-expanded={mobileMenuOpen}
            aria-controls="main-navigation"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            id="main-navigation"
            className={`app-header-nav${mobileMenuOpen ? " is-open" : ""}`}
            aria-label="Main navigation"
          >
            <Link to="/donations" onClick={() => setMobileMenuOpen(false)}>
              Donate
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>

            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              Find an Alumni
            </Link>

            <Link to="/announcements" onClick={() => setMobileMenuOpen(false)}>
              News
            </Link>

            <Link to="/events" onClick={() => setMobileMenuOpen(false)}>
              Events
            </Link>

            <Link to="/teachers" onClick={() => setMobileMenuOpen(false)}>
              Teacher Profiles
            </Link>
            {isAdmin && (
              <div className="profile-menu" ref={adminMenuRef}>
                <button
                  type="button"
                  className="profile-menu-button"
                  aria-expanded={adminMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => {
                    setAdminMenuOpen((open) => !open);
                    setProfileMenuOpen(false);
                  }}
                >
                  Admin{" "}
                  {pendingMembershipCount > 0 && (
                    <span
                      className="admin-menu-notification-badge"
                      aria-label={`${pendingMembershipCount} pending membership requests`}
                    >
                      {pendingMembershipCount > 99
                        ? "99+"
                        : pendingMembershipCount}
                    </span>
                  )}{" "}
                  ▾
                </button>

                {adminMenuOpen && (
                  <div className="profile-menu-panel" role="menu">
                    <Link
                      to="/stats"
                      onClick={() => {
                        setAdminMenuOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Admin Intelligence
                    </Link>
                    <Link
                      to="/membership-request"
                      onClick={() => {
                        setAdminMenuOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <span className="admin-menu-notification-link">
                        Membership Request
                        {pendingMembershipCount > 0 && (
                          <span
                            className="admin-menu-notification-badge"
                            aria-label={`${pendingMembershipCount} pending membership requests`}
                          >
                            {pendingMembershipCount > 99
                              ? "99+"
                              : pendingMembershipCount}
                          </span>
                        )}
                      </span>
                    </Link>

                    <Link
                      to="/admin"
                      onClick={() => {
                        setAdminMenuOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Manage Admins
                    </Link>

                    <Link
                      to="/dynamicdata"
                      onClick={() => {
                        setAdminMenuOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Dynamic Data
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className="profile-menu-button"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setProfileMenuOpen((open) => !open);
                  setAdminMenuOpen(false);
                }}
              >
                {userName} ▾
              </button>

              {profileMenuOpen && (
                <div className="profile-menu-panel" role="menu">
                  <Link
                    to="/profile/me"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setMobileMenuOpen(false);
                      setResetOpen(true);
                    }}
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger app-header-logout"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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
              <h2>Reset Password</h2>
              <button
                type="button"
                className="close-button"
                onClick={() => setResetOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="auth-form" onSubmit={handleResetPassword}>
              <input
                style={{ margin: "10px;" }}
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                placeholder="Current password"
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
              />

              <input
                style={{ margin: "10px;" }}
                type="password"
                name="newPassword"
                value={formData.newPassword}
                placeholder="New password"
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
              />

              <input
                style={{ margin: "10px;" }}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm new password"
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
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
