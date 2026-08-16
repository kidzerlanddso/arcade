const db = require("./db");

const Project = function(profile) {
  this.firstname = profile.firstname;
  this.lastname = profile.lastname;
  this.email = profile.email;
  this.year = profile.year;
  this.student_id = profile.student_id;
  this.user_id = profile.user_id;
};

Project.getAll = (result) => {
  db.query("SELECT * FROM profile", (err, res) => {
    if (err) {
      console.log("GetAll error: ", err);
      result(err, null);
      return;
    }
    result(null, res.rows);
  });
};

Project.findById = (id, result) => {
  db.query("SELECT * FROM profile WHERE id = $1", [id], (err, res) => {
    if (err) {
      console.log("FindById error: ", err);
      result(err, null);
      return;
    }

    if (res.rows.length) {
      result(null, res.rows[0]);
      return;
    }

    result(null, null);
  });
};

Project.create = (newProfile, result) => {
  db.query(
    "INSERT INTO profile (firstname, lastname, email, year, student_id, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      newProfile.firstname,
      newProfile.lastname,
      newProfile.email,
      newProfile.year,
      newProfile.student_id,
      newProfile.user_id
    ],
    (err, res) => {
      if (err) {
        console.log("Create error: ", err);
        result(err, null);
        return;
      }
      result(null, res.rows[0]);
    }
  );
};

Project.findByName = (name, result) => {
  db.query(
    "SELECT * FROM profile WHERE firstname ILIKE $1 OR lastname ILIKE $2",
    [`%${name}%`, `%${name}%`],
    (err, res) => {
      if (err) {
        console.log("findByName error: ", err);
        result(err, null);
        return;
      }

      if (res.rows.length) {
        result(null, res.rows);
        return;
      }

      result(null, []);
    }
  );
};

Project.updateById = (id, profile, result) => {
  const entries = Object.entries(profile);
  const fields = entries.map(([key], index) => `${key} = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  values.push(id);

  db.query(
    `UPDATE profile SET ${fields.join(", ")} WHERE id = $${fields.length + 1} RETURNING *`,
    values,
    (err, res) => {
      if (err) {
        console.log("Error while Updating: ", err);
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

Project.deleteById = (id, result) => {
  db.query("UPDATE users SET active = 0 WHERE id = $1 RETURNING *", [id], (err, res) => {
    if (err) {
      console.log("Error while Deleting: ", err);
      result(err, null);
      return;
    }

    if (!res.rows.length) {
      result({ kind: "NO such ID found" }, null);
      return;
    }

    result(null, res.rows);
  });
};

module.exports = Project;