const db = require("./db");

const Data = function(user) {
  this.username = user.username;
  this.password = user.password;
  this.active = user.active !== undefined ? user.active : 2;
  this.admin = user.admin !== undefined ? Number(user.admin) : 0;
  this.enableEmail = user.enableEmail !== undefined ? Number(user.enableEmail) : 0;
};

Data.getDynamicData = function(result) {
  db.query(
    `SELECT *
     FROM expertise `,
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      const normalized = (res.rows || []).map((row) => ({
        id: row.expertise_id,
        expertise_id: row.expertise_id,
        expertise: row.expertise,
        name: row.expertise
      }));

      result(null, normalized);
    }
  );
};

Data.addExpertise = function(expertise, result) {
  db.query(
    "INSERT INTO expertise (expertise) VALUES ($1) RETURNING *",
    [expertise],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      const normalized = (res.rows || []).map((row) => ({
        id: row.expertise_id,
        expertise_id: row.expertise_id,
        expertise: row.expertise,
        name: row.expertise
      }));

      result(null, normalized);
    }
  );
};

Data.updateExpertise = function(expertiseId, expertise, result) {
  db.query(
    "UPDATE expertise SET expertise = $1 WHERE expertise_id = $2 RETURNING *",
    [expertise, expertiseId],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      if (!res.rows.length) {
        result({ kind: "not_found" }, null);
        return;
      }

      const row = res.rows[0];
      result(null, {
        id: row.expertise_id,
        expertise_id: row.expertise_id,
        expertise: row.expertise,
        name: row.expertise
      });
    }
  );
};

Data.deleteDynamicData = function(expertiseName, result) {
  db.query(
    "DELETE FROM expertise WHERE expertise_id = $1 RETURNING *",
    [expertiseName],
    function(err, res) {
      if (err) {
        console.log("Error while deleting expertise:", err);
        result(err, null);
        return;
      }

      if (!res.rows.length) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows);
    }
  );
};

module.exports = Data;
