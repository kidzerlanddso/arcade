import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../api/axios";
import GoogleSignInButton from "./GoogleSignInButton";

function Login({ onGoogleNeedsRegistration }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ type: "", message: "" });
  const [isRequestingPassword, setIsRequestingPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", {
        ...formData,
        // Keep compatibility with servers that still expect username.
        username: formData.login,
      });
      const token = response.data.token;
      const isAdmin = Number(response.data.admin) === 1;
      const isSparkles = Number(response.data.sparkles) === 1;

      localStorage.setItem("token", token);
      setAccessToken(token);
      localStorage.setItem("isAdmin", String(isAdmin));
      localStorage.setItem("isSparkles", String(isSparkles));
      setStatus({
        type: "success",
        message: response.data.message || "Login successful! Redirecting...",
      });

      window.setTimeout(() => {
        navigate(isSparkles && !isAdmin ? "/arcade/sparkles" : "/dashboard", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: error?.response?.data?.message || "Login failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setForgotStatus({ type: "", message: "" });
    setIsRequestingPassword(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: forgotEmail.trim(),
      });
      setForgotStatus({
        type: "success",
        message:
          response.data?.message ||
          "Temporary password will be sent to the registered email id shortly.",
      });
    } catch (error) {
      setForgotStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Unable to process the request. Please try again later.",
      });
    } finally {
      setIsRequestingPassword(false);
    }
  };

  return (
    <div className="auth-form login-form">
      <h2>Login</h2>

      {status.message && (
        <div
          style={{
            marginBottom: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            background: status.type === "success" ? "#e8f7ee" : "#fdecea",
            color: status.type === "success" ? "#1f7a4d" : "#b42318",
            border: `1px solid ${status.type === "success" ? "#9ad3b0" : "#f5b7b1"}`,
          }}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="login">
            Username or email <span className="required-mark">*</span>
          </label>
          <input
            id="login"
            type="text"
            name="login"
            value={formData.login}
            placeholder="Enter your username or email"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">
            Password <span className="required-mark">*</span>
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />
        </div>

        <p className="form-note">
          <span className="required-mark">*</span> Required field
        </p>

        <button className="login-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <button
        className="forgot-password-trigger"
        type="button"
        aria-expanded={showForgotPassword}
        onClick={() => {
          setShowForgotPassword((visible) => !visible);
          setForgotEmail(
            (current) =>
              current || (formData.login.includes("@") ? formData.login : ""),
          );
          setForgotStatus({ type: "", message: "" });
        }}
      >
        Forgot password?
      </button>

      {showForgotPassword && (
        <form className="forgot-password-form" onSubmit={handleForgotPassword}>
          <p>Enter the email address registered to your account.</p>
          <div className="form-field">
            <label htmlFor="forgot-password-email">Registered email</label>
            <input
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <button
            className="login-button"
            type="submit"
            disabled={isRequestingPassword}
          >
            {isRequestingPassword ? "Sending..." : "Send temporary password"}
          </button>
          {forgotStatus.message && (
            <p
              className={`form-status form-status--${forgotStatus.type}`}
              role="status"
              aria-live="polite"
            >
              {forgotStatus.message}
            </p>
          )}
        </form>
      )}

      <div className="auth-divider">
        <span>or</span>
      </div>
      <GoogleSignInButton
        onNeedsRegistration={onGoogleNeedsRegistration}
        onLoginSuccess={() => {
          setStatus({
            type: "success",
            message: "Login successful! Redirecting...",
          });
          window.setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 800);
        }}
      />
    </div>
  );
}

export default Login;
