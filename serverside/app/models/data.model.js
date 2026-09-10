const db = require("./db");

const Data = function(user) {
  this.username = user.username;
  this.password = user.password;
  this.active = user.active !== undefined ? user.active : 2;
  this.admin = user.admin !== undefined ? Number(user.admin) : 0;
  this.enableEmail = user.enableEmail !== undefined ? Number(user.enableEmail) : 0;
};

const normalizeSubcategories = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

Data.getDynamicData = function(result) {
  db.query(
    `SELECT e.expertise_id, e.expertise,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'subcategory_id', es.subcategory_id,
              'expertise_id', es.expertise_id,
              'subcategory', es.subcategory
            ) ORDER BY es.subcategory ASC
          )
          FROM expertise_subcategory es
          WHERE es.expertise_id = e.expertise_id
        ),
        '[]'::json
      ) AS subcategories
     FROM expertise e
     ORDER BY e.expertise ASC`,
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      const normalized = (res.rows || []).map((row) => ({
        id: row.expertise_id,
        expertise_id: row.expertise_id,
        expertise: row.expertise,
        name: row.expertise,
        subcategories: normalizeSubcategories(row.subcategories)
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
        name: row.expertise,
        subcategories: []
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
        name: row.expertise,
        subcategories: []
      });
    }
  );
};

Data.getExpertiseSubcategories = function(expertiseId, result) {
  db.query(
    "SELECT subcategory_id, expertise_id, subcategory FROM expertise_subcategory WHERE expertise_id = $1 ORDER BY subcategory ASC",
    [expertiseId],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res.rows || []);
    }
  );
};

Data.createExpertiseSubcategory = function(expertiseId, subcategory, result) {
  db.query(
    "INSERT INTO expertise_subcategory (expertise_id, subcategory) VALUES ($1, $2) RETURNING *",
    [expertiseId, subcategory],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      if (!res.rows.length) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};

Data.updateExpertiseSubcategory = function(subcategoryId, subcategory, result) {
  db.query(
    "UPDATE expertise_subcategory SET subcategory = $1 WHERE subcategory_id = $2 RETURNING *",
    [subcategory, subcategoryId],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      if (!res.rows.length) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};

Data.deleteExpertiseSubcategory = function(subcategoryId, result) {
  db.query(
    "DELETE FROM expertise_subcategory WHERE subcategory_id = $1 RETURNING *",
    [subcategoryId],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      if (!res.rows.length) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows[0]);
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
