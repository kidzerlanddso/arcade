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
const getTodayDateInputValue = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};
const emptySpotlight = {
  spotlightType: "teacher",
  subjectName: "",
  title: "",
  story: "",
  achievementDate: getTodayDateInputValue(),
  image: "",
  published: false,
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
  "Te Reo MÄori",
  "Technology",
  "Careers",
  "Learning Support",
  "Extracurricular",
];

function TeacherCard({
  teacher,
  spotlight,
  isAdmin,
  onEdit,
  onDelete,
  onManageSpotlights,
}) {
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
      {spotlight && (
        <div className="teacher-spotlight-preview">
          <strong>{spotlight.title}</strong>
          <p>{spotlight.story}</p>
          <small>
            {new Date(
              `${String(spotlight.achievementDate).slice(0, 10)}T00:00:00`,
            ).toLocaleDateString("en-NZ", { dateStyle: "long" })}
          </small>
        </div>
      )}

      {isAdmin && (
        <div className="admin-card-actions">
          <button type="button" onClick={() => onManageSpotlights(teacher)}>
            Manage spotlights
          </button>
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
  const [spotlights, setSpotlights] = useState([]);
  const [spotlightTeacher, setSpotlightTeacher] = useState(null);
  const [spotlightManagerOpen, setSpotlightManagerOpen] = useState(false);
  const [showSpotlightEditor, setShowSpotlightEditor] = useState(false);
  const [teacherSpotlights, setTeacherSpotlights] = useState([]);
  const [spotlightForm, setSpotlightForm] = useState(emptySpotlight);
  const [spotlightImageFile, setSpotlightImageFile] = useState(null);
  const [editingSpotlightId, setEditingSpotlightId] = useState(null);
  const [spotlightSaving, setSpotlightSaving] = useState(false);

  useEffect(() => {
    api
      .get("/content/teachers")
      .then((response) => setTeachers(response.data))
      .catch(() => setErrorMessage("Unable to load teacher profiles."));
    api
      .get("/content/spotlights")
      .then((response) => setSpotlights(response.data))
      .catch(() => setErrorMessage("Unable to load teacher spotlights."));
  }, []);

  const allTeachers = [...teachers].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const latestSpotlightByTeacher = new Map();
  spotlights.forEach((spotlight) => {
    if (!latestSpotlightByTeacher.has(Number(spotlight.teacherId))) {
      latestSpotlightByTeacher.set(Number(spotlight.teacherId), spotlight);
    }
  });
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

  const openSpotlightManager = async (teacher) => {
    setSpotlightTeacher(teacher);
    setSpotlightManagerOpen(true);
    setShowSpotlightEditor(false);
    setTeacherSpotlights([]);
    setSpotlightForm({
      ...emptySpotlight,
      spotlightType: "teacher",
      subjectName: teacher.name,
    });
    setSpotlightImageFile(null);
    setEditingSpotlightId(null);
    try {
      const response = await api.get(
        `/content/teachers/${teacher.id}/spotlights`,
      );
      setTeacherSpotlights(response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to load teacher spotlights.",
      );
    }
  };

  const openGeneralSpotlightManager = async () => {
    setSpotlightTeacher(null);
    setSpotlightManagerOpen(true);
    setShowSpotlightEditor(false);
    setTeacherSpotlights([]);
    setSpotlightForm({
      ...emptySpotlight,
      spotlightType: "community",
      subjectName: "",
    });
    setSpotlightImageFile(null);
    setEditingSpotlightId(null);
    try {
      const response = await api.get("/content/spotlights/admin");
      setTeacherSpotlights(response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to load spotlights.",
      );
    }
  };

  const openNewSpotlightEditor = () => {
    setSpotlightForm({
      ...emptySpotlight,
      spotlightType: spotlightTeacher ? "teacher" : "community",
      subjectName: spotlightTeacher?.name || "",
    });
    setSpotlightImageFile(null);
    setEditingSpotlightId(null);
    setShowSpotlightEditor(true);
  };

  const handleSpotlightSubmit = async (event) => {
    event.preventDefault();
    if (spotlightSaving) return;
    setSpotlightSaving(true);
    try {
      const response =
        editingSpotlightId === null
          ? spotlightTeacher
            ? await api.post(
                `/content/teachers/${spotlightTeacher.id}/spotlights`,
                spotlightForm,
              )
            : await api.post("/content/spotlights", spotlightForm)
          : await api.patch(
              `/content/spotlights/${editingSpotlightId}`,
              spotlightForm,
            );
      let savedSpotlight = response.data;
      if (spotlightImageFile) {
        const imageData = new FormData();
        imageData.append("spotlightImage", spotlightImageFile);
        const imageResponse = await api.post(
          `/content/spotlights/${savedSpotlight.id}/image`,
          imageData,
        );
        savedSpotlight = imageResponse.data;
      }
      setTeacherSpotlights((current) =>
        editingSpotlightId === null
          ? [savedSpotlight, ...current]
          : current.map((item) =>
              item.id === editingSpotlightId ? savedSpotlight : item,
            ),
      );
      const publicSpotlight = {
        ...savedSpotlight,
        displayName: spotlightTeacher?.name || savedSpotlight.subjectName,
        teacherName: spotlightTeacher?.name || null,
        teacherRole: spotlightTeacher?.role || null,
        teacherImage: spotlightTeacher?.image || null,
      };
      setSpotlights((current) => {
        const remaining = current.filter(
          (item) => item.id !== publicSpotlight.id,
        );
        return publicSpotlight.published
          ? [publicSpotlight, ...remaining].sort((a, b) =>
              String(b.achievementDate).localeCompare(
                String(a.achievementDate),
              ),
            )
          : remaining;
      });
      setSpotlightForm(emptySpotlight);
      setSpotlightImageFile(null);
      setEditingSpotlightId(null);
      setShowSpotlightEditor(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to save teacher spotlight.",
      );
    } finally {
      setSpotlightSaving(false);
    }
  };

  const editSpotlight = (spotlight) => {
    setSpotlightForm({
      title: spotlight.title,
      spotlightType: spotlightTeacher ? "teacher" : "community",
      subjectName: spotlightTeacher?.name || "",
      story: spotlight.story,
      achievementDate: String(spotlight.achievementDate).slice(0, 10),
      image: spotlight.image || "",
      published: Boolean(spotlight.published),
    });
    setSpotlightImageFile(null);
    setEditingSpotlightId(spotlight.id);
    setShowSpotlightEditor(true);
  };

  const deleteSpotlight = async (id) => {
    if (!window.confirm("Delete this teacher spotlight?")) return;
    try {
      await api.delete(`/content/spotlights/${id}`);
      setTeacherSpotlights((current) =>
        current.filter((item) => item.id !== id),
      );
      setSpotlights((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to delete teacher spotlight.",
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
              className="btn btn-outline-success btn-lg"
              onClick={() => {
                setForm(emptyTeacher);
                setImageFile(null);
                setEditingId(null);
                setShowForm(true);
              }}
            >
              Add teacher
            </button>
            <button
              type="button"
              className="btn btn-outline-success btn-lg"
              onClick={openGeneralSpotlightManager}
            >
              Manage spotlight
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
        {isAdmin && spotlightManagerOpen && (
          <div
            className="modal-overlay"
            onClick={() => !spotlightSaving && setSpotlightManagerOpen(false)}
          >
            <div
              className="teacher-modal-card modal-card teacher-spotlight-manager"
              role="dialog"
              aria-modal="true"
              aria-labelledby="spotlight-manager-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="teacher-modal-header modal-header">
                <h2 id="spotlight-manager-title">
                  {spotlightTeacher
                    ? `Spotlights for ${spotlightTeacher.name}`
                    : "General spotlights"}
                </h2>
                <button
                  type="button"
                  className="close-button"
                  aria-label="Close spotlight manager"
                  disabled={spotlightSaving}
                  onClick={() => setSpotlightManagerOpen(false)}
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                className="primary-action register-button spotlight-manager-add-button"
                onClick={openNewSpotlightEditor}
              >
                Add spotlight
              </button>
              <div className="teacher-spotlight-list">
                {teacherSpotlights.length === 0 && (
                  <p className="spotlight-manager-empty">
                    No spotlights yet. Add one to get started.
                  </p>
                )}
                {teacherSpotlights.map((spotlight) => (
                  <article
                    className="teacher-spotlight-admin-item"
                    key={spotlight.id}
                  >
                    <div>
                      <strong>{spotlight.title}</strong>
                      <small>
                        {new Date(
                          `${String(spotlight.achievementDate).slice(0, 10)}T00:00:00`,
                        ).toLocaleDateString("en-NZ", { dateStyle: "long" })}
                        {spotlight.published ? " · Published" : " · Draft"}
                      </small>
                    </div>
                    <div className="admin-card-actions">
                      <button
                        type="button"
                        onClick={() => editSpotlight(spotlight)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSpotlight(spotlight.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
        {isAdmin && showSpotlightEditor && (
          <div
            className="modal-overlay spotlight-editor-overlay"
            onClick={() => !spotlightSaving && setShowSpotlightEditor(false)}
          >
            <div
              className="teacher-modal-card modal-card teacher-spotlight-editor"
              role="dialog"
              aria-modal="true"
              aria-labelledby="spotlight-editor-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="teacher-modal-header modal-header">
                <h2 id="spotlight-editor-title">
                  {editingSpotlightId === null
                    ? "Add spotlight"
                    : "Edit spotlight"}
                </h2>
                <button
                  type="button"
                  className="close-button"
                  aria-label="Close spotlight editor"
                  disabled={spotlightSaving}
                  onClick={() => setShowSpotlightEditor(false)}
                >
                  ×
                </button>
              </div>
              <form
                className="teacher-content-editor-form content-editor-form"
                onSubmit={handleSpotlightSubmit}
              >
                {errorMessage && (
                  <p className="events-error" role="alert">
                    {errorMessage}
                  </p>
                )}
                <div className="teacher-form-grid content-editor-fields">
                  <label className="field-group">
                    <span>
                      Achievement title<span className="required-mark">*</span>
                    </span>
                    <input
                      value={spotlightForm.title}
                      onChange={(event) =>
                        setSpotlightForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      maxLength={200}
                      required
                    />
                  </label>
                  <label className="field-group">
                    <span>
                      Date achieved<span className="required-mark">*</span>
                    </span>
                    <input
                      type="date"
                      value={spotlightForm.achievementDate}
                      onChange={(event) =>
                        setSpotlightForm((current) => ({
                          ...current,
                          achievementDate: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="field-group spotlight-story-field">
                    <span>
                      Story<span className="required-mark">*</span>
                    </span>
                    <textarea
                      rows="8"
                      value={spotlightForm.story}
                      onChange={(event) =>
                        setSpotlightForm((current) => ({
                          ...current,
                          story: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="image-upload-field field-group">
                    <span>Achievement photo (optional)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setSpotlightImageFile(event.target.files?.[0] || null)
                      }
                    />
                  </label>
                  <label className="field-group field-group--checkbox">
                    <input
                      type="checkbox"
                      checked={spotlightForm.published}
                      onChange={(event) =>
                        setSpotlightForm((current) => ({
                          ...current,
                          published: event.target.checked,
                        }))
                      }
                    />
                    <span>Publish on dashboard spotlight</span>
                  </label>
                </div>
                <div className="content-editor-actions content-editor-actions--stacked">
                  <button
                    className="primary-action register-button"
                    type="submit"
                    disabled={spotlightSaving}
                  >
                    {spotlightSaving
                      ? "Saving…"
                      : editingSpotlightId === null
                        ? "Save spotlight"
                        : "Update spotlight"}
                  </button>
                  <button
                    className="text-link-button"
                    type="button"
                    disabled={spotlightSaving}
                    onClick={() => setShowSpotlightEditor(false)}
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
                onManageSpotlights={openSpotlightManager}
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
