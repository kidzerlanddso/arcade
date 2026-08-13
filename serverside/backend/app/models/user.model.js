const db = require("./db");

// Constructor
const User = function(user) {
  this.username = user.username;
  this.password = user.password;
};

// Save a new user to the database
User.create = function(newUser, result) {
  db.query("INSERT INTO users SET ?", newUser, function(err, res) {
    if (err) {
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newUser });
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

module.exports = User;
