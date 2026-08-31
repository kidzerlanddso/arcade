import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import EventDetailsModal from "./EventDetailsModal";
import api from "../api/axios";
import { formatEventDate, formatEventTime } from "../data/events";

function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events")
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Unable to load dashboard events:", error));
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
          Upcoming events, Rototuna alumni meetups, and local activities
        </h1>
        <Link className="events-icon-link" to="/events?view=calendar" aria-label="Open events calendar" title="Open events calendar">
          Events Calendar
        </Link>
      </div>

      <div className="event-grid">
        {events.slice(0, 5).map((event) => (
          <article
            className="event-card"
            key={event.id}
            role="button"
            tabIndex="0"
            onClick={() => setSelectedEvent(event)}
            onKeyDown={(keyEvent) => {
              if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                keyEvent.preventDefault();
                setSelectedEvent(event);
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