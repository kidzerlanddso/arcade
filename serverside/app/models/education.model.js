const db = require("./db");

const Education = function (education) {
  this.user_id = education.user_id;
  this.institution = education.institution;
  this.qualification = education.qualification;
  this.field_of_study = education.field_of_study;
  this.start_date = education.start_date;
  this.end_date = education.end_date;
  this.description = education.description;
};

Education.findByUserId = (userId, result) => {
  db.query(
    "SELECT * FROM education WHERE user_id = $1 ORDER BY start_date DESC",
    [userId],
    (err, res) => {
      if (err) {
        console.log("Education findByUserId error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
    }
  );
};



Education.create = (newEducation, result) => {
  db.query(
    `INSERT INTO education
      (
        user_id,
        institution,
        qualification,
        field_of_study,
        start_date,
        end_date,
        description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
    [
      newEducation.user_id,
      newEducation.institution,
      newEducation.qualification,
      newEducation.field_of_study,
      newEducation.start_date,
      newEducation.end_date,
      newEducation.description
    ],
    (err, res) => {
      if (err) {
        console.log("Education create error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};

Education.deleteById = (id, result) => {
  db.query(
    "DELETE FROM education WHERE id = $1 RETURNING *",
    [id],
    (err, res) => {
      if (err) {
        console.log("Education deleteById error:", err);
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

module.exports = Education;