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
    confirmPassword: "",
    email: "",
    pathwayType: "",
    institution: "",
    qualification: "",
    fieldOfStudy: "",
    company: "",
    jobTitle: "",
    startDate: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

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

    if (!formData.pathwayType) {
      setStatus({ type: "error", message: "Please select your current situation." });
      return;
    }

    const pathway = formData.pathwayType === "studying"
      ? {
          type: "studying",
          institution: formData.institution.trim(),
          qualification: formData.qualification.trim(),
          field_of_study: formData.fieldOfStudy.trim(),
          start_date: formData.startDate
        }
      : {
          type: "working",
          company: formData.company.trim(),
          job_title: formData.jobTitle.trim(),
          start_date: formData.startDate
        };

    const pathwayFields = formData.pathwayType === "studying"
      ? [pathway.institution, pathway.qualification, pathway.field_of_study, pathway.start_date]
      : [pathway.company, pathway.job_title, pathway.start_date];

    if (pathwayFields.some((value) => !value)) {
      setStatus({
        type: "error",
        message: "Please complete all current situation fields."
      });
      return;
    }

    const payload = {
      firstname: formData.firstName.trim() || "",
      lastname: formData.lastName.trim() || "",
      year: formData.yearOfGraduation
        ? Number(formData.yearOfGraduation)
        : null,
      student_id: formData.studentId.trim() || null,
      username: formData.username.trim(),
      password: formData.password,
      email: formData.email.trim(),
      pathway
    };

    if (!payload.firstname || !payload.lastname || !payload.username || !payload.password || !payload.email) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/register", payload);
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

  const handleNext = (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const requiredFields = [
      "firstName",
      "lastName",
      "yearOfGraduation",
      "username",
      "email",
      "password",
      "confirmPassword"
    ];

    if (requiredFields.some((field) => !String(formData[field]).trim())) {
      setStatus({ type: "error", message: "Please fill in all required fields before continuing." });
      return;
    }

    if (!isPasswordStrong(formData.password)) {
      setStatus({
        type: "error",
        message: "Password must include at least 8 characters, uppercase, lowercase, a number, and a special character."
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setStep(2);
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

        {status.message && (
          <div className={`form-status form-status--${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={step === 1 ? handleNext : handleSubmit}>
          {step === 1 ? (
            <>
          <div className="form-field">
            <label htmlFor="firstName">First name<span className="required-mark">*</span></label>
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
            <label htmlFor="lastName">Last name<span className="required-mark">*</span></label>
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
            <label htmlFor="yearOfGraduation">Year of graduation<span className="required-mark">*</span></label>
            <input
              id="yearOfGraduation"
              type="number"
              name="yearOfGraduation"
              value={formData.yearOfGraduation}
              placeholder="Year of graduation"
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              type="text"
              name="studentId"
              value={formData.studentId}
              placeholder="Student ID"
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

              <button className="register-button" type="submit">
                Next
              </button>
            </>
          ) : (
            <>
              <div className=" form-field">
                <label htmlFor="pathwayType">
                  Post-school pathway <span className="required-mark">*</span>
                </label>
                <select
                  id="pathwayType"
                  name="pathwayType"
                  value={formData.pathwayType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose your current situation</option>
                  <option value="studying">Currently studying</option>
                  <option value="working">Currently working</option>
                </select>
              </div><br/>

              {formData.pathwayType === "studying" && (
                <>                  
                  <div className="form-field">
                    <label htmlFor="institution">Institution<span className="required-mark">*</span></label>
                    <input id="institution" name="institution" value={formData.institution} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="qualification">Qualification<span className="required-mark">*</span></label>
                    <input id="qualification" name="qualification" value={formData.qualification} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="fieldOfStudy">Field of study<span className="required-mark">*</span></label>
                    <input id="fieldOfStudy" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="startDate">Start date<span className="required-mark">*</span></label>
                    <input id="startDate" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                  </div>
                </>
              )}

              {formData.pathwayType === "working" && (
                <>
                  <div className="form-field">
                    <label htmlFor="company">Company<span className="required-mark">*</span></label>
                    <input id="company" name="company" value={formData.company} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="jobTitle">Job title<span className="required-mark">*</span></label>
                    <input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="startDate">Start date<span className="required-mark">*</span></label>
                    <input id="startDate" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                  </div>
                </>
              )}

              

              <p className="form-note">
                Your current situation is required to complete signup.
              </p>

              <div className="register-actions">
                <button className="register-button" type="button" onClick={() => setStep(1)} disabled={isSubmitting}>
                  Back
                </button>
                <button className="register-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Register;