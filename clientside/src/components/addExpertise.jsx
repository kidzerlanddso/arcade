import { useState } from "react";

import api from "../api/axios";

function AddExpertise({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    expertise: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const expertise = formData.expertise?.trim();

    if (!expertise) {
      setStatus({
        type: "error",
        message: "Expertise is required."
      });
      return;
    }

    const payload = {
      expertise
    };

    setIsSubmitting(true);

    try {
      const response = await api.post("/data/addExpertise", payload);
      setStatus({
        type: "success",
        message: response.data.message || "Dynamic data added successfully!"
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
          "Add Dynamic data failed. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="auth-form register-form modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Add new expertise </h2>
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
            <label htmlFor="expertise">Expertise</label>
            <input
              id="expertise"
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              placeholder="Expertise"
            />
          </div>

          <button className="register-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add new expertise"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpertise;