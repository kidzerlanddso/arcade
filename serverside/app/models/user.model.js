const db = require("./db");

// Constructor
const User = function(user) {
  this.username = user.username;
  this.password = user.password;
  this.active = user.active !== undefined ? user.active : 1;
  this.admin = user.admin !== undefined ? Number(user.admin) : 0;
};

// Save a new user to the database and optionally create its profile row
User.create = function(newUser, profileData, result) {
  if (typeof profileData === "function") {
    result = profileData;
    profileData = null;
  }

  db.query("INSERT INTO users SET ?", newUser, function(err, res) {
    if (err) {
      result(err, null);
      return;
    }

    const createdUser = { id: res.insertId, ...newUser };

    if (!profileData) {
      result(null, createdUser);
      return;
    }

    const Profile = require("./profile.model");
    const profileRecord = {
      firstname: profileData.firstname || "",
      lastname: profileData.lastname || "",
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
  });
};

// Find a user by their username
User.findByUsername = function(username, result) {
  db.query("SELECT * FROM users WHERE username = ?", [username], function(err, res) {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

User.getByActive = function(activeValue, result) {
  db.query("SELECT * FROM users WHERE active = ? ORDER BY id DESC", [activeValue], function(err, res) {
    if (err) {
      result(err, null);
      return;
    }

    result(null, res);
  });
};

module.exports = User;
