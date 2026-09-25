const db = require("./db");

const Event = {};
const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80";

Event.findAll = (result) => {
  db.query(
    `UPDATE events SET active = CASE
       WHEN CURRENT_DATE < active_from OR (recurring AND CURRENT_DATE > active_to) THEN 0
       WHEN NOT recurring THEN 1
       WHEN recurrence_frequency = 'monthly' AND EXTRACT(DAY FROM CURRENT_DATE) = EXTRACT(DAY FROM active_from) THEN 1
       WHEN recurrence_frequency = 'yearly'
         AND EXTRACT(MONTH FROM CURRENT_DATE) = EXTRACT(MONTH FROM active_from)
         AND EXTRACT(DAY FROM CURRENT_DATE) = EXTRACT(DAY FROM active_from) THEN 1
       ELSE 0 END
     WHERE active IS DISTINCT FROM CASE
       WHEN CURRENT_DATE < active_from OR (recurring AND CURRENT_DATE > active_to) THEN 0
       WHEN NOT recurring THEN 1
       WHEN recurrence_frequency = 'monthly' AND EXTRACT(DAY FROM CURRENT_DATE) = EXTRACT(DAY FROM active_from) THEN 1
       WHEN recurrence_frequency = 'yearly'
         AND EXTRACT(MONTH FROM CURRENT_DATE) = EXTRACT(MONTH FROM active_from)
         AND EXTRACT(DAY FROM CURRENT_DATE) = EXTRACT(DAY FROM active_from) THEN 1
       ELSE 0 END`,
    (syncError) => {
      if (syncError) return result(syncError, null);
      db.query(
    `SELECT id, title, event_date AS date, active_from AS "activeFrom", active_to AS "activeTo", recurring, recurrence_frequency AS "recurrenceFrequency", start_time AS "startTime",
                end_time AS "endTime", location, description, price,
                COALESCE(image, $1) AS image,
                COALESCE(registration_counts.pending, 0) AS "pendingRegistrations",
                COALESCE(registration_counts.confirmed, 0) AS "confirmedRegistrations",
                COALESCE(registration_counts.cancelled, 0) AS "cancelledRegistrations",
                COALESCE(registration_counts.attended, 0) AS "attendedCount"
            FROM events
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*) FILTER (WHERE status = 'pending') AS pending,
         COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
         COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
         COUNT(*) FILTER (WHERE status = 'attending') AS attended
       FROM event_registrations
       WHERE event_id = events.id
     ) registration_counts ON TRUE
     WHERE events.active = 1
     ORDER BY event_date ASC, start_time ASC, id ASC`,
              [DEFAULT_EVENT_IMAGE],
              (err, res) => {
      if (err) {
        console.log("Event findAll error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
    },
      );
    },
  );
};

Event.create = (event, result) => {
  db.query(
    `INSERT INTO events
      (title, event_date, active_from, active_to, recurring, recurrence_frequency, active, start_time, end_time, location, description, price, image, created_by)
     VALUES ($1, $2, $3, $4, $5, $6::varchar(10), CASE WHEN CURRENT_DATE >= $3::date AND (NOT $5::boolean OR (CURRENT_DATE <= $4::date AND (($6::varchar(10) = 'monthly' AND EXTRACT(DAY FROM CURRENT_DATE) = EXTRACT(DAY FROM $3::date)) OR ($6::varchar(10) = 'yearly' AND TO_CHAR(CURRENT_DATE, 'MM-DD') = TO_CHAR($3::date, 'MM-DD'))))) THEN 1 ELSE 0 END, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id, title, event_date AS date, active_from AS "activeFrom", active_to AS "activeTo", recurring, recurrence_frequency AS "recurrenceFrequency", start_time AS "startTime",
               end_time AS "endTime", location, description, price, image`,
    [event.title, event.date, event.activeFrom, event.recurring ? event.activeTo : null, Boolean(event.recurring), event.recurrenceFrequency || "monthly", event.startTime, event.endTime, event.location, event.description, event.price || "Free", event.image || DEFAULT_EVENT_IMAGE, event.created_by],
    (err, res) => {
      if (err) {
        console.log("Event create error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows[0]);
    },
  );
};

Event.updateById = (id, event, result) => {
  db.query(
    `UPDATE events
     SET title = $1, event_date = $2, active_from = $3, active_to = $4, recurring = $5, recurrence_frequency = $6::varchar(10),
         active = CASE WHEN CURRENT_DATE >= $3::date AND (NOT $5::boolean OR (CURRENT_DATE <= $4::date AND (($6::varchar(10) = 'monthly' AND EXTRACT(DAY FROM CURRENT_DATE) = EXTRACT(DAY FROM $3::date)) OR ($6::varchar(10) = 'yearly' AND TO_CHAR(CURRENT_DATE, 'MM-DD') = TO_CHAR($3::date, 'MM-DD'))))) THEN 1 ELSE 0 END,
         start_time = $7, end_time = $8, location = $9, description = $10, price = $11, image = $12, updated_at = NOW()
     WHERE id = $13
     RETURNING id, title, event_date AS date, active_from AS "activeFrom", active_to AS "activeTo", recurring, recurrence_frequency AS "recurrenceFrequency", start_time AS "startTime",
               end_time AS "endTime", location, description, price, image`,
    [event.title, event.date, event.activeFrom, event.recurring ? event.activeTo : null, Boolean(event.recurring), event.recurrenceFrequency || "monthly", event.startTime, event.endTime, event.location, event.description, event.price || "Free", event.image || DEFAULT_EVENT_IMAGE, id],
    (err, res) => {
      if (err) {
        console.log("Event updateById error:", err);
        result(err, null);
        return;
      }

      if (res.rows.length === 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows[0]);
    },
  );
};

Event.updateImage = (id, imageUrl, result) => {
  db.query(
    `UPDATE events SET image = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, title, event_date AS date, active_from AS "activeFrom", active_to AS "activeTo", recurring, recurrence_frequency AS "recurrenceFrequency", start_time AS "startTime",
               end_time AS "endTime", location, description, price, image`,
    [imageUrl, id],
    (err, res) => {
      if (err) return result(err, null);
      if (!res.rows.length) return result({ kind: "not_found" }, null);
      result(null, res.rows[0]);
    },
  );
};

Event.join = (eventId, userId, result) => {
  db.query(
    `INSERT INTO event_registrations (event_id, user_id)
     SELECT $1, $2
     WHERE EXISTS (SELECT 1 FROM events WHERE id = $1)
     ON CONFLICT (event_id, user_id) DO NOTHING
    RETURNING id, event_id AS "eventId", user_id AS "userId", joined_at AS "joinedAt", status, attended`,
    [eventId, userId],
    (err, res) => {
      if (err) {
        result(err, null);
        return;
      }

      if (!res.rows.length) {
        db.query(
          `SELECT id, event_id AS "eventId", user_id AS "userId", joined_at AS "joinedAt", status, attended
           FROM event_registrations
           WHERE event_id = $1 AND user_id = $2`,
          [eventId, userId],
          (registrationErr, registrationRes) => {
          if (registrationErr) {
            result(registrationErr, null);
            return;
          }

          if (registrationRes.rows.length) {
            result(null, { alreadyJoined: true, registration: registrationRes.rows[0] });
            return;
          }

          db.query("SELECT id FROM events WHERE id = $1", [eventId], (eventErr, eventRes) => {
          if (eventErr) {
            result(eventErr, null);
          } else if (!eventRes.rows.length) {
            result({ kind: "event_not_found" }, null);
          } else {
            result({ kind: "registration_not_found" }, null);
          }
          });
        });
        return;
      }

      result(null, { alreadyJoined: false, registration: res.rows[0] });
    },
  );
};

Event.hasJoined = (eventId, userId, result) => {
  db.query(
    `SELECT id, joined_at AS "joinedAt", status, attended
     FROM event_registrations
     WHERE event_id = $1 AND user_id = $2`,
    [eventId, userId],
    (err, res) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res.rows[0] || null);
    },
  );
};

Event.updateRegistration = (registrationId, updates, result) => {
  db.query(
    `UPDATE event_registrations
     SET status = $1, attended = $2
     WHERE id = $3
     RETURNING id, event_id AS "eventId", user_id AS "userId", joined_at AS "joinedAt", status, attended`,
    [updates.status, updates.attended, registrationId],
    (err, res) => {
      if (err) {
        result(err, null);
        return;
      }

      if (!res.rows.length) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows[0]);
    },
  );
};

Event.getAttendees = (eventId, result) => {
  db.query(
    `SELECT r.id, r.event_id AS "eventId", r.joined_at AS "joinedAt", r.status, r.attended,
            u.id AS "userId", u.username,
            p.firstname, p.lastname, p.email
     FROM event_registrations r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN profile p ON p.user_id = u.id
     WHERE r.event_id = $1
     ORDER BY r.joined_at ASC`,
    [eventId],
    (err, res) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res.rows);
    },
  );
};

Event.getAllAttendees = (result) => {
  db.query(
    `SELECT e.id AS "eventId", e.title, e.event_date AS date,
            r.id AS "registrationId", r.joined_at AS "joinedAt", r.status, r.attended,
            u.id AS "userId", u.username,
            p.firstname, p.lastname, p.email
     FROM events e
     LEFT JOIN event_registrations r ON r.event_id = e.id
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN profile p ON p.user_id = u.id
     ORDER BY e.event_date ASC, e.id ASC, r.joined_at ASC`,
    (err, res) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res.rows);
    },
  );
};

module.exports = Event;
