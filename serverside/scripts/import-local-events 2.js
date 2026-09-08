const path = require("path");
const { pathToFileURL } = require("url");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80";

const parseEventDate = (value) => {
  if (!value) return null;

  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return null;
};

const parseEventTime = (value) => {
  if (!value) return "00:00:00";

  const raw = String(value).trim();
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [hours, minutes] = raw.split(":").map(Number);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  }

  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = Number(match[1]);
    const minutes = String(match[2]).padStart(2, "0");
    const period = match[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}:00`;
  }

  return "00:00:00";
};

const normalizeEvent = (event) => ({
  id: event.id,
  title: event.title,
  event_date: parseEventDate(event.date),
  start_time: parseEventTime(event.startTime),
  end_time: parseEventTime(event.endTime),
  location: event.location,
  description: event.description,
  price: event.price || "Free",
  image: event.image || DEFAULT_EVENT_IMAGE,
});

async function importEvents() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const table = process.env.SUPABASE_EVENTS_TABLE || "events";

  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in serverside/.env.",
    );
  }

  const eventsFile = path.resolve(__dirname, "../../clientside/src/data/events.js");
  const module = await import(pathToFileURL(eventsFile).href);
  const localEvents = module.defaultEvents || module.default || [];

  const rows = localEvents.map(normalizeEvent).filter((event) => event.event_date);

  if (rows.length === 0) {
    console.log("No valid local events found to import.");
    return;
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: "id", returning: "representation" })
    .select();

  if (error) {
    throw error;
  }

  const importedCount = Array.isArray(data) ? data.length : rows.length;
  console.log(`Imported ${importedCount} events into Supabase table "${table}".`);
}

importEvents()
  .then(() => {
    console.log("Event import completed.");
  })
  .catch((error) => {
    console.error("Event import failed:", error.message || error);
    process.exit(1);
  });
