const db = require("./db");

const Connection = function (connection) {
  this.requester_id = connection.requester_id;
  this.receiver_id = connection.receiver_id;
  this.status = connection.status || "pending";
};

// Send a connection request
Connection.create = (newConnection, result) => {
  db.query(
    `INSERT INTO connection (requester_id, receiver_id, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [
      newConnection.requester_id,
      newConnection.receiver_id,
      newConnection.status || "pending",
    ],
    (err, res) => {
      if (err) {
        console.log("Connection create error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};

// Find one record by id
Connection.findById = (id, result) => {
  db.query(
    "SELECT * FROM connection WHERE id = $1",
    [id],
    (err, res) => {
      if (err) {
        console.log("Connection findById error:", err);
        result(err, null);
        return;
      }

      if (res.rows.length === 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};

// Find existing record between two users (A->B or B->A)
Connection.findBetweenUsers = (userIdA, userIdB, result) => {
  db.query(
    `SELECT *
     FROM connection
     WHERE (requester_id = $1 AND receiver_id = $2)
        OR (requester_id = $2 AND receiver_id = $1)
     LIMIT 1`,
    [userIdA, userIdB],
    (err, res) => {
      if (err) {
        console.log("Connection findBetweenUsers error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows[0] || null);
    }
  );
};

// Accepted connections with the other user's profile info
Connection.findAcceptedByUserId = (userId, result) => {
  db.query(
    `SELECT
       c.*,
       CASE
         WHEN c.requester_id = $1 THEN c.receiver_id
         ELSE c.requester_id
       END AS other_user_id,
       p.id AS profile_id,
       p.firstname,
       p.lastname,
       p.profile_image_url,
       p.current_city,
       p.current_country
     FROM connection c
     JOIN profile p ON p.user_id = CASE
       WHEN c.requester_id = $1 THEN c.receiver_id
       ELSE c.requester_id
     END
     WHERE (c.requester_id = $1 OR c.receiver_id = $1)
       AND c.status = 'accepted'
     ORDER BY c.updated_at DESC`,
    [userId],
    (err, res) => {
      if (err) {
        console.log("Connection findAcceptedByUserId error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
    }
  );
};

// Pending requests I sent
Connection.findPendingSentByUserId = (userId, result) => {
  db.query(
    `SELECT
       c.*,
       c.receiver_id AS other_user_id,
       p.id AS profile_id,
       p.firstname,
       p.lastname,
       p.profile_image_url,
       p.current_city,
       p.current_country
     FROM connection c
     JOIN profile p ON p.user_id = c.receiver_id
     WHERE c.requester_id = $1
       AND c.status = 'pending'
     ORDER BY c.created_at DESC`,
    [userId],
    (err, res) => {
      if (err) {
        console.log("Connection findPendingSentByUserId error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
    }
  );
};

// Pending requests I received
Connection.findPendingReceivedByUserId = (userId, result) => {
  db.query(
    `SELECT
       c.*,
       c.requester_id AS other_user_id,
       p.id AS profile_id,
       p.firstname,
       p.lastname,
       p.profile_image_url,
       p.current_city,
       p.current_country
     FROM connection c
     JOIN profile p ON p.user_id = c.requester_id
     WHERE c.receiver_id = $1
       AND c.status = 'pending'
     ORDER BY c.created_at DESC`,
    [userId],
    (err, res) => {
      if (err) {
        console.log("Connection findPendingReceivedByUserId error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
    }
  );
};

// Update connection status
Connection.updateStatus = (id, status, result) => {
  db.query(
    `UPDATE connection
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id],
    (err, res) => {
      if (err) {
        console.log("Connection updateStatus error:", err);
        result(err, null);
        return;
      }

      if (res.rows.length === 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};

module.exports = Connection;