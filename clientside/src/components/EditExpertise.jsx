import { useState } from "react";
import api from "../api/axios";

function EditExpertise({ expertise, isOpen, onClose, onSaved }) {
  const [value, setValue] = useState(expertise?.expertise || expertise?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = value.trim();

    if (!name) {
      setError("Expertise is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.put(`/data/dynamicdata/${expertise.expertise_id ?? expertise.id}`, {
        expertise: name,
      });
      onSaved(response.data.data);
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update expertise.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-form register-form modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit expertise</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="form-status form-status--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="edit-expertise">Expertise</label>
            <input
              id="edit-expertise"
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoFocus
              required
            />
          </div>

          <button className="register-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditExpertise;
