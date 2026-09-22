export const defaultEvents = [
  {
    id: 1,
    price: "Free",
    title: "Rototuna School Community Market",
    date: "Saturday, August 22, 2026",
    startTime: "9:00 AM",
    endTime: "1:00 PM",
    location: "Rototuna High School Atrium",
    description: "A school-based market with student projects, food stalls, music, and family activities.",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    price: "Free",
    title: "Rototuna Alumni Networking Evening",
    date: "Friday, August 28, 2026",
    startTime: "6:00 PM",
    endTime: "9:00 PM",
    location: "Rototuna High School Hall",
    description: "Reconnect with classmates, meet recent graduates, and share career stories inside the school hall.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    price: "Free",
    title: "Rototuna School Wellness Session",
    date: "Tuesday, September 1, 2026",
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    location: "Rototuna High School Gymnasium",
    description: "A relaxed indoor wellness session with stretching, movement, and wellbeing activities.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    price: "$10",
    title: "Rototuna School Sports Day",
    date: "Saturday, September 5, 2026",
    startTime: "10:00 AM",
    endTime: "3:00 PM",
    location: "Rototuna Junior High School Indoor Courts",
    description: "A friendly indoor day of games, team challenges, and school sports activities.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 5,
    price: "Free",
    title: "Rototuna Alumni Career Mentoring Workshop",
    date: "Wednesday, September 9, 2026",
    startTime: "5:30 PM",
    endTime: "7:30 PM",
    location: "Rototuna High School Library",
    description: "Practical CV, interview, and career advice from Rototuna alumni and school mentors.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 6,
    price: "Free",
    title: "Rototuna Spring Community Cleanup",
    date: "Saturday, September 12, 2026",
    startTime: "9:30 AM",
    endTime: "12:00 PM",
    location: "Rototuna High School Courtyard",
    description: "Help prepare the school courtyard and gardens, followed by morning tea in the staffroom.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 7,
    price: "$5",
    title: "Rototuna School Cultural Food Festival",
    date: "Sunday, September 20, 2026",
    startTime: "11:00 AM",
    endTime: "4:00 PM",
    location: "Rototuna High School Dining Hall",
    description: "Taste dishes from around the world and enjoy live performances from Rototuna school groups.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 8,
    price: "Free",
    title: "Rototuna Alumni Reunion 2026",
    date: "Friday, September 25, 2026",
    startTime: "6:00 PM",
    endTime: "10:00 PM",
    location: "Rototuna High School Hall",
    description: "An evening of reunion, networking, and school community updates inside Rototuna High School.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
  }
];

const storedEventsKey = "rototuna-events";

export const toDateInputValue = (value) => String(value || "").slice(0, 10);

export const toTimeInputValue = (value) => String(value || "").slice(0, 5);

export const formatEventDate = (value) => {
  if (!value) return "Date to be confirmed";

  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(dateValue.getTime())) return "Date to be confirmed";

  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(dateValue);
};

export const formatEventTime = (value) => {
  if (!value) return "Time to be confirmed";

  const timeValue = String(value).trim();
  const match = timeValue.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*([AP]M))?$/i);
  if (!match) return "Time to be confirmed";

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const inputPeriod = match[3]?.toUpperCase();
  if (inputPeriod === "PM" && hours < 12) hours += 12;
  if (inputPeriod === "AM" && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return "Time to be confirmed";

  const period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${period}`;
};

export const formatEventTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return "Time to be confirmed";

  return `${formatEventTime(startTime)} - ${formatEventTime(endTime)}`;
};

export const getEvents = () => {
  try {
    const storedEvents = JSON.parse(localStorage.getItem(storedEventsKey) || "[]");
    const storedById = new Map(storedEvents.map((event) => [event.id, event]));
    return defaultEvents.map((event) => storedById.get(event.id) || event)
      .concat(storedEvents.filter((event) => !defaultEvents.some((defaultEvent) => defaultEvent.id === event.id)));
  } catch {
    return defaultEvents;
  }
};

export const saveEvent = (event) => {
  const storedEvents = JSON.parse(localStorage.getItem(storedEventsKey) || "[]");
  const existingIndex = storedEvents.findIndex((storedEvent) => storedEvent.id === event.id);

  if (existingIndex === -1) {
    storedEvents.push(event);
  } else {
    storedEvents[existingIndex] = event;
  }

  localStorage.setItem(storedEventsKey, JSON.stringify(storedEvents));
};

export const updateEvent = saveEvent;

export default defaultEvents;
