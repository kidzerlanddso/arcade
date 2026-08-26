import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        username: formData.login
      });
      const token = response.data.token;
      const isAdmin = Number(response.data.admin) === 1;

      localStorage.setItem("token", token);
      setAccessToken(token);
      localStorage.setItem("isAdmin", String(isAdmin));
      setStatus({
        type: "success",
        message: response.data.message || "Login successful! Redirecting..."
      });

      window.setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1200);
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: error?.response?.data?.message || "Login failed"
      });
    } finally {
      setIsSubmitting(false);
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
            background:
              status.type === "success" ? "#e8f7ee" : "#fdecea",
            color: status.type === "success" ? "#1f7a4d" : "#b42318",
            border: `1px solid ${status.type === "success" ? "#9ad3b0" : "#f5b7b1"}`
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
    </div>
  );
}

export default Login;