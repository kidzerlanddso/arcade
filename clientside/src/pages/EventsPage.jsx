import { useState } from "react";
import { getEvents, saveEvent } from "../data/events";
import EventDetailsModal from "../components/EventDetailsModal";

const getAdminStatus = () => localStorage.getItem("isAdmin") === "true";

function EventsPage() {
  const [events, setEvents] = useState(() => getEvents());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [isAdmin] = useState(getAdminStatus);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    price: "Free",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
  });

  const handleNewEventChange = (event) => {
    const { name, value } = event.target;
    setNewEvent((current) => ({ ...current, [name]: value }));
  };

  const handleAddEvent = (event) => {
    event.preventDefault();
    const createdEvent = { ...newEvent, id: Date.now() };
    saveEvent(createdEvent);
    setEvents(getEvents());
    setNewEvent({ ...newEvent, title: "", date: "", startTime: "", endTime: "", location: "", description: "" });
    setShowAddEvent(false);
  };

  return (
    <div className="events-page-shell">
      <div className="events-page-header">
        <div>
          <p className="events-eyebrow">Rototuna community calendar</p>
          <h1>Upcoming events</h1>
          <p>Find alumni meetups, local activities, and school community events around Hamilton.</p>
        </div>
        <div className="events-header-actions">
          <span className="events-count">{events.length} events</span>
          {isAdmin && (
            <button className="add-event-button" type="button" onClick={() => setShowAddEvent((current) => !current)}>
              + Add new event
            </button>
          )}
        </div>
      </div>

      {isAdmin && showAddEvent && (
        <form className="add-event-form" onSubmit={handleAddEvent}>
          <h2>Add a Rototuna event</h2>
          <div className="add-event-fields">
            <input name="title" value={newEvent.title} onChange={handleNewEventChange} placeholder="Event title" required />
            <input name="date" value={newEvent.date} onChange={handleNewEventChange} placeholder="Date" required />
            <input name="startTime" value={newEvent.startTime} onChange={handleNewEventChange} placeholder="Start time" required />
            <input name="endTime" value={newEvent.endTime} onChange={handleNewEventChange} placeholder="End time" required />
            <input name="location" value={newEvent.location} onChange={handleNewEventChange} placeholder="Rototuna location" required />
            <input name="price" value={newEvent.price} onChange={handleNewEventChange} placeholder="Price" required />
          </div>
          <textarea name="description" value={newEvent.description} onChange={handleNewEventChange} placeholder="Event description" rows="4" required />
          <div className="add-event-form-actions">
            <button className="primary-action" type="submit">Save event</button>
            <button className="secondary-action" type="button" onClick={() => setShowAddEvent(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="events-page-grid">
        {events.map((event) => (
          <article
            className="events-page-card"
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
              className="events-page-image"
              style={{ backgroundImage: `url(${event.image})` }}
            >
              <span className="event-badge">{event.price}</span>
            </div>
            <div className="events-page-card-copy">
              <h2>{event.title}</h2>
              <p className="event-date">{event.date}</p>
              <p className="event-location">{event.location}</p>
              <p className="event-description">{event.description}</p>
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

export default EventsPage;
