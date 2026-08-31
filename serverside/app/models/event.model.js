const db = require("./db");

const Event = {};

Event.findAll = (result) => {
  db.query(
    `SELECT id, title, event_date AS date, start_time AS "startTime",
            end_time AS "endTime", location, description, price, image
     FROM events
     ORDER BY event_date ASC, start_time ASC, id ASC`,
    (err, res) => {
      if (err) {
        console.log("Event findAll error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
    },
  );
};

Event.create = (event, result) => {
  db.query(
    `INSERT INTO events
      (title, event_date, start_time, end_time, location, description, price, image, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, title, event_date AS date, start_time AS "startTime",
               end_time AS "endTime", location, description, price, image`,
    [event.title, event.date, event.startTime, event.endTime, event.location, event.description, event.price, event.image, event.created_by],
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
     SET title = $1, event_date = $2, start_time = $3, end_time = $4,
         location = $5, description = $6, price = $7, image = $8, updated_at = NOW()
     WHERE id = $9
     RETURNING id, title, event_date AS date, start_time AS "startTime",
               end_time AS "endTime", location, description, price, image`,
    [event.title, event.date, event.startTime, event.endTime, event.location, event.description, event.price, event.image, id],
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

module.exports = Event;
