import { useEffect, useState } from "react";
import api from "../api/axios";
import schoolBackground from "../assets/school_bg.webp";

const getAdminStatus = () => localStorage.getItem("isAdmin") === "true";
const emptyNews = {
  issue: "Winter 2026",
  title: "",
  date: "",
  body: "",
  fullBody: "",
  image: "",
};

function AnnouncementsPage() {
  const isAdmin = getAdminStatus();
  const [news, setNews] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState("Winter 2026");
  const [openAnnouncement, setOpenAnnouncement] = useState(null);
  const [showMoreNews, setShowMoreNews] = useState(false);
  const [form, setForm] = useState(emptyNews);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api
      .get("/content/news")
      .then((response) => setNews(response.data))
      .catch(() => setErrorMessage("Unable to load news."));
  }, []);

  const issues = [...new Set(news.map((item) => item.issue).filter(Boolean))];
  if (!issues.includes(selectedIssue)) issues.unshift(selectedIssue);
  const announcementItems = news.filter((item) => item.issue === selectedIssue);
  const visibleAnnouncements = showMoreNews
    ? announcementItems
    : announcementItems.slice(0, 3);

  const handleFormChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response =
        editingId === null
          ? await api.post("/content/news", form)
          : await api.patch(`/content/news/${editingId}`, form);
      let savedNews = response.data;

      if (imageFile) {
        const imageData = new FormData();
        imageData.append("newsImage", imageFile);
        const imageResponse = await api.post(
          `/content/news/${savedNews.id}/image`,
          imageData,
        );
        savedNews = imageResponse.data;
      }

      setNews((current) =>
        editingId === null
          ? [savedNews, ...current]
          : current.map((item) => (item.id === editingId ? savedNews : item)),
      );
      setForm(emptyNews);
      setImageFile(null);
      setEditingId(null);
      setShowForm(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to save news item.",
      );
    }
  };

  const editNews = (item) => {
    setForm({
      issue: item.issue || "",
      title: item.title || "",
      date: item.date?.slice(0, 10) || "",
      body: item.body || "",
      fullBody: item.fullBody || "",
      image: item.image || "",
    });
    setImageFile(null);
    setEditingId(item.id);
    setShowForm(true);
  };

  const deleteNews = async (id) => {
    if (!window.confirm("Delete this news item?")) return;
    try {
      await api.delete(`/content/news/${id}`);
      setNews((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to delete news item.",
      );
    }
  };

  return (
    <main className="content-page announcements-page">
      {isAdmin && (
        <div className="admin-content-toolbar">
          <button
            type="button"
            className="primary-action add-news-button"
            onClick={() => {
              setForm(emptyNews);
              setImageFile(null);
              setEditingId(null);
              setShowForm(true);
            }}
          >
            Add news
          </button>
        </div>
      )}

      {isAdmin && showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="news-modal-card modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="news-modal-header modal-header">
              <h2 id="news-form-title">
                {editingId === null ? "Add news item" : "Edit news item"}
              </h2>
              <button
                type="button"
                className="close-button"
                aria-label="Close news form"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <form
              className="news-content-editor-form content-editor-form"
              onSubmit={handleSubmit}
            >
              <div className="news-form-grid content-editor-fields">
                <label className="field-group">
                  <span>Issue</span>
                  <input
                    name="issue"
                    value={form.issue}
                    onChange={handleFormChange}
                    placeholder="Issue, e.g. Winter 2026"
                    required
                  />
                </label>
                <label className="field-group">
                  <span>News title</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="News title"
                    required
                  />
                </label>
                <label className="field-group">
                  <span>Date</span>
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleFormChange}
                  />
                </label>
                <label className="image-upload-field field-group">
                  <span>Upload photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>
              <label className="field-group full-width">
                <span>Short summary</span>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleFormChange}
                  placeholder="Short summary"
                  rows="3"
                  required
                />
              </label>
              <label className="field-group full-width">
                <span>Full article text</span>
                <textarea
                  name="fullBody"
                  value={form.fullBody}
                  onChange={handleFormChange}
                  placeholder="Full article text"
                  rows="5"
                />
              </label>
              <div className="content-editor-actions">
                <button className="primary-action" type="submit">
                  Save news
                </button>
                <button
                  className="secondary-action"
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

      <section className="newsletter-section" aria-label="News issues">
        <h1>Rototuna News</h1>
        <div className="newsletter-issue-picker">
          <label htmlFor="newsletter-issue">View another issue</label>
          <select
            id="newsletter-issue"
            value={selectedIssue}
            onChange={(event) => {
              setSelectedIssue(event.target.value);
              setOpenAnnouncement(null);
              setShowMoreNews(false);
            }}
          >
            {issues.map((issue) => (
              <option key={issue} value={issue}>
                {issue}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section
        className="announcement-list"
        aria-label={`${selectedIssue} articles`}
      >
        {visibleAnnouncements.map((announcement) => (
          <article
            className="announcement-card"
            key={announcement.id}
            role="button"
            tabIndex="0"
            onClick={() => setOpenAnnouncement(announcement.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpenAnnouncement(announcement.id);
              }
            }}
          >
            <img
              src={announcement.image || schoolBackground}
              alt="Rototuna school community"
            />
            <div className="announcement-card-content">
              <p className="announcement-date">
                {announcement.date
                  ? new Date(announcement.date).toLocaleDateString("en-NZ", {
                      dateStyle: "long",
                    })
                  : "Rototuna News"}
              </p>
              <h2>{announcement.title}</h2>
              <p>{announcement.body}</p>
            </div>
            {isAdmin && (
              <div
                className="admin-card-actions"
                onClick={(event) => event.stopPropagation()}
              >
                <button type="button" onClick={() => editNews(announcement)}>
                  <img
                    src="src/assets/edit.png"
                    alt="Edit"
                    style={{ width: "16px", height: "16px" }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => deleteNews(announcement.id)}
                >
                  <img
                    src="/assets/bin.png"
                    alt="Delete"
                    style={{ width: "16px", height: "16px" }}
                  />
                </button>
              </div>
            )}
          </article>
        ))}
        {!visibleAnnouncements.length && (
          <p>No news has been added for this issue yet.</p>
        )}
      </section>

      {announcementItems.length > 3 && (
        <div className="more-news-actions">
          <button
            type="button"
            className="more-news-button"
            onClick={() => setShowMoreNews((current) => !current)}
          >
            {showMoreNews ? "Show less news" : "More news"}
          </button>
        </div>
      )}

      {openAnnouncement !== null &&
        (() => {
          const announcement = news.find(
            (item) => item.id === openAnnouncement,
          );
          if (!announcement) return null;
          return (
            <div
              className="modal-overlay"
              onClick={() => setOpenAnnouncement(null)}
            >
              <div
                className="announcement-modal-card modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="announcement-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 id="announcement-modal-title">{announcement.title}</h2>
                  <button
                    type="button"
                    className="close-button"
                    aria-label="Close article"
                    onClick={() => setOpenAnnouncement(null)}
                  >
                    ×
                  </button>
                </div>
                <img
                  src={announcement.image || schoolBackground}
                  alt="Rototuna school community"
                  className="announcement-modal-image"
                />
                <p className="announcement-date">
                  {announcement.date
                    ? new Date(announcement.date).toLocaleDateString("en-NZ", {
                        dateStyle: "long",
                      })
                    : "Rototuna News"}
                </p>
                <p>{announcement.fullBody || announcement.body}</p>
                <p>
                  This story is part of the {announcement.issue} issue of
                  Rototuna News.
                </p>
              </div>
            </div>
          );
        })()}
    </main>
  );
}

export default AnnouncementsPage;
