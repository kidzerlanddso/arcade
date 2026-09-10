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
  this.mentorship_availability = profile.mentorship_availability || "";
};

Project.getAll = (result) => {
  // Use p.* so profile.id is not overwritten by users.id from JOIN
  db.query(
    `SELECT 
    p.*,
    u."enableEmail",

    COALESCE(
        (
            SELECT json_agg(
                json_build_object(
                    'id', e.expertise_id,
                    'name', e.expertise,
                    'subcategories',
                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'id', es.subcategory_id,
                                    'name', es.subcategory
                                )
                                ORDER BY es.subcategory_id
                            )
                            FROM expertise_subcategory es
                            WHERE es.subcategory_id = ANY(p.subcategory_id) AND es.expertise_id = e.expertise_id
                        ),
                        '[]'::json
                    )
                )
                ORDER BY e.expertise_id
            )
            FROM expertise e
            WHERE e.expertise_id = ANY(p.expertise_id)
        ),
        '[]'::json
          ) AS expertise

      FROM profile p
      LEFT JOIN users u 
          ON p.user_id = u.id
      WHERE u.active = 1 
    AND u.admin = 0;`,
    (err, res) => {
      if (err) {
        console.log("GetAll error: ", err);
        result(err, null);
        return;
      }
      result(null, res.rows);
    })

  
};



Project.findById = (id, result) => {
  // Use p.* so profile.id is not overwritten by users.id from JOIN
  db.query(
    `SELECT p.*, u."enableEmail" AS "enableEmail"
     FROM profile p
     LEFT JOIN users u ON p.user_id = u.id
     LEFT JOIN expertise e ON e.expertise_id = ANY(p.expertise_id)
     WHERE p.id = $1 AND u.active = 1
     LIMIT 1`,
    [id],
    (err, res) => {
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
  // Do not insert removed column "expertise" (now linked via expertise_id array)
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
      mentorship_availability
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13
    )
    RETURNING *`,
    [
      newProfile.firstname || "",
      newProfile.lastname || "",
      newProfile.email || "",
      newProfile.current_city || "Hamilton",
      newProfile.current_country || "New Zealand",
      newProfile.year || null,
      newProfile.student_id || null,
      newProfile.user_id,
      newProfile.bio || null,
      newProfile.linkedin_url || null,
      newProfile.profile_image_url || null,
      newProfile.mentorship_available ?? false,
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
Project.getExpertise = (result) => {
  db.query(
    "SELECT expertise_id, expertise FROM expertise ORDER BY expertise ASC",
    (err, res) => {
      if (err) {
        console.log("Error while getting expertise:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
    }
  );
};
Project.getExpertiseSubcategories = (expertiseId, result) => {
  db.query(
    "SELECT subcategory_id, expertise_id, subcategory FROM expertise_subcategory WHERE expertise_id = $1 ORDER BY subcategory ASC",
    [expertiseId],
    (err, res) => {
      if (err) {
        console.log("Error while getting expertise subcategories:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
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
