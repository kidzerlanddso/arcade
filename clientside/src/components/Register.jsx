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

function Register({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    yearOfGraduation: "",
    studentId: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isPasswordStrong(formData.password)) {
      alert(
        "Password must include at least 8 characters, uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      year: formData.yearOfGraduation,
      student_id: formData.studentId,
      username: formData.username,
      password: formData.password
    };

    try {
      await api.post("/auth/register", payload);
      alert("User registered successfully");
      onClose?.();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="auth-form register-form modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Join AlumniConnect</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            placeholder="First name"
            onChange={handleChange}
          />

          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            placeholder="Last name"
            onChange={handleChange}
          />

          <input
            type="number"
            name="yearOfGraduation"
            value={formData.yearOfGraduation}
            placeholder="Year of graduation"
            onChange={handleChange}
          />

          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            placeholder="Student ID"
            onChange={handleChange}
          />

          <input
            type="text"
            name="username"
            value={formData.username}
            placeholder="Choose a username"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Create a password"
            onChange={handleChange}
          />

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

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Re-enter password"
            onChange={handleChange}
          />

          {formData.confirmPassword && (
            <p className={passwordsMatch ? "password-match" : "password-mismatch"}>
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}

          <button className="register-button" type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;