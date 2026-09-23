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
  const [featuredTeachers, setFeaturedTeachers] = useState([]);
  const [showIntroModal, setShowIntroModal] = useState(
    () => localStorage.getItem(DASHBOARD_INTRO_DISMISSED_KEY) !== "true",
  );
  const isAdmin = getAdminFromToken();

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
      .then((response) => setFeaturedTeachers(response.data.filter((teacher) => teacher.featured)))
      .catch(() => setFeaturedTeachers([]));
  }, [isAdmin]);

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

      <div className="events-topbar">
        <h1 className="events-title">What's On</h1>
        {isAdmin && (
          <Link
            className="events-icon-link"
            to="/events?view=calendar"
            aria-label="Open events calendar"
            title="Open events calendar"
          >
            Manage Events
          </Link>
        )}
      </div>

      <div className="event-grid">
        {events.length === 0 ? (
          <p className="events-empty-state">
            No upcoming events at the moment.
          </p>
        ) : (
          events.slice(0, 5).map((event) => (
            <article
              className="event-card"
              key={event.id}
              role="button"
              tabIndex="0"
              onClick={() => window.location.assign(`/events/${event.id}`)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                  keyEvent.preventDefault();
                  window.location.assign(`/events/${event.id}`);
                }
              }}
            >
              <div
                className="event-image"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(12,18,28,0.04), rgba(12,18,28,0.12)), url(${event.image})`,
                }}
              ></div>
              <div className="event-copy">
                <h3>{event.title}</h3>
                <p className="event-date">{formatEventDate(event.date)}</p>
                <p className="event-location">
                  {formatEventTime(event.startTime)} -{" "}
                  {formatEventTime(event.endTime)} · {event.location}
                </p>
              </div>
            </article>
          ))
        )}
      </div>

      {featuredTeachers.length > 0 && (
        <section className="featured-teachers" aria-label="Featured teachers">
          <h2 className="featured-teachers-title">Featured Teachers</h2>
          <div className="featured-teachers-grid">
            {featuredTeachers.map((teacher) => (
              <article className="teacher-card featured-teacher-card" key={teacher.id}>
                <img src={teacher.image || schoolBackground} alt={`${teacher.name} profile`} className="teacher-avatar" />
                <p className="teacher-role">{teacher.role}</p>
                {teacher.focus && <p className="teacher-focus">{teacher.focus}</p>}
                <h3>{teacher.name}</h3>
              </article>
            ))}
          </div>
        </section>
      )}

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default Dashboard;
