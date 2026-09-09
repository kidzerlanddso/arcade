const db = require("./db");

const User = function(user) {
  this.username = user.username;
  this.password = user.password;
  this.active = user.active !== undefined ? user.active : 2;
  this.admin = user.admin !== undefined ? Number(user.admin) : 0;
  this.enableEmail = user.enableEmail !== undefined ? Number(user.enableEmail) : 0;
};

User.create = function(newUser, profileData, pathwayData, result) {
  if (typeof pathwayData === "function") {
    result = pathwayData;
    pathwayData = null;
  }

  if (typeof profileData === "function") {
    result = profileData;
    profileData = null;
  }

  db.connect(function(connectionError, client, release) {
    if (connectionError) {
      result(connectionError, null);
      return;
    }

    const rollback = (error) => {
      client.query("ROLLBACK", () => {
        release();
        result(error, null);
      });
    };

    client.query("BEGIN", (beginError) => {
      if (beginError) return rollback(beginError);

      client.query(
        "INSERT INTO users (username, password, active, admin, \"enableEmail\") VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [newUser.username, newUser.password, newUser.active, newUser.admin, newUser.enableEmail ?? 0],
        (userError, userResult) => {
          if (userError) return rollback(userError);

          const createdUser = userResult.rows[0];
          const profile = profileData || {};

          client.query(
            `INSERT INTO profile (
              firstname, lastname, email, current_city, current_country,
              year, student_id, user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
              profile.firstname || "",
              profile.lastname || "",
              profile.email || "",
              profile.current_city || "Hamilton",
              profile.current_country || "New Zealand",
              profile.year || null,
              profile.student_id || null,
              createdUser.id
            ],
            (profileError, profileResult) => {
              if (profileError) return rollback(profileError);

              if (!pathwayData) {
                return client.query("COMMIT", (commitError) => {
                  release();
                  result(commitError, commitError ? null : {
                    user: createdUser,
                    profile: profileResult.rows[0]
                  });
                });
              }

              const pathwayQuery = pathwayData.type === "studying"
                ? {
                    text: `INSERT INTO education
                      (user_id, institution, qualification, field_of_study, start_date)
                     VALUES ($1, $2, $3, $4, $5)`,
                    values: [
                      createdUser.id,
                      pathwayData.institution,
                      pathwayData.qualification,
                      pathwayData.field_of_study,
                      pathwayData.start_date
                    ]
                  }
                : {
                    text: `INSERT INTO employment
                      (user_id, company, job_title, start_date)
                     VALUES ($1, $2, $3, $4)`,
                    values: [
                      createdUser.id,
                      pathwayData.company,
                      pathwayData.job_title,
                      pathwayData.start_date
                    ]
                  };

              client.query(pathwayQuery, (pathwayError) => {
                if (pathwayError) return rollback(pathwayError);

                client.query("COMMIT", (commitError) => {
                  release();
                  result(commitError, commitError ? null : {
                    user: createdUser,
                    profile: profileResult.rows[0]
                  });
                });
              });
            }
          );
        }
      );
    });
  });
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
    `SELECT users.*, profile.firstname, profile.lastname, profile.year, profile.student_id, profile.current_city, profile.current_country
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

User.getAdmins = function(result) {
  db.query(
    `SELECT u.*, p.firstname, p.lastname, p.email AS profile_email, p.current_city, p.current_country, p.year
     FROM users u
     LEFT JOIN profile p ON p.user_id = u.id
     WHERE u.admin = 1 AND u.active = 1
     ORDER BY COALESCE(p.firstname, u.username) ASC`,
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

User.declineById = function(userId, result) {
  db.query(
    "UPDATE users SET active = 3 WHERE id = $1 AND active = 2 RETURNING id, username, active",
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

User.approveByIds = function(userIds, result) {
  const safeUserIds = [...new Set(userIds.filter((value) => Number.isInteger(Number(value)) && Number(value) > 0).map(Number))];

  if (!safeUserIds.length) {
    result(null, []);
    return;
  }

  db.query(
    "UPDATE users SET active = 1 WHERE id = ANY($1::int[]) AND active = 2 RETURNING id, username, active",
    [safeUserIds],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res.rows);
    }
  );
};

User.getPendingMembershipRequests = function(result) {
  db.query(
    "SELECT COUNT(*)::int AS count FROM users WHERE active = $1",
    [2],
    function(err, res) {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};

User.updateEnableEmail = function(userId, enabled, result) {
  const value = enabled === true || enabled === 1 || enabled === "1" ? 1 : 0;

  db.query(
    'UPDATE users SET "enableEmail" = $1 WHERE id = $2 RETURNING id, username, "enableEmail"',
    [value, userId],
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
