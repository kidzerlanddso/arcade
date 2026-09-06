const db = require("./db");

const Project = function (profile) {
  this.firstname = profile.firstname;
  this.lastname = profile.lastname;
  this.email = profile.email || "";
  this.current_city = profile.current_city || "Hamilton";
  this.current_country = profile.current_country || "New Zealand";
  this.year = profile.year;
  this.student_id = profile.student_id;
  this.user_id = profile.user_id;
  this.bio = profile.bio;
  this.linkedin_url = profile.linkedin_url;
  this.profile_image_url = profile.profile_image_url;
  this.mentorship_available = profile.mentorship_available ?? false;
  this.expertise = profile.expertise || "";
  this.mentorship_availability = profile.mentorship_availability || "";
};

Project.getAll = (result) => {
  db.query("SELECT * FROM profile p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN expertise e ON e.expertise_id = ANY(p.expertise_id) WHERE u.active = 1 AND u.admin = 0 ORDER BY p.firstname ASC", (err, res) => {
    if (err) {
      console.log("GetAll error: ", err);
      result(err, null);
      return;
    }

    result(null, res.rows);
  });
};

Project.findById = (id, result) => {
  db.query("SELECT * FROM profile p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN expertise e ON e.expertise_id = ANY(p.expertise_id) WHERE p.id = $1 AND u.active = 1 ", [id], (err, res) => {
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
    }
  );
};

Project.findByUserId = (userId, result) => {
  db.query(
    `SELECT p.*, u."enableEmail" AS "enableEmail"
     FROM profile p
     INNER JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1 AND u.active = 1
     LIMIT 1`,
    [userId],
    (err, res) => {
      if (err) {
        console.log("FindByUserId error: ", err);
        result(err, null);
        return;
      }

      result(null, res.rows[0] || null);
    }
  );
};

Project.create = (newProfile, result) => {
  db.query(
    `INSERT INTO profile (
      firstname,
      lastname,
      email,
      current_city,
      current_country,
      year,
      student_id,
      user_id,
      bio,
      linkedin_url,
      profile_image_url,
      mentorship_available,
      expertise,
      mentorship_availability
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14
    )
    RETURNING *`,
    [
      newProfile.firstname,
      newProfile.lastname,
      newProfile.email || "",
      newProfile.current_city || "Hamilton",
      newProfile.current_country || "New Zealand",
      newProfile.year,
      newProfile.student_id,
      newProfile.user_id,
      newProfile.bio,
      newProfile.linkedin_url,
      newProfile.profile_image_url,
      newProfile.mentorship_available ?? false,
      newProfile.expertise || "",
      newProfile.mentorship_availability || "",
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

Project.updateById = (id, profile, userId, result) => {
  const entries = Object.entries(profile);
  const fields = entries.map(([key], index) => `${key} = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  values.push(id);
  values.push(userId);

  db.query(
    `UPDATE profile SET ${fields.join(", ")} WHERE id = $${fields.length + 1}
     AND user_id = $${fields.length + 2} RETURNING *`,
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
