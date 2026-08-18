const db = require("./db");

const User = function (user) {
  this.username = user.username;
  this.password = user.password;
  this.active = user.active !== undefined ? Number(user.active) : 1;
  this.admin = user.admin !== undefined ? Number(user.admin) : 0;
  this.approved_date =
    user.approved_date || new Date().toISOString().slice(0, 10);
  this.connect = user.connect !== undefined ? Number(user.connect) : 0;
};

User.create = function (newUser, profileData, result) {
  if (typeof profileData === "function") {
    result = profileData;
    profileData = null;
  }

  db.connect(function (connectErr, client, release) {
    if (connectErr) {
      result(connectErr, null);
      return;
    }

    client.query("BEGIN", function (beginErr) {
      if (beginErr) {
        release();
        result(beginErr, null);
        return;
      }

      client.query(
        "INSERT INTO users (username, password, active, admin, approved_date, connect) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          newUser.username,
          newUser.password,
          newUser.active,
          newUser.admin,
          newUser.approved_date,
          newUser.connect,
        ],
        function (userErr, userRes) {
          if (userErr) {
            client.query("ROLLBACK", function () {
              release();
              result(userErr, null);
            });
            return;
          }

          const createdUser = userRes.rows[0];

          if (!profileData) {
            client.query("COMMIT", function (commitErr) {
              release();
              result(commitErr || null, commitErr ? null : createdUser);
            });
            return;
          }

          client.query(
            "INSERT INTO profile (firstname, lastname, email, year, student_id, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [
              profileData.firstname || "",
              profileData.lastname || "",
              profileData.email || "",
              profileData.year ?? null,
              profileData.student_id ?? null,
              createdUser.id,
            ],
            function (profileErr, profileRes) {
              if (profileErr) {
                client.query("ROLLBACK", function () {
                  release();
                  result(profileErr, null);
                });
                return;
              }

              client.query("COMMIT", function (commitErr) {
                release();
                result(
                  commitErr || null,
                  commitErr
                    ? null
                    : { user: createdUser, profile: profileRes.rows[0] },
                );
              });
            },
          );
        },
      );
    });
  });
};

User.findByUsername = function (username, result) {
  db.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
    function (err, res) {
      if (err) {
        result(err, null);
        return;
      }
      if (res.rows.length) {
        result(null, res.rows[0]);
        return;
      }
      result({ kind: "not_found" }, null);
    },
  );
};

User.getByActive = function (activeValue, result) {
  db.query(
    "SELECT * FROM users WHERE active = $1 ORDER BY id DESC",
    [activeValue],
    function (err, res) {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res.rows);
    },
  );
};

module.exports = User;
