const db = require("./db");

const Employment = function (employment) {
  this.user_id = employment.user_id;
  this.company = employment.company;
  this.job_title = employment.job_title;
  this.start_date = employment.start_date;
  this.end_date = employment.end_date;
  this.description = employment.description;
};

Employment.findByUserId = (userId, result) => {
  db.query(
    "SELECT * FROM employment WHERE user_id = $1 ORDER BY start_date DESC",
    [userId],
    (err, res) => {
      if (err) {
        console.log("Employment findByUserId error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows);
    }
  );
};

Employment.create = (newEmployment, result) => {
  db.query(
    `INSERT INTO employment
      (user_id, company, job_title, start_date, end_date, description, active)
     VALUES ($1, $2, $3, $4, $5, $6, 2)
     RETURNING *`,
    [
      newEmployment.user_id,
      newEmployment.company,
      newEmployment.job_title,
      newEmployment.start_date,
      newEmployment.end_date,
      newEmployment.description
    ],
    (err, res) => {
      if (err) {
        console.log("Employment create error:", err);
        result(err, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};
Employment.deleteById = (id, result) => {
  db.query(
    "DELETE FROM employment WHERE id = $1 RETURNING *",
    [id],
    (err, res) => {
      if (err) {
        console.log("Employment deleteById error:", err);
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
module.exports = Employment;