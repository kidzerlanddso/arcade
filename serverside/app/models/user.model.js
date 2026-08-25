const db = require("./db");

const User = function(user) {
  this.username = user.username;
  this.password = user.password;
  this.active = user.active !== undefined ? user.active : 2;
  this.admin = user.admin !== undefined ? Number(user.admin) : 0;
};

User.create = function(newUser, profileData, result) {
  if (typeof profileData === "function") {
    result = profileData;
    profileData = null;
  }

  db.query(
    "INSERT INTO users (username, password, active, admin) VALUES ($1, $2, $3, $4) RETURNING *",
    [newUser.username, newUser.password, newUser.active, newUser.admin],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      const createdUser = res.rows[0];

      if (!profileData) {
        result(null, createdUser);
        return;
      }

      const Profile = require("./profile.model");
      const profileRecord = {
        firstname: profileData.firstname || "",
        lastname: profileData.lastname || "",
        email: profileData.email || "",
        current_city: profileData.current_city || "Hamilton",
        current_country: profileData.current_country || "New Zealand",
        year: profileData.year || null,
        student_id: profileData.student_id || null,
        user_id: createdUser.id
      };

      Profile.create(profileRecord, function(profileErr, profileResult) {
        if (profileErr) {
          result(profileErr, null);
          return;
        }

        result(null, {
          user: createdUser,
          profile: profileResult
        });
      });
    }
  );
};

User.findByUsername = function(username, result) {
  db.query("SELECT * FROM users WHERE username = $1", [username], function(err, res) {
    if (err) {
      result(err, null);
      return;
    }
    if (res.rows.length) {
      result(null, res.rows[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

User.getByActive = function(activeValue, result) {
  db.query(
    `SELECT users.*, profile.firstname, profile.lastname, profile.year
     FROM users
     LEFT JOIN profile ON profile.user_id = users.id
     WHERE users.active = $1
     ORDER BY users.id DESC`,
    [activeValue],
    function(err, res) {
    if (err) {
      result(err, null);
      return;
    }

    result(null, res.rows);
    }
  );
};

User.approveById = function(userId, result) {
  db.query(
    "UPDATE users SET active = 1 WHERE id = $1 AND active = 2 RETURNING id, username, active",
    [userId],
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
User.findByLogin = function(login, result) {
  db.query("SELECT u.* FROM users u LEFT JOIN profile p ON p.user_id = u.id WHERE u.username = $1 OR p.email = $1 LIMIT 1", [login], function(err, res) {
    if (err) {
      result(err, null);
      return;
    }
    if (res.rows.length) {
      result(null, res.rows[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};
module.exports = User;
