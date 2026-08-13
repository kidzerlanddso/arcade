import { Link, Navigate, useNavigate } from "react-router-dom";

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

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const userName = getCurrentUserName();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login", { replace: true });
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
            <Link to="/profile/me">{userName}</Link>
            <button type="button" className="btn btn-danger app-header-logout" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {children}
    </>
  );
}

export default ProtectedRoute;
