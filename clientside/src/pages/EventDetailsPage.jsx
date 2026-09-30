import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { formatEventDate, formatEventTimeRange } from "../data/events";

function getAdminStatus() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload.admin === true || Number(payload.admin) === 1;
  } catch {
    return false;
  }
}

function EventDetailsPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSection, setActiveSection] = useState("about");
  const [isJoined, setIsJoined] = useState(false);
  const [isCheckingJoinStatus, setIsCheckingJoinStatus] = useState(true);
  const [joinedAt, setJoinedAt] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [joinError, setJoinError] = useState("");
  const [photoStatus, setPhotoStatus] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy link");
  const isAdmin = getAdminStatus();

  useEffect(() => {
    api
      .get("/events")
      .then((response) => {
        const selectedEvent = response.data.find(
          (item) => String(item.id) === eventId,
        );
        if (!selectedEvent) {
          setErrorMessage("Event not found.");
          return;
        }
        setEvent(selectedEvent);
        setIsJoined(Boolean(selectedEvent.userJoined));
      })
      .catch((error) =>
        setErrorMessage(
          error.response?.data?.message || "Unable to load event.",
        ),
      );
  }, [eventId]);

  useEffect(() => {
    if (!event) return;

    setIsCheckingJoinStatus(true);
    api
      .get(`/events/${event.id}/join-status`)
      .then((response) => {
        setIsJoined(Boolean(response.data?.joined));
        setJoinedAt(response.data?.joinedAt || null);
      })
      .catch(() => {
        setIsJoined(false);
        setJoinError("Unable to load your event registration status.");
      })
      .finally(() => setIsCheckingJoinStatus(false));
  }, [event]);

  useEffect(() => {
    if (!event || !isAdmin) return;

    api
      .get(`/events/${event.id}/attendees`)
      .then((response) => setAttendees(response.data || []))
      .catch((error) =>
        setJoinError(
          error.response?.data?.message || "Unable to load attendees.",
        ),
      );
  }, [event, isAdmin]);

  if (errorMessage) {
    return (
      <main className="event-details-page">
        <p className="events-error">{errorMessage}</p>
        <Link to="/events">Back to events</Link>
      </main>
    );
  }

  if (!event)
    return (
      <main className="event-details-page">
        <p>Loading event...</p>
      </main>
    );

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
    document
      .getElementById(section)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleJoin = async () => {
    setJoinError("");
    try {
      const response = await api.post(`/events/${event.id}/join`);
      setIsJoined(true);
      setJoinedAt(
        response.data.registration?.joinedAt || new Date().toISOString(),
      );
    } catch (error) {
      setJoinError(error.response?.data?.message || "Unable to join event.");
    }
  };

  const handlePhotoChange = async (photoEvent) => {
    const photoFile = photoEvent.target.files?.[0];
    photoEvent.target.value = "";
    if (!photoFile) return;

    setPhotoStatus("");
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("eventImage", photoFile);
      const response = await api.post(`/events/${event.id}/image`, formData);
      setEvent(response.data);
      setPhotoStatus("Photo updated.");
    } catch (error) {
      setPhotoStatus(
        error.response?.data?.message ||
          `Unable to update photo (${error.response?.status || "network error"}).`,
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleExportAttendees = async () => {
    try {
      const response = await api.get(`/events/${event.id}/attendees/export`, {
        responseType: "blob",
      });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${event.title}-registrations.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      let message = "Unable to export registrations.";
      const errorData = error.response?.data;
      if (errorData instanceof Blob) {
        try {
          message = JSON.parse(await errorData.text())?.message || message;
        } catch {
          // response body was not JSON, keep the default message
        }
      } else if (errorData?.message) {
        message = errorData.message;
      }
      setJoinError(message);
    }
  };

  return (
    <main className="event-details-page">
      <Link className="event-details-back" to="/events">
        Back to events
      </Link>
      <section className="event-details-hero">
        <div className="event-details-hero-image-wrap">
          <div
            className="event-details-hero-image"
            style={{ backgroundImage: `url(${event.image})` }}
          />
          {isAdmin && (
            <>
              <label
                className="event-hero-edit-button"
                htmlFor="event-hero-photo"
              >
                {isUploadingPhoto ? "Uploading..." : "Edit photo"}
              </label>
              <input
                id="event-hero-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                hidden
                disabled={isUploadingPhoto}
              />
              {photoStatus && (
                <p className="event-hero-photo-status" role="status">
                  {photoStatus}
                </p>
              )}
            </>
          )}
        </div>
        <div className="event-details-summary">
          <h1>{event.title}</h1>
          <p className="event-details-rating">
            ★★★★★ <span>Community event</span>
          </p>
          <p className="event-details-meta">⌖ {event.location}</p>
          <p className="event-details-meta">
            ◷ {formatEventDate(event.date)} ·{" "}
            {formatEventTimeRange(event.startTime, event.endTime)}
          </p>
          <div className="event-details-share">
            <span>Share</span>
            <button type="button" onClick={handleCopyLink}>
              {copyStatus}
            </button>
          </div>
        </div>
      </section>

      <nav className="event-details-tabs" aria-label="Event details sections">
        {["about", "details"].map((section) => (
          <button
            className={
              activeSection === section ? "event-details-tab-active" : ""
            }
            type="button"
            key={section}
            onClick={() => handleSectionChange(section)}
          >
            {section === "about" ? "✦" : section === "details" ? "▣" : "☷"}
            <span>
              {section === "discussion"
                ? "Discussions"
                : section[0].toUpperCase() + section.slice(1)}
            </span>
          </button>
        ))}
        {!isAdmin && (
          <div className="event-join-action">
            <button
              type="button"
              onClick={handleJoin}
              disabled={isCheckingJoinStatus || isJoined}
            >
              {isCheckingJoinStatus
                ? "Checking..."
                : isJoined
                  ? "Joined"
                  : "Join this event"}
            </button>
            {isJoined && joinedAt && (
              <span role="status">
                Joined on {new Date(joinedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </nav>

      <div className="event-details-content">
        <section className="event-details-copy" id="about">
          <h2>About this event</h2>
          <p>{event.description}</p>
          <p id="details">
            Join fellow Rototuna alumni and community members for an inclusive
            event with time to connect, learn, and enjoy the school community.
          </p>
          <h2>Details</h2>
          <dl className="event-details-facts">
            <div>
              <dt>Date</dt>
              <dd>{formatEventDate(event.date)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatEventTimeRange(event.startTime, event.endTime)}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{event.location}</dd>
            </div>
          </dl>
          {/*<section id="discussion" className="event-details-section">
            <h2>Discussions</h2>
            <p>Join the conversation with other attendees before the event.</p>
          </section>*/}
          {isAdmin && (
            <section
              className="event-details-section"
              aria-label="Event attendees"
            >
              <h2>Joined attendees ({attendees.length})</h2>
              {attendees.length > 0 && (
                <button
                  type="button"
                  className="event-export-button"
                  onClick={handleExportAttendees}
                >
                  Export registrations (Excel)
                </button>
              )}
              {attendees.length === 0 ? (
                <p>No users have joined this event.</p>
              ) : (
                <ul className="event-attendee-list">
                  {attendees.map((attendee) => (
                    <li key={attendee.id}>
                      <strong>
                        {[attendee.firstname, attendee.lastname]
                          .filter(Boolean)
                          .join(" ") || attendee.username}
                      </strong>
                      <span>{attendee.email || attendee.username}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {joinError && (
            <p className="events-error" role="alert">
              {joinError}
            </p>
          )}
          <div
            className="event-details-location"
            aria-label="Event location map"
          >
            {event.location}
          </div>
        </section>

        {!isAdmin && (
          <aside className="event-details-sidebar">
            <section>
              <h2>Organiser</h2>
              <p className="event-organiser-avatar">R</p>
              <strong>Rototuna Alumni Team</strong>
              <a
                className="event-organiser-button"
                href="mailto:alumni@rototuna.school.nz"
              >
                Contact organiser
              </a>
            </section>
          </aside>
        )}
      </div>
    </main>
  );
}

export default EventDetailsPage;
