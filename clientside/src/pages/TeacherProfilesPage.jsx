import { useEffect, useState } from "react";
import api from "../api/axios";
import schoolBackground from "../assets/school_bg.webp";

const getAdminStatus = () => localStorage.getItem("isAdmin") === "true";
const emptyTeacher = { team: "leadership", department: "", name: "", role: "", focus: "", email: "", phone: "", image: "" };
const departmentNames = ["The Arts", "Business Studies", "English", "Languages", "Mathematics", "Pasifika", "PE & Health", "Science", "Social Sciences", "Te Reo Māori", "Technology", "Careers", "Learning Support", "Extracurricular"];

function TeacherCard({ teacher, isAdmin, onEdit, onDelete }) {
  return (
    <article className="teacher-card">
      <img src={teacher.image || schoolBackground} alt={`${teacher.name} profile`} className="teacher-avatar" />
      <p className="teacher-role">{teacher.role}</p>
      {teacher.focus && <p className="teacher-focus">{teacher.focus}</p>}
      <h3>{teacher.name}</h3>
      {teacher.phone && <p className="teacher-phone">{teacher.phone}</p>}
      <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
      {isAdmin && <div className="admin-card-actions"><button type="button" onClick={() => onEdit(teacher)}>Edit</button><button type="button" onClick={() => onDelete(teacher.id)}>Delete</button></div>}
    </article>
  );
}

function TeacherProfilesPage() {
  const isAdmin = getAdminStatus();
  const [teachers, setTeachers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("Extracurricular");
  const [form, setForm] = useState(emptyTeacher);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api.get("/content/teachers")
      .then((response) => setTeachers(response.data))
      .catch(() => setErrorMessage("Unable to load teacher profiles."));
  }, []);

  const leadership = teachers.filter((teacher) => teacher.team === "leadership");
  const pastoral = teachers.filter((teacher) => teacher.team === "pastoral");
  const departmentContacts = teachers.filter((teacher) => teacher.team === "department" && teacher.department === selectedDepartment);
  const handleFormChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = editingId === null ? await api.post("/content/teachers", form) : await api.patch(`/content/teachers/${editingId}`, form);
      let savedTeacher = response.data;
      if (imageFile) {
        const imageData = new FormData();
        imageData.append("teacherImage", imageFile);
        const imageResponse = await api.post(`/content/teachers/${savedTeacher.id}/image`, imageData);
        savedTeacher = imageResponse.data;
      }
      setTeachers((current) => editingId === null ? [...current, savedTeacher] : current.map((teacher) => teacher.id === editingId ? savedTeacher : teacher));
      setForm(emptyTeacher);
      setImageFile(null);
      setEditingId(null);
      setShowForm(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to save teacher profile.");
    }
  };

  const editTeacher = (teacher) => { setForm({ ...emptyTeacher, ...teacher }); setImageFile(null); setEditingId(teacher.id); setShowForm(true); };
  const deleteTeacher = async (id) => {
    if (!window.confirm("Delete this teacher profile?")) return;
    try {
      await api.delete(`/content/teachers/${id}`);
      setTeachers((current) => current.filter((teacher) => teacher.id !== id));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to delete teacher profile.");
    }
  };

  return (
    <main className="teacher-profiles-page">
      <div className="teacher-banner" style={{ backgroundImage: `url(${schoolBackground})` }} />
      <section className="teacher-directory">
        <div className="teacher-page-heading"><p>Rototuna community</p><h1>Teacher Profiles</h1></div>
        {isAdmin && <div className="admin-content-toolbar"><button type="button" className="primary-action" onClick={() => { setForm(emptyTeacher); setImageFile(null); setEditingId(null); setShowForm((current) => !current); }}>{showForm ? "Close editor" : "Add teacher"}</button></div>}
        {isAdmin && showForm && (
          <form className="content-editor-form" onSubmit={handleSubmit}>
            <h2>{editingId === null ? "Add teacher profile" : "Edit teacher profile"}</h2>
            <div className="content-editor-fields">
              <select name="team" value={form.team} onChange={handleFormChange}><option value="leadership">Senior leadership</option><option value="pastoral">Pastoral</option><option value="department">Department</option></select>
              {form.team === "department" && <select name="department" value={form.department} onChange={handleFormChange}><option value="">Select department</option>{departmentNames.map((department) => <option key={department} value={department}>{department}</option>)}</select>}
              <input name="name" value={form.name} onChange={handleFormChange} placeholder="Name" required />
              <input name="role" value={form.role} onChange={handleFormChange} placeholder="Role" required />
              <input name="focus" value={form.focus} onChange={handleFormChange} placeholder="Focus or responsibility" />
              <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Email" required />
              <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Phone" />
              <label className="image-upload-field">Upload portrait<input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /></label>
            </div>
            <div className="content-editor-actions"><button className="primary-action" type="submit">Save teacher</button><button className="secondary-action" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        )}
        {errorMessage && <p className="events-error" role="alert">{errorMessage}</p>}

        <section aria-labelledby="senior-leadership-heading"><h2 id="senior-leadership-heading" className="teacher-section-title">Senior Leadership Team</h2><div className="teacher-grid">{leadership.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} isAdmin={isAdmin} onEdit={editTeacher} onDelete={deleteTeacher} />)}</div>{!leadership.length && <p className="empty-content-state">No leadership profiles have been added yet.</p>}</section>
        <section aria-labelledby="pastoral-team-heading" className="teacher-team-section"><h2 id="pastoral-team-heading" className="teacher-section-title">Pastoral Team</h2><div className="teacher-grid teacher-grid--pastoral">{pastoral.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} isAdmin={isAdmin} onEdit={editTeacher} onDelete={deleteTeacher} />)}</div>{!pastoral.length && <p className="empty-content-state">No pastoral profiles have been added yet.</p>}</section>
        <section className="department-section" aria-labelledby="departments-heading"><h2 id="departments-heading" className="teacher-section-title">Departments</h2><div className="department-directory"><nav className="department-menu" aria-label="Departments">{departmentNames.map((department) => <button type="button" key={department} className={selectedDepartment === department ? "is-selected" : ""} onClick={() => setSelectedDepartment(department)}>{department}</button>)}</nav><div className="department-details"><h3>{selectedDepartment}</h3><div className="department-contact-grid">{departmentContacts.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} isAdmin={isAdmin} onEdit={editTeacher} onDelete={deleteTeacher} />)}{!departmentContacts.length && <p>No contacts have been added for this department yet.</p>}</div></div></div></section>
      </section>
    </main>
  );
}

export default TeacherProfilesPage;
