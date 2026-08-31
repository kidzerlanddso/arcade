import { formatEventDate, formatEventTime } from "../data/events";

function EventDetailsModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <section
        className="event-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <button
          className="event-modal-close"
          type="button"
          aria-label="Close event details"
          onClick={onClose}
        >
          x
        </button>
        <div
          className="event-modal-image"
          style={{ backgroundImage: `url(${event.image})` }}
        />
        <div className="event-modal-content">
          <span className="event-badge">{event.price}</span>
          <h2 id="event-modal-title">{event.title}</h2>
          <p className="event-modal-description">{event.description}</p>
          <dl className="event-details-list">
            <div>
              <dt>Date</dt>
              <dd>{formatEventDate(event.date)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatEventTime(event.startTime)} - {formatEventTime(event.endTime)} NZST</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{event.location}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}

export default EventDetailsModal;
