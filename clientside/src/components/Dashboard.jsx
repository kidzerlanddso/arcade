import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import EventDetailsModal from "./EventDetailsModal";
import api from "../api/axios";
import schoolBackground from "../assets/school_bg.webp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  defaultEvents,
  formatEventDate,
  formatEventTime,
} from "../data/events";

const CAROUSEL_INTERVAL_MS = 5000;

const getAdminFromToken = () => {
  const currentToken = localStorage.getItem("token");

  if (!currentToken) return false;

  try {
    const payload = JSON.parse(atob(currentToken.split(".")[1] || ""));
    const adminValue = payload.admin;
    if (adminValue !== undefined && adminValue !== null) {
      return (
        adminValue === true ||
        adminValue === 1 ||
        adminValue === "1" ||
        adminValue === "true"
      );
    }
  } catch (error) {
    console.error("Error decoding token for admin status:", error);
  }

  const storedAdmin = localStorage.getItem("isAdmin");
  return storedAdmin === "true" || storedAdmin === "1";
};

const DASHBOARD_INTRO_DISMISSED_KEY = "dashboard-intro-dismissed";

function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [featuredTeachers, setFeaturedTeachers] = useState([]);
  const [featuredTeachersStatus, setFeaturedTeachersStatus] =
    useState("loading");
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsStatus, setAnnouncementsStatus] = useState("loading");
  const [openAnnouncement, setOpenAnnouncement] = useState(null);
  const [showIntroModal, setShowIntroModal] = useState(
    () => localStorage.getItem(DASHBOARD_INTRO_DISMISSED_KEY) !== "true",
  );
  const isAdmin = getAdminFromToken();
  const carouselEvents = events.slice(0, 5);
  const dashboardAnnouncements = announcements.slice(0, 3);

  const dismissIntroModal = (rememberChoice = false) => {
    if (rememberChoice) {
      localStorage.setItem(DASHBOARD_INTRO_DISMISSED_KEY, "true");
    }
    setShowIntroModal(false);
  };

  useEffect(() => {
    const fetchPendingUsers = async () => {
      if (!isAdmin) return;

      try {
        const response = await api.get(
          "/auth/membership-requests/pending-requests",
        );

        const pendingCount = Number(response.data?.count || 0);

        if (pendingCount > 0) {
          toast.info(
            <div>
              <div>
                Attention: You have {pendingCount} pending membership requests
                to review.
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <Link
                  to="/membership-request"
                  style={{
                    color: "#fff",
                    textDecoration: "underline",
                    fontWeight: 700,
                  }}
                >
                  Review requests
                </Link>
              </div>
            </div>,
            {
              toastId: "pending-requests-toast",
              position: "top-right",
              autoClose: 5000,
              theme: "colored",
            },
          );
        }
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          toast.error("Could not load pending membership requests.");
        }
      }
    };

    const fetchIncomingConnectionRequests = async () => {
      if (isAdmin) return;

      try {
        const response = await api.get("/connection/pending");
        const receivedCount = Number(response.data?.received?.length || 0);

        if (receivedCount > 0) {
          toast.info(
            <div>
              <div>
                You have {receivedCount} connection request
                {receivedCount === 1 ? "" : "s"} waiting for your attention.
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <Link
                  to="/profile/me"
                  style={{
                    color: "#fff",
                    textDecoration: "underline",
                    fontWeight: 700,
                  }}
                >
                  View requests
                </Link>
              </div>
            </div>,
            {
              toastId: "incoming-connection-requests-toast",
              position: "top-right",
              autoClose: 5000,
              theme: "colored",
            },
          );
        }
      } catch (error) {
        console.error("Failed to fetch incoming connection requests:", error);
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          toast.error("Could not load connection requests.");
        }
      }
    };

    fetchPendingUsers();
    fetchIncomingConnectionRequests();

    const toEventDate = (event) => {
      const rawDate = event?.date || "";
      const rawTime = event?.startTime || "00:00";

      if (!rawDate) return new Date(0);
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        return new Date(`${rawDate}T${rawTime}:00`);
      }

      return new Date(rawDate);
    };

    const getUpcomingEvents = (items) => {
      const now = new Date();
      return (items || [])
        .filter((event) => toEventDate(event) >= now)
        .sort(
          (firstEvent, secondEvent) =>
            toEventDate(firstEvent) - toEventDate(secondEvent),
        );
    };

    api
      .get("/events")
      .then((response) => {
        const upcomingEvents = getUpcomingEvents(response.data);
        setEvents(
          upcomingEvents.length
            ? upcomingEvents
            : getUpcomingEvents(defaultEvents),
        );
      })
      .catch((error) => {
        console.error("Unable to load dashboard events:", error);
        setEvents(getUpcomingEvents(defaultEvents));
      });

    api
      .get("/content/teachers")
      .then((response) => {
        const teachers = Array.isArray(response.data) ? response.data : [];
        const featured = teachers.filter((teacher) =>
          Boolean(teacher.featured),
        );
        setFeaturedTeachers(featured);
        setFeaturedTeachersStatus("ready");
      })
      .catch((error) => {
        console.error("Unable to load featured teachers:", error);
        setFeaturedTeachers([]);
        setFeaturedTeachersStatus("error");
      });

    api
      .get("/content/news")
      .then((response) => {
        const news = Array.isArray(response.data) ? response.data : [];
        setAnnouncements(news);
        setAnnouncementsStatus("ready");
      })
      .catch((error) => {
        console.error("Unable to load announcements:", error);
        setAnnouncements([]);
        setAnnouncementsStatus("error");
      });
  }, [isAdmin]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [events]);

  useEffect(() => {
    if (carouselEvents.length <= 1) return undefined;

    const timerId = window.setInterval(() => {
      setCarouselIndex((current) => (current + 1) % carouselEvents.length);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [carouselEvents.length]);

  const goToCarouselSlide = (direction) => {
    if (carouselEvents.length === 0) return;
    setCarouselIndex((current) => {
      const nextIndex = current + direction;
      if (nextIndex < 0) return carouselEvents.length - 1;
      if (nextIndex >= carouselEvents.length) return 0;
      return nextIndex;
    });
  };

  const activeCarouselEvent = carouselEvents[carouselIndex] || null;

  return (
    <div className="dashboard-shell">
      <ToastContainer />

      {showIntroModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "1rem",
          }}
          onClick={() => dismissIntroModal()}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "85rem",
              height: "40rem",
              background: "#fff",
              borderRadius: "18px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              padding: "2rem 2rem 1.5rem",
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
              display: "flex" /* Added: Enables flexbox layout */,
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              aria-label="Close welcome message"
              onClick={() => dismissIntroModal()}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                border: "none",
                background: "transparent",
                fontSize: "1.8rem",
                color: "#475569",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ×
            </button>

            <img
              src="src/assets/RHS-logo-black.png"
              alt="Logo"
              className="app-logo"
            />
            <h2
              style={{
                margin: "0 0 1rem",
                color: "#0f172a",
                fontSize: "1.8rem",
              }}
            >
              Welcome to Alumni Connect
            </h2>

            <p
              style={{
                margin: 0,
                color: "#1f2937",
                lineHeight: 1.8,
                fontSize: "1.06rem",
              }}
            >
              We are excited that you would like to continue to be part of the
              Rototuna High Schools Community. Joining our Alumni Connect will
              enable you to stay in contact so we can continue shaping our
              identities together!
            </p>

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => dismissIntroModal(true)}
                style={{
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  color: "#0a66c2",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  marginRight: "auto",
                  position: "absolute",
                  bottom: "2.5rem",
                  left: "3rem",
                }}
              >
                Don&apos;t show me again
              </button>{" "}
              <button
                type="button"
                onClick={() => dismissIntroModal()}
                style={{
                  background: "#0a66c2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "999px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  position: "absolute",
                  bottom: "2.5rem",
                  right: "2rem",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCarouselEvent ? (
        <section
          className="events-carousel"
          aria-roledescription="carousel"
          aria-label="Featured upcoming events"
        >
          <h1 className="events-title">What's On</h1>
          <button
            type="button"
            className="events-carousel-nav events-carousel-nav--prev"
            aria-label="Previous event"
            onClick={() => goToCarouselSlide(-1)}
          >
            ‹
          </button>

          <article
            className="events-carousel-slide"
            role="button"
            tabIndex="0"
            onClick={() =>
              window.location.assign(`/events/${activeCarouselEvent.id}`)
            }
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                keyEvent.preventDefault();
                window.location.assign(`/events/${activeCarouselEvent.id}`);
              }
            }}
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(12,18,28,0.72) 0%, rgba(12,18,28,0.35) 45%, rgba(12,18,28,0.15) 100%), url(${activeCarouselEvent.image})`,
            }}
          >
            <div className="events-carousel-copy">
              <p className="events-carousel-label">Featured event</p>
              <h2>{activeCarouselEvent.title}</h2>
              <p>
                {formatEventDate(activeCarouselEvent.date)} ·{" "}
                {formatEventTime(activeCarouselEvent.startTime)} -{" "}
                {formatEventTime(activeCarouselEvent.endTime)}
              </p>
              <p className="events-carousel-location">
                {activeCarouselEvent.location}
              </p>
            </div>
          </article>

          <button
            type="button"
            className="events-carousel-nav events-carousel-nav--next"
            aria-label="Next event"
            onClick={() => goToCarouselSlide(1)}
          >
            ›
          </button>

          {carouselEvents.length > 1 && (
            <div className="events-carousel-dots" role="tablist">
              {carouselEvents.map((event, index) => (
                <button
                  key={event.id}
                  type="button"
                  role="tab"
                  aria-label={`Show ${event.title}`}
                  aria-selected={index === carouselIndex}
                  className={`events-carousel-dot${
                    index === carouselIndex ? " is-active" : ""
                  }`}
                  onClick={() => setCarouselIndex(index)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <p className="events-empty-state">
          No upcoming events at the moment.{" "}
          <Link to="/events">Browse all events</Link>
        </p>
      )}

      {announcementsStatus !== "loading" && (
        <section
          className="dashboard-announcements"
          aria-label="Latest announcements"
        >
          <div className="dashboard-teacher-team-header">
            <h2 className="dashboard-teacher-team-title">Announcements</h2>
            <Link to="/announcements" className="dashboard-teacher-team-link">
              View all news
            </Link>
          </div>
          {dashboardAnnouncements.length > 0 ? (
            <div className="announcement-list">
              {dashboardAnnouncements.map((announcement) => (
                <article
                  className="announcement-card"
                  key={announcement.id}
                  role="button"
                  tabIndex="0"
                  onClick={() => setOpenAnnouncement(announcement.id)}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                      keyEvent.preventDefault();
                      setOpenAnnouncement(announcement.id);
                    }
                  }}
                >
                  <img src={announcement.image || schoolBackground} alt="" />
                  <div className="announcement-card-content">
                    <p className="announcement-date">
                      {announcement.date
                        ? new Date(announcement.date).toLocaleDateString(
                            "en-NZ",
                            { dateStyle: "long" },
                          )
                        : "Rototuna News"}
                    </p>
                    <h2>{announcement.title}</h2>
                    <p>{announcement.body}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="events-empty-state">
              {announcementsStatus === "error"
                ? "Unable to load announcements. Please refresh and try again."
                : "No announcements yet."}{" "}
              <Link to="/announcements">Open news</Link>
            </p>
          )}
        </section>
      )}

      {featuredTeachersStatus !== "loading" && (
        <section
          className="teacher-team-section dashboard-teacher-team"
          aria-label="Featured teachers"
        >
          <div className="dashboard-teacher-team-header">
            <h2 className="dashboard-teacher-team-title">Spotlight </h2>
            <Link to="/teachers" className="dashboard-teacher-team-link">
              View all teachers
            </Link>
          </div>
          {featuredTeachers.length > 0 ? (
            <div className="teacher-grid teacher-grid--pastoral">
              {featuredTeachers.map((teacher) => (
                <article className="teacher-card" key={teacher.id}>
                  <img
                    src={teacher.image || schoolBackground}
                    alt={`${teacher.name} profile`}
                    className="teacher-avatar"
                  />
                  <p className="teacher-role">{teacher.name}</p>
                  {teacher.focus && (
                    <p className="teacher-focus">{teacher.focus}</p>
                  )}
                  <h3>{teacher.role}</h3>
                </article>
              ))}
            </div>
          ) : (
            <p className="events-empty-state">
              {featuredTeachersStatus === "error"
                ? "Unable to load featured teachers. Please refresh and try again."
                : "No featured teachers yet. Mark teachers as featured in Teacher Profiles."}{" "}
              <Link to="/teachers">Open teacher profiles</Link>
            </p>
          )}
        </section>
      )}

      <div className="social-links-row">
        <a
          className="social-link-card"
          href="https://www.facebook.com/groups/1560283425033484/?ref=invite_via_link&invite_short_link_key=g%2F794SKD5BY%2FIboFwhr2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join the Rototuna alumni Facebook group"
        >
          <div
            className="social-link-visual"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(12,18,28,0.04), rgba(12,18,28,0.18)), url(/Facebook_group.png)`,
            }}
          >
            <span
              className="social-link-logo social-link-logo--facebook"
              aria-hidden="true"
            >
              <i className="fa-brands fa-facebook-f" />
            </span>
          </div>
          <div className="event-copy">
            <h3>Join our Facebook Group</h3>
            <p className="event-date">Stay connected with alumni</p>
            <p className="event-location">
              News, reunions, and community updates
            </p>
          </div>
        </a>

        <a
          className="social-link-card"
          href="https://www.instagram.com/rototuna.senior.high?stkn=MTU5M3Bva2Uybmxueg%3D%3D&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Rototuna Senior High on Instagram"
        >
          <div
            className="social-link-visual"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(12,18,28,0.04), rgba(12,18,28,0.18)), url(/ins_rototunas.jpg)`,
            }}
          >
            <span
              className="social-link-logo social-link-logo--instagram"
              aria-hidden="true"
            >
              <i className="fa-brands fa-instagram" />
            </span>
          </div>
          <div className="event-copy">
            <h3>Follow us on Instagram</h3>
            <p className="event-date">@rototuna.senior.high</p>
            <p className="event-location">
              Photos, stories, and school highlights
            </p>
          </div>
        </a>
      </div>

      {openAnnouncement !== null &&
        (() => {
          const announcement = announcements.find(
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
                aria-labelledby="dashboard-announcement-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 id="dashboard-announcement-modal-title">
                    {announcement.title}
                  </h2>
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
                  alt=""
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
                {announcement.issue && (
                  <p>This story is part of the {announcement.issue} issue.</p>
                )}
              </div>
            </div>
          );
        })()}

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default Dashboard;
