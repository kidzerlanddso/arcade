import { useEffect, useState } from "react";
import api from "../api/axios";
import schoolBackground from "../assets/school_bg.webp";

const getAdminStatus = () => localStorage.getItem("isAdmin") === "true";
const emptyNews = { issue: "Winter 2026", title: "", date: "", body: "", fullBody: "", image: "" };

function AnnouncementsPage() {
  const isAdmin = getAdminStatus();
  const [news, setNews] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState("Winter 2026");
  const [openAnnouncement, setOpenAnnouncement] = useState(null);
  const [showMoreNews, setShowMoreNews] = useState(false);
  const [form, setForm] = useState(emptyNews);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api.get("/content/news")
      .then((response) => setNews(response.data))
      .catch(() => setErrorMessage("Unable to load news."));
  }, []);

  const issues = [...new Set(news.map((item) => item.issue).filter(Boolean))];
  if (!issues.includes(selectedIssue)) issues.unshift(selectedIssue);
  const announcementItems = news.filter((item) => item.issue === selectedIssue);
  const visibleAnnouncements = showMoreNews ? announcementItems : announcementItems.slice(0, 3);

  const handleFormChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = editingId === null
        ? await api.post("/content/news", form)
        : await api.patch(`/content/news/${editingId}`, form);
      setNews((current) => editingId === null ? [response.data, ...current] : current.map((item) => item.id === editingId ? response.data : item));
      setForm(emptyNews);
      setEditingId(null);
      setShowForm(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to save news item.");
    }
  };

  const editNews = (item) => {
    setForm({ issue: item.issue || "", title: item.title || "", date: item.date?.slice(0, 10) || "", body: item.body || "", fullBody: item.fullBody || "", image: item.image || "" });
    setEditingId(item.id);
    setShowForm(true);
  };

  const deleteNews = async (id) => {
    if (!window.confirm("Delete this news item?")) return;
    try {
      await api.delete(`/content/news/${id}`);
      setNews((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to delete news item.");
    }
  };

  return (
    <main className="content-page announcements-page">
      {isAdmin && <div className="admin-content-toolbar"><button type="button" className="primary-action add-news-button" onClick={() => { setForm(emptyNews); setEditingId(null); setShowForm(true); }}>Add news</button></div>}

      {isAdmin && showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="news-modal-card modal-card" role="dialog" aria-modal="true" aria-labelledby="news-form-title" onClick={(event) => event.stopPropagation()}>
            <div className="news-modal-header modal-header">
              <h2 id="news-form-title">{editingId === null ? "Add news item" : "Edit news item"}</h2>
              <button type="button" className="close-button" aria-label="Close news form" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form className="news-content-editor-form content-editor-form" onSubmit={handleSubmit}>
              <div className="news-form-grid content-editor-fields">
                <label className="field-group"><span>Issue</span><input name="issue" value={form.issue} onChange={handleFormChange} placeholder="Issue, e.g. Winter 2026" required /></label>
                <label className="field-group"><span>News title</span><input name="title" value={form.title} onChange={handleFormChange} placeholder="News title" required /></label>
                <label className="field-group"><span>Date</span><input name="date" type="date" value={form.date} onChange={handleFormChange} /></label>
                <label className="field-group"><span>Image URL</span><input name="image" value={form.image} onChange={handleFormChange} placeholder="Image URL (optional)" /></label>
              </div>
              <label className="field-group full-width"><span>Short summary</span><textarea name="body" value={form.body} onChange={handleFormChange} placeholder="Short summary" rows="3" required /></label>
              <label className="field-group full-width"><span>Full article text</span><textarea name="fullBody" value={form.fullBody} onChange={handleFormChange} placeholder="Full article text" rows="5" /></label>
              <div className="content-editor-actions"><button className="primary-action" type="submit">Save news</button><button className="secondary-action" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {errorMessage && <p className="events-error" role="alert">{errorMessage}</p>}

      <section className="newsletter-section" aria-label="News issues">
        <h1>Rototuna News</h1>
        <div className="newsletter-issue-picker">
          <label htmlFor="newsletter-issue">View another issue</label>
          <select id="newsletter-issue" value={selectedIssue} onChange={(event) => { setSelectedIssue(event.target.value); setOpenAnnouncement(null); setShowMoreNews(false); }}>
            {issues.map((issue) => <option key={issue} value={issue}>{issue}</option>)}
          </select>
        </div>
      </section>

      <section className="announcement-list" aria-label={`${selectedIssue} articles`}>
        {visibleAnnouncements.map((announcement) => (
          <article className="announcement-card" key={announcement.id}>
            <img src={announcement.image || schoolBackground} alt="Rototuna school community" />
            <div className="announcement-card-content">
              <p className="announcement-date">{announcement.date ? new Date(announcement.date).toLocaleDateString("en-NZ", { dateStyle: "long" }) : "Rototuna News"}</p>
              <h2>{announcement.title}</h2>
              <p>{announcement.body}</p>
            </div>
            <button type="button" className="announcement-read-button" onClick={() => setOpenAnnouncement(openAnnouncement === announcement.id ? null : announcement.id)} aria-expanded={openAnnouncement === announcement.id}>{openAnnouncement === announcement.id ? "Close article" : "Continue reading"}</button>
            {openAnnouncement === announcement.id && <div className="announcement-expanded-copy"><p>{announcement.fullBody || announcement.body}</p><p>This story is part of the {selectedIssue} issue of Rototuna News.</p></div>}
            {isAdmin && <div className="admin-card-actions"><button type="button" onClick={() => editNews(announcement)}>Edit</button><button type="button" onClick={() => deleteNews(announcement.id)}>Delete</button></div>}
          </article>
        ))}
        {!visibleAnnouncements.length && <p>No news has been added for this issue yet.</p>}
      </section>

      {announcementItems.length > 3 && <div className="more-news-actions"><button type="button" className="more-news-button" onClick={() => setShowMoreNews((current) => !current)}>{showMoreNews ? "Show less news" : "More news"}</button></div>}
    </main>
  );
}

export default AnnouncementsPage;
