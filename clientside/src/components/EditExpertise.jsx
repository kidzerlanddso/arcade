import { useState, useEffect } from "react";
import api from "../api/axios";

function EditExpertise({ expertise, isOpen, onClose, onSaved }) {
  const expertiseId = Number(expertise?.expertise_id ?? expertise?.id ?? 0);
  const [value, setValue] = useState(expertise?.expertise || expertise?.name || "");
  const [subcategories, setSubcategories] = useState([]);
  const [newSubcategory, setNewSubcategory] = useState("");
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [editingSubcategoryValue, setEditingSubcategoryValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !expertiseId) return;

    const fetchSubcategories = async () => {
      setIsLoadingSubcategories(true);
      try {
        const response = await api.get(`/data/dynamicdata/${expertiseId}/subcategories`);
        setSubcategories(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (requestError) {
        console.error("Error fetching expertise subcategories:", requestError);
        setSubcategories([]);
      } finally {
        setIsLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [expertiseId, isOpen]);

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
      const response = await api.put(`/data/dynamicdata/${expertiseId}`, {
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

  const handleAddSubcategory = async (event) => {
    event.preventDefault();
    const trimmed = newSubcategory.trim();

    if (!trimmed) {
      setError("Subcategory is required.");
      return;
    }

    try {
      setError("");
      const response = await api.post(`/data/dynamicdata/${expertiseId}/subcategories`, {
        subcategory: trimmed,
      });

      const createdSubcategory = response.data?.data || {};
      setSubcategories((current) => {
        const id = createdSubcategory.subcategory_id ?? createdSubcategory.id;
        if (!id) return [...current, createdSubcategory];
        return [...current.filter((item) => (item.subcategory_id ?? item.id) !== id), createdSubcategory];
      });
      setNewSubcategory("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add expertise subcategory.");
    }
  };

  const handleSaveSubcategory = async () => {
    const trimmed = editingSubcategoryValue.trim();
    if (!trimmed || !editingSubcategoryId) return;

    try {
      setError("");
      const response = await api.put(`/data/dynamicdata/subcategories/${editingSubcategoryId}`, {
        subcategory: trimmed,
      });

      const updated = response.data?.data || {};
      setSubcategories((current) =>
        current.map((item) => {
          const currentId = item.subcategory_id ?? item.id;
          return String(currentId) === String(editingSubcategoryId) ? { ...item, ...updated } : item;
        })
      );
      setEditingSubcategoryId(null);
      setEditingSubcategoryValue("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update subcategory.");
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!subcategoryId) return;

    const confirmed = window.confirm("Delete this subcategory?");
    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/data/dynamicdata/subcategories/${subcategoryId}`);
      setSubcategories((current) => current.filter((item) => (item.subcategory_id ?? item.id) !== subcategoryId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete subcategory.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-form register-form modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit expertise</h2>
          <button type="button" className="close-button" onClick={onClose}>×</button>
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

        <div className="form-field" style={{ marginTop: "1.5rem" }}>
          <label>Subcategories</label>

          {isLoadingSubcategories ? (
            <p>Loading subcategories...</p>
          ) : subcategories.length === 0 ? (
            <p>No subcategories added yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {subcategories.map((subcategory) => {
                const subcategoryId = subcategory.subcategory_id ?? subcategory.id;
                const isEditing = String(editingSubcategoryId) === String(subcategoryId);

                return (
                  <div key={subcategoryId} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editingSubcategoryValue}
                          onChange={(event) => setEditingSubcategoryValue(event.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button type="button" className="btn btn-success" onClick={handleSaveSubcategory}>Save</button>
                        <button type="button" className="btn btn-secondary" onClick={() => {
                          setEditingSubcategoryId(null);
                          setEditingSubcategoryValue("");
                        }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1 }}>{subcategory.subcategory}</span>
                        <button type="button" className="btn btn-primary" onClick={() => {
                          setEditingSubcategoryId(subcategoryId);
                          setEditingSubcategoryValue(subcategory.subcategory || "");
                        }}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger" onClick={() => handleDeleteSubcategory(subcategoryId)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleAddSubcategory} style={{ marginTop: "1rem" }}>
          <div className="form-field">
            <label htmlFor="new-subcategory">Add subcategory</label>
            <input
              id="new-subcategory"
              type="text"
              value={newSubcategory}
              onChange={(event) => setNewSubcategory(event.target.value)}
              placeholder="e.g. Software Development"
            />
          </div>

          <button className="register-button" type="submit">
            Add subcategory
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditExpertise;
