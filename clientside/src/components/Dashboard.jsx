import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import EventDetailsModal from "./EventDetailsModal";
import api from "../api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { defaultEvents, formatEventDate, formatEventTime } from "../data/events";

const getAdminFromToken = () => {
  const currentToken = localStorage.getItem("token");

  if (!currentToken) return false;

  try {
    const payload = JSON.parse(atob(currentToken.split(".")[1] || ""));
    const adminValue = payload.admin;
    if (adminValue !== undefined && adminValue !== null) {
      return adminValue === true || adminValue === 1 || adminValue === "1" || adminValue === "true";
    }
  } catch (error) {
    console.error("Error decoding token for admin status:", error);
  }

  const storedAdmin = localStorage.getItem("isAdmin");
  return storedAdmin === "true" || storedAdmin === "1";
};


function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");
  const isAdmin = getAdminFromToken();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchPendingUsers = async () => {
      try {
        const response = await api.get("/auth/membership-requests/pending-requests");

        const pendingCount = Number(response.data?.count || 0);

        if (pendingCount > 0) {
          toast.info(`Attention: You have ${pendingCount} pending membership requests to review.`, {
            toastId: 'pending-requests-toast', // Prevents duplicates during React StrictMode
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            
          });
        }
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
        // Only show an error toast if it's not a 401/403 authorization denial (e.g., if a non-admin logs in)
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          toast.error("Could not load pending membership requests.");
        }
      }
    };

    fetchPendingUsers();

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
        .sort((firstEvent, secondEvent) => toEventDate(firstEvent) - toEventDate(secondEvent));
    };

    api.get("/events")
      .then((response) => {
        const upcomingEvents = getUpcomingEvents(response.data);
        setEvents(upcomingEvents.length ? upcomingEvents : getUpcomingEvents(defaultEvents));
      })
      .catch((error) => {
        console.error("Unable to load dashboard events:", error);
        setEvents(getUpcomingEvents(defaultEvents));
      });
  }, []);

  return (
    <div className="dashboard-shell">
      {isAdmin && (<div className="grid place-items-center h-dvh bg-zinc-900/15">
        <ToastContainer />
      </div>)}
    
    <div className="events-topbar">
        <h1 className="events-title">
          Upcoming events
        </h1>
        {isAdmin && (<Link className="events-icon-link" to="/events?view=calendar" aria-label="Open events calendar" title="Open events calendar">
          Add Events
        </Link>)}
      </div>

      <div className="event-grid">
        {events.length === 0 ? (
          <p className="events-empty-state">No upcoming events at the moment.</p>
        ) : events.slice(0, 5).map((event) => (
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
              style={{ backgroundImage: `linear-gradient(180deg, rgba(12,18,28,0.04), rgba(12,18,28,0.12)), url(${event.image})` }}
            >
              <span className="event-badge">{event.price}</span>
            </div>
            <div className="event-copy">
              <h3>{event.title}</h3>
              <p className="event-date">{formatEventDate(event.date)}</p>
              <p className="event-location">{formatEventTime(event.startTime)} - {formatEventTime(event.endTime)} · {event.location}</p>
            </div>
          </article>
        ))}
      </div>


      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default Dashboard;