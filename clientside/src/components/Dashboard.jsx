import { Link } from "react-router-dom";
import { useState } from "react";
import { getEvents } from "../data/events";
import EventDetailsModal from "./EventDetailsModal";

function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const events = getEvents();

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
              <p className="event-date">{event.date}</p>
              <p className="event-location">by {event.location}</p>
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