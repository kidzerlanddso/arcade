import { useState } from "react";

import api from "../api/axios";

const passwordRequirements = [
  { label: "At least 8 characters ", test: (password) => password.length >= 8 },
  { label: "One uppercase letter ", test: (password) => /[A-Z]/.test(password) },
  { label: "One lowercase letter ", test: (password) => /[a-z]/.test(password) },
  { label: "One number ", test: (password) => /\d/.test(password) },
  { label: "One special character ", test: (password) => /[^A-Za-z0-9]/.test(password) }
];

const isPasswordStrong = (password) =>
  passwordRequirements.every((rule) => rule.test(password));

function RegisterAdmin({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const passwordChecks = passwordRequirements.map((rule) => ({
    ...rule,
    passed: rule.test(formData.password)
  }));

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!isPasswordStrong(formData.password)) {
      setStatus({
        type: "error",
        message:
          "Password must include at least 8 characters, uppercase, lowercase, a number, and a special character."
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    const payload = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      admin: formData.admin,
      active: formData.active,
      username: formData.username,
      password: formData.password,
      email: formData.email
    };

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/RegisterAdmin", payload);
      setStatus({
        type: "success",
        message: response.data.message || "Registration successful!"
      });

      window.setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="auth-form register-form modal-card RegisterAdmin-form"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Create an Admin Account</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {status.message && (
          <div className={`form-status form-status--${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              placeholder="First name"
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              placeholder="Last name"
              onChange={handleChange}
            />
          </div>

       

          <div className="form-field">
            <label htmlFor="username">
              Username <span className="required-mark">*</span>
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              placeholder="Choose a username"
              onChange={handleChange}
              required
            />
            <input
              id="admin"
              type="text"
              name="admin"
              value="1"
              hidden
            />
            <input
              id="active"
              type="text"
              name="active"
              value="1"
              hidden
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">
              Email <span className="required-mark">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              placeholder="Enter your email"
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
              placeholder="Create a password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">
              Confirm password <span className="required-mark">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="Re-enter password"
              onChange={handleChange}
              required
            />
          </div>

          <ul className="password-rules">
            {passwordChecks.map((rule) => (
              <li
                key={rule.label}
                className={rule.passed ? "valid" : "invalid"}
              >
                {rule.label}
              </li>
            ))}
          </ul>

          {formData.confirmPassword && (
            <p className={passwordsMatch ? "password-match" : "password-mismatch"}>
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}

          <p className="form-note">
            <span className="required-mark">*</span> Required field
          </p>

          <button className="RegisterAdmin-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterAdmin;