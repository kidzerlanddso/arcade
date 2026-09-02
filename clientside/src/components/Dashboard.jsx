import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import EventDetailsModal from "./EventDetailsModal";
import api from "../api/axios";
import { defaultEvents, formatEventDate, formatEventTime } from "../data/events";

function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
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
      {/*
      <div className="dashboard-action-panel">
        <Link className="primary-action" to="/profile">
          View All Profiles
        </Link>
        <Link className="primary-action" to="/membership-request">
          Membership Request
        </Link>
        <Link className="primary-action" to="/message-alumni">
          Message Alumni
        </Link>
      </div>
      */}

      <div className="events-topbar">
        <h1 className="events-title">
          Upcoming events
        </h1>
        <Link className="events-icon-link" to="/events?view=calendar" aria-label="Open events calendar" title="Open events calendar">
          Add Events
        </Link>
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