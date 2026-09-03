import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { formatEventDate, formatEventTime } from "../data/events";

function EventDetailsPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSection, setActiveSection] = useState("about");
  const [isJoined, setIsJoined] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy link");

  useEffect(() => {
    api.get("/events")
      .then((response) => {
        const selectedEvent = response.data.find((currentEvent) => String(currentEvent.id) === eventId);
        if (!selectedEvent) {
          setErrorMessage("Event not found.");
          return;
        }
        setEvent(selectedEvent);
      })
      .catch((error) => setErrorMessage(error.response?.data?.message || "Unable to load event."));
  }, [eventId]);

  if (errorMessage) {
    return <main className="event-details-page"><p className="events-error">{errorMessage}</p><Link to="/events">Back to events</Link></main>;
  }

  if (!event) return <main className="event-details-page"><p>Loading event...</p></main>;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy unavailable");
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="event-details-page">
      <Link className="event-details-back" to="/events">Back to events</Link>
      <section className="event-details-hero">
        <div className="event-details-hero-image" style={{ backgroundImage: `url(${event.image})` }} />
        <div className="event-details-summary">
          <span className="event-details-price">{event.price}</span>
          <h1>{event.title}</h1>
          <p className="event-details-rating">★★★★★ <span>Community event</span></p>
          <p className="event-details-meta">⌖ {event.location}</p>
          <p className="event-details-meta">◷ {formatEventDate(event.date)} · {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}</p>
          <div className="event-details-share">
            <span>Share</span>
            <button type="button" onClick={handleCopyLink}>{copyStatus}</button>
          </div>
        </div>
      </section>

      <nav className="event-details-tabs" aria-label="Event details sections">
        {["about", "details", "photos", "discussion"].map((section) => (
          <button
            className={activeSection === section ? "event-details-tab-active" : ""}
            type="button"
            key={section}
            onClick={() => handleSectionChange(section)}
          >
            {section === "about" ? "✦" : section === "details" ? "▣" : section === "photos" ? "▧" : "☷"}
            <span>{section === "discussion" ? "Discussions" : section[0].toUpperCase() + section.slice(1)}</span>
          </button>
        ))}
        <button type="button" onClick={() => setIsJoined((joined) => !joined)}>{isJoined ? "Joined" : "Join this event"}</button>
      </nav>

      <div className="event-details-content">
        <section className="event-details-copy" id="about">
          <h2>About this event</h2>
          <p>{event.description}</p>
          <p id="details">Join fellow Rototuna alumni and community members for an inclusive event with time to connect, learn, and enjoy the school community.</p>
          <h2 id="details">Details</h2>
          <dl className="event-details-facts">
            <div><dt>Date</dt><dd>{formatEventDate(event.date)}</dd></div>
            <div><dt>Time</dt><dd>{formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}</dd></div>
            <div><dt>Location</dt><dd>{event.location}</dd></div>
          </dl>
          <section id="photos" className="event-details-section">
            <h2>Photos</h2>
            <div className="event-details-photo" style={{ backgroundImage: `url(${event.image})` }} aria-label={`${event.title} photo`} />
          </section>
          <section id="discussion" className="event-details-section">
            <h2>Discussions</h2>
            <p>Join the conversation with other attendees before the event.</p>
          </section>
          <div className="event-details-location" aria-label="Event location map">{event.location}</div>
        </section>

        <aside className="event-details-sidebar">
          <section><h2>Organiser</h2><p className="event-organiser-avatar">R</p><strong>Rototuna Alumni Team</strong><a href="mailto:alumni@rototuna.school.nz">Message organiser</a></section>
        </aside>
      </div>
    </main>
  );
}

export default EventDetailsPage;