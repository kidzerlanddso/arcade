import { useEffect, useState } from "react";
import api from "../api/axios";
import schoolBackground from "../assets/school_bg.webp";

const getAdminStatus = () => localStorage.getItem("isAdmin") === "true";
const emptyTeacher = {
  team: "pastoral",
  department: "",
  name: "",
  role: "",
  focus: "",
  email: "",
  phone: "",
  image: "",
  featured: false,
};
const departmentNames = [
  "The Arts",
  "Business Studies",
  "English",
  "Languages",
  "Mathematics",
  "Pasifika",
  "PE & Health",
  "Science",
  "Social Sciences",
  "Te Reo Māori",
  "Technology",
  "Careers",
  "Learning Support",
  "Extracurricular",
];

function TeacherCard({ teacher, isAdmin, onEdit, onDelete }) {
  return (
    <article className="teacher-card">
      <img
        src={teacher.image || schoolBackground}
        alt={`${teacher.name} profile`}
        className="teacher-avatar"
      />
      <p className="teacher-role">{teacher.name}</p>
      <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
      <h3>{teacher.role}</h3>
      {teacher.focus && <p className="teacher-focus">{teacher.focus}</p>}
      {teacher.phone && <p className="teacher-phone">{teacher.phone}</p>}

      {isAdmin && (
        <div className="admin-card-actions">
          <button type="button" onClick={() => onEdit(teacher)}>
            Edit
          </button>
          <button type="button" onClick={() => onDelete(teacher.id)}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

function TeacherProfilesPage() {
  const isAdmin = getAdminStatus();
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyTeacher);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api
      .get("/content/teachers")
      .then((response) => setTeachers(response.data))
      .catch(() => setErrorMessage("Unable to load teacher profiles."));
  }, []);

  const allTeachers = [...teachers].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const handleFormChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response =
        editingId === null
          ? await api.post("/content/teachers", form)
          : await api.patch(`/content/teachers/${editingId}`, form);
      let savedTeacher = response.data;
      if (imageFile) {
        const imageData = new FormData();
        imageData.append("teacherImage", imageFile);
        const imageResponse = await api.post(
          `/content/teachers/${savedTeacher.id}/image`,
          imageData,
        );
        savedTeacher = imageResponse.data;
      }
      setTeachers((current) =>
        editingId === null
          ? [...current, savedTeacher]
          : current.map((teacher) =>
              teacher.id === editingId ? savedTeacher : teacher,
            ),
      );
      setForm(emptyTeacher);
      setImageFile(null);
      setEditingId(null);
      setShowForm(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to save teacher profile.",
      );
    }
  };

  const editTeacher = (teacher) => {
    setForm({ ...emptyTeacher, ...teacher });
    setImageFile(null);
    setEditingId(teacher.id);
    setShowForm(true);
  };
  const deleteTeacher = async (id) => {
    if (!window.confirm("Delete this teacher profile?")) return;
    try {
      await api.delete(`/content/teachers/${id}`);
      setTeachers((current) => current.filter((teacher) => teacher.id !== id));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to delete teacher profile.",
      );
    }
  };

  return (
    <main className="teacher-profiles-page">
      <div
        className="teacher-banner"
        style={{ backgroundImage: `url(${schoolBackground})` }}
      />
      <section className="teacher-directory">
        <div className="teacher-page-heading">
          <p>Rototuna community</p>
          <h1>Teacher Profiles</h1>
        </div>
        {isAdmin && (
          <div className="admin-content-toolbar">
            <button
              type="button"
              className="primary-action"
              onClick={() => {
                setForm(emptyTeacher);
                setImageFile(null);
                setEditingId(null);
                setShowForm(true);
              }}
            >
              Add teacher
            </button>
          </div>
        )}
        {isAdmin && showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div
              className="teacher-modal-card modal-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="teacher-form-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="teacher-modal-header modal-header">
                <h2 id="teacher-form-title">
                  {editingId === null
                    ? "Add teacher profile"
                    : "Edit teacher profile"}
                </h2>
                <button
                  type="button"
                  className="close-button"
                  aria-label="Close teacher form"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>
              <form
                className="teacher-content-editor-form content-editor-form"
                onSubmit={handleSubmit}
              >
                <div className="teacher-form-grid content-editor-fields">
                  <label className="field-group">
                    <span>
                      Name<span className="required-mark">*</span>
                    </span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="Name"
                      required
                    />
                  </label>
                  <label className="field-group">
                    <span>
                      Role<span className="required-mark">*</span>
                    </span>
                    <input
                      name="role"
                      value={form.role}
                      onChange={handleFormChange}
                      placeholder="Role"
                      required
                    />
                  </label>
                  <label className="field-group">
                    <span>
                      Email<span className="required-mark">*</span>
                    </span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleFormChange}
                      placeholder="Email"
                      required
                    />
                  </label>
                  <label className="field-group">
                    <span>Phone</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleFormChange}
                      placeholder="Phone"
                    />
                  </label>
                  <label className="image-upload-field field-group">
                    <span>Upload portrait</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setImageFile(event.target.files?.[0] || null)
                      }
                    />
                  </label>
                  <label className="field-group field-group--checkbox">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={handleFormChange}
                    />
                    <span>Add to Featured Teachers list</span>
                  </label>
                </div>
                <div className="content-editor-actions content-editor-actions--stacked">
                  <button
                    className="primary-action register-button"
                    type="submit"
                  >
                    Save teacher
                  </button>
                  <button
                    className="text-link-button"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {errorMessage && (
          <p className="events-error" role="alert">
            {errorMessage}
          </p>
        )}

        <section className="teacher-team-section">
          <div className="teacher-grid teacher-grid--all">
            {allTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                isAdmin={isAdmin}
                onEdit={editTeacher}
                onDelete={deleteTeacher}
              />
            ))}
          </div>
          {!allTeachers.length && (
            <p className="empty-content-state">
              No teacher profiles have been added yet.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

export default TeacherProfilesPage;
