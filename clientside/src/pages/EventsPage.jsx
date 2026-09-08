import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import EventDetailsModal from "../components/EventDetailsModal";
import api from "../api/axios";
import { formatEventDate, formatEventTime, toDateInputValue, toTimeInputValue } from "../data/events";

const getAdminStatus = () => localStorage.getItem("isAdmin") === "true";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("upcoming");
  const [isAdmin] = useState(getAdminStatus);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isCalendarViewMenuOpen, setIsCalendarViewMenuOpen] = useState(false);
  const [registeringEventId, setRegisteringEventId] = useState(null);
  const imageInputRef = useRef(null);
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

  useEffect(() => {
    api.get("/events")
      .then((response) => setEvents(response.data))
      .catch((error) => setErrorMessage(error.response?.data?.message || "Unable to load events."))
      .finally(() => setLoading(false));
  }, []);

  const handleNewEventChange = (event) => {
    const { name, value } = event.target;
    setNewEvent((current) => ({ ...current, [name]: value }));
  };

  const handleAddEvent = (event) => {
    event.preventDefault();
    const request = editingEventId === null
      ? api.post("/events", newEvent)
      : api.patch(`/events/${editingEventId}`, newEvent);

    request
      .then((response) => {
        setEvents((currentEvents) => editingEventId === null
          ? [...currentEvents, response.data]
          : currentEvents.map((currentEvent) => currentEvent.id === editingEventId ? response.data : currentEvent));
        setErrorMessage("");
      })
      .catch((error) => setErrorMessage(error.response?.data?.message || "Unable to save event."));
    setNewEvent({ ...newEvent, title: "", date: "", startTime: "", endTime: "", location: "", description: "" });
    setShowAddEvent(false);
    setEditingEventId(null);
  };

  const handleEditEvent = (event, clickEvent) => {
    clickEvent.stopPropagation();
    setNewEvent({
      ...event,
      date: toDateInputValue(event.date),
      startTime: toTimeInputValue(event.startTime),
      endTime: toTimeInputValue(event.endTime)
    });
    setEditingEventId(event.id);
    setShowAddEvent(true);
  };

  const handleRegister = async (event, clickEvent) => {
    clickEvent.stopPropagation();
    setRegisteringEventId(event.id);

    try {
      await api.post(`/events/${event.id}/join`);
      setEvents((currentEvents) => currentEvents.map((currentEvent) => (
        currentEvent.id === event.id ? { ...currentEvent, userJoined: true } : currentEvent
      )));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to register for event.");
    } finally {
      setRegisteringEventId(null);
    }
  };

  const visibleEvents = events.filter((event) => {
    const searchValue = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchValue || `${event.title} ${event.location}`.toLowerCase().includes(searchValue);
    const eventDate = new Date(event.date);
    const matchesFilter = eventFilter === "all" || (eventFilter === "upcoming" && eventDate >= new Date());
    return matchesSearch && matchesFilter;
  });

  const isCalendarView = searchParams.get("view") === "calendar";
  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const firstCalendarDay = new Date(calendarStart);
  firstCalendarDay.setDate(calendarStart.getDate() - calendarStart.getDay());
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstCalendarDay);
    day.setDate(firstCalendarDay.getDate() + index);
    return day;
  });
  const eventsByDate = visibleEvents.reduce((groups, event) => {
    const dateKey = toDateInputValue(event.date);
    groups[dateKey] = groups[dateKey] || [];
    groups[dateKey].push(event);
    return groups;
  }, {});

  const changeCalendarMonth = (offset) => {
    setCalendarMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isSameDate = (firstDate, secondDate) => firstDate.toDateString() === secondDate.toDateString();

  return (
    <div className="events-page-shell">
      <div className="events-tabs" role="tablist" aria-label="Event views">
        <Link className={`events-tab ${!isCalendarView ? "events-tab-active" : ""}`} to="/events" role="tab" aria-selected={!isCalendarView}>Event List</Link>
        <Link className={`events-tab ${isCalendarView ? "events-tab-active" : ""}`} to="/events?view=calendar" role="tab" aria-selected={isCalendarView}>Events Calendar</Link>
      </div>

      <div className="events-reference-actions">
        {isAdmin && (
          <button className="reference-action-button" type="button" onClick={() => setShowAddEvent((current) => !current)}>
            Create New Event
          </button>
        )}
      </div>

      <div className="events-page-header">
        <div>
          <Link className="events-back-link" to="/dashboard">Back</Link>
          <h1>Events list <span>— Upcoming, {events.length} events</span></h1>
        </div>
        <div className="events-header-actions">
          <span className="events-count">{events.length} events</span>
        </div>
      </div>

      {!isCalendarView && <div className="events-filter-bar">
        <label>Filter
          <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
            <option value="upcoming">Upcoming</option>
            <option value="all">All events</option>
          </select>
        </label>
        <label>Search
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search events" />
        </label>
        <span className="events-record-count">Records found: {visibleEvents.length}</span>
      </div>}

      {isAdmin && showAddEvent && (
        <form className="add-event-form" onSubmit={handleAddEvent}>
            <h2>{editingEventId === null ? "Add a Rototuna event" : "Edit event"}</h2>
          <div className="add-event-fields">
            <input name="title" value={newEvent.title} onChange={handleNewEventChange} placeholder="Event title" required />
            <input type="date" name="date" value={toDateInputValue(newEvent.date)} onChange={handleNewEventChange} required />
            <input type="time" name="startTime" value={toTimeInputValue(newEvent.startTime)} onChange={handleNewEventChange} required />
            <input type="time" name="endTime" value={toTimeInputValue(newEvent.endTime)} onChange={handleNewEventChange} required />
            <input name="location" value={newEvent.location} onChange={handleNewEventChange} placeholder="Rototuna location" required />
            <div className="event-image-field">
              <input ref={imageInputRef} name="image" type="url" value={newEvent.image} onChange={handleNewEventChange} placeholder="Photo URL" />
              <button
                className="event-image-edit-button"
                type="button"
                aria-label="Edit event image URL"
                title="Edit event image URL"
                onClick={() => imageInputRef.current?.focus()}
              >
                ✎
              </button>
            </div>
          </div>
          <textarea name="description" value={newEvent.description} onChange={handleNewEventChange} placeholder="Event description" rows="4" required />
          <div className="add-event-form-actions">
            <button className="primary-action" type="submit">Save event</button>
            <button
              className="secondary-action"
              type="button"
              onClick={() => {
                setShowAddEvent(false);
                setEditingEventId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading events...</p>}
      {errorMessage && <p className="events-error" role="alert">{errorMessage}</p>}

      {isCalendarView ? (
        <section className="events-calendar" aria-label="Events calendar">
          <div className="calendar-toolbar">
            <button type="button" className="calendar-today-button" onClick={() => setCalendarMonth(new Date())}>Today</button>
            <button type="button" className="calendar-nav-button" aria-label="Previous month" onClick={() => changeCalendarMonth(-1)}>‹</button>
            <button type="button" className="calendar-nav-button" aria-label="Next month" onClick={() => changeCalendarMonth(1)}>›</button>
            <div className="calendar-month-picker">
              <button
                type="button"
                className="calendar-month-selector"
                aria-expanded={isMonthPickerOpen}
                aria-haspopup="dialog"
                onClick={() => setIsMonthPickerOpen((isOpen) => !isOpen)}
              >
                <h2>{new Intl.DateTimeFormat("en-NZ", { month: "long", year: "numeric" }).format(calendarMonth)}</h2>
                <span className="calendar-month-arrow">⌄</span>
              </button>
              {isMonthPickerOpen && (
                <div className="calendar-month-picker-popup" role="dialog" aria-label="Choose calendar month">
                  <label htmlFor="calendar-month-input">Choose month</label>
                  <input
                    id="calendar-month-input"
                    type="month"
                    value={`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}`}
                    onChange={(event) => {
                      const [year, month] = event.target.value.split("-").map(Number);
                      setCalendarMonth(new Date(year, month - 1, 1));
                      setIsMonthPickerOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
            <span className="calendar-toolbar-spacer" />
            <div className="calendar-view-menu">
              <button
                type="button"
                className="calendar-view-button"
                aria-expanded={isCalendarViewMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsCalendarViewMenuOpen((isOpen) => !isOpen)}
              >
                Month <span>⌄</span>
              </button>
              {isCalendarViewMenuOpen && (
                <div className="calendar-view-menu-options" role="menu">
                  <button className="calendar-view-menu-option calendar-view-menu-option-active" type="button" role="menuitem" onClick={() => setIsCalendarViewMenuOpen(false)}>
                    Month
                  </button>
                  <button className="calendar-view-menu-option" type="button" role="menuitem" onClick={() => { navigate("/events"); setIsCalendarViewMenuOpen(false); }}>
                    Event list
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => <div className="calendar-weekday" key={dayName}>{dayName}</div>)}
            {calendarDays.map((day) => {
              const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
              const dayEvents = eventsByDate[dateKey] || [];
              const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
              return (
                <div className={`calendar-day ${isCurrentMonth ? "" : "calendar-day-muted"}`} key={dateKey}>
                  <span className={`calendar-day-number ${isSameDate(day, new Date()) ? "calendar-day-today" : ""}`}>{day.getDate()}</span>
                  <div className="calendar-day-events">
                    {dayEvents.map((event) => (
                        <button className="calendar-event" type="button" key={event.id} onClick={() => navigate(`/events/${event.id}`)} title={event.title}>
                        {event.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : <div className="events-list" role="table" aria-label="Events list">
        <div className="events-list-header" role="row">
          <span>Event name<br />Date, time, location</span>
          <span>Registration</span>
          <span>Registration types<br />(Pending + Confirmed = Total)</span>
          <span>Attendance</span>
          <span>Tags</span>
          <span></span>
        </div>
        {visibleEvents.map((event, index) => (
          <article className={`event-list-row ${index % 2 === 0 ? "event-list-row-tinted" : ""}`} key={event.id} role="row" onClick={() => setSelectedEvent(event)}>
            <div className="event-list-name">
              <Link to={`/events/${event.id}`} onClick={(clickEvent) => clickEvent.stopPropagation()}>{event.title}</Link>
              <strong>{formatEventDate(event.date)} · {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}</strong>
              <span>{event.location}</span>
            </div>
            <div><strong>Enabled</strong></div>
            <div>
              <strong>Total: {(event.pendingRegistrations || 0) + (event.confirmedRegistrations || 0)}</strong>
              <span>Pending: {event.pendingRegistrations || 0} · Confirmed: {event.confirmedRegistrations || 0}</span>
            </div>
            <div className="event-attendance">
              <strong>{event.attendedCount || 0}</strong>
              <span>Attended</span>
            </div>
            <div className="event-tags"><span>event</span><span>alumni</span></div>
            <div className="event-row-actions">
              {!isAdmin && (
                <button
                  className="event-register-button"
                  type="button"
                  disabled={event.userJoined || registeringEventId === event.id}
                  onClick={(clickEvent) => handleRegister(event, clickEvent)}
                >
                  {registeringEventId === event.id ? "Registering..." : event.userJoined ? "Registered" : "Register"}
                </button>
              )}
              {isAdmin && <button className="edit-event-button" type="button" onClick={(clickEvent) => handleEditEvent(event, clickEvent)}>Edit</button>}
            </div>
          </article>
        ))}
      </div>}

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default EventsPage;
