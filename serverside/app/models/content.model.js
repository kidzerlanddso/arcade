const db = require("./db");

const Content = {};

Content.findAllNews = (result) => {
  db.query(
    `SELECT id, issue, title, published_date AS date, body, full_body AS "fullBody", image
     FROM announcements
     ORDER BY published_date DESC NULLS LAST, id DESC`,
    (error, response) => result(error, response?.rows || null),
  );
};

Content.findAllTeachers = (result) => {
  db.query(
    `SELECT id, team, department, name, role, focus, email, phone, image, featured
     FROM teacher_profiles
     ORDER BY team, department, id`,
    (error, response) => result(error, response?.rows || null),
  );
};

Content.findPublicSpotlights = (result) => {
  db.query(
    `SELECT s.id, s.teacher_id AS "teacherId", s.spotlight_type AS "spotlightType",
            s.subject_name AS "subjectName", COALESCE(t.name, s.subject_name) AS "displayName",
            t.role AS "teacherRole", t.image AS "teacherImage", s.title,
            s.story, s.achievement_date AS "achievementDate", s.image,
            s.published
     FROM spotlights s
     LEFT JOIN teacher_profiles t ON t.id = s.teacher_id
     WHERE s.published = TRUE
     ORDER BY s.achievement_date DESC, s.created_at DESC, s.id DESC`,
    (error, response) => result(error, response?.rows || null),
  );
};

Content.findSpotlightById = (id, result) => {
  db.query(
    `SELECT s.id, s.teacher_id AS "teacherId", s.spotlight_type AS "spotlightType",
            s.subject_name AS "subjectName", COALESCE(t.name, s.subject_name) AS "displayName",
            t.role AS "teacherRole", t.image AS "teacherImage", s.title,
            s.story, s.achievement_date AS "achievementDate", s.image
     FROM spotlights s
     LEFT JOIN teacher_profiles t ON t.id = s.teacher_id
     WHERE s.id = $1 AND s.published = TRUE`,
    [id],
    (error, response) => result(error, response?.rows?.[0] || null),
  );
};

Content.findAllSpotlightsForAdmin = (result) => {
  db.query(
    `SELECT id, spotlight_type AS "spotlightType", subject_name AS "subjectName",
            title, story, achievement_date AS "achievementDate", image, published
     FROM spotlights
     WHERE teacher_id IS NULL
     ORDER BY achievement_date DESC, created_at DESC, id DESC`,
    (error, response) => result(error, response?.rows || null),
  );
};

Content.findTeacherSpotlights = (teacherId, result) => {
  db.query(
    `SELECT id, teacher_id AS "teacherId", spotlight_type AS "spotlightType",
            subject_name AS "subjectName", title, story,
            achievement_date AS "achievementDate", image, published
     FROM spotlights
     WHERE teacher_id = $1
     ORDER BY achievement_date DESC, created_at DESC, id DESC`,
    [teacherId],
    (error, response) => result(error, response?.rows || null),
  );
};

Content.createSpotlight = (spotlight, result) => {
  db.query(
    `INSERT INTO spotlights
       (teacher_id, spotlight_type, subject_name, title, story, achievement_date, image, published, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, teacher_id AS "teacherId", spotlight_type AS "spotlightType",
       subject_name AS "subjectName", title, story,
       achievement_date AS "achievementDate", image, published`,
    [spotlight.teacherId || null, spotlight.spotlightType, spotlight.subjectName || null, spotlight.title, spotlight.story, spotlight.achievementDate, spotlight.image || null, Boolean(spotlight.published), spotlight.createdBy],
    (error, response) => result(error, response?.rows?.[0] || null),
  );
};

Content.updateSpotlight = (id, spotlight, result) => {
  db.query(
    `UPDATE spotlights
     SET spotlight_type = $1, subject_name = $2, title = $3, story = $4,
         achievement_date = $5, image = $6, published = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING id, teacher_id AS "teacherId", spotlight_type AS "spotlightType",
       subject_name AS "subjectName", title, story,
       achievement_date AS "achievementDate", image, published`,
    [spotlight.spotlightType, spotlight.subjectName || null, spotlight.title, spotlight.story, spotlight.achievementDate, spotlight.image || null, Boolean(spotlight.published), id],
    (error, response) => result(error, response?.rows?.[0] || null),
  );
};

Content.updateSpotlightImage = (id, image, result) => {
  db.query(
    `UPDATE spotlights SET image = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, teacher_id AS "teacherId", spotlight_type AS "spotlightType",
       subject_name AS "subjectName", title, story,
       achievement_date AS "achievementDate", image, published`,
    [image, id],
    (error, response) => {
      if (error) return result(error, null);
      if (!response.rows.length) return result({ kind: "not_found" }, null);
      result(null, response.rows[0]);
    },
  );
};

Content.deleteSpotlight = (id, result) => {
  db.query(
    "DELETE FROM spotlights WHERE id = $1 RETURNING id",
    [id],
    (error, response) => {
      if (error) return result(error, null);
      if (!response.rows.length) return result({ kind: "not_found" }, null);
      result(null, response.rows[0]);
    },
  );
};

Content.createNews = (news, result) => {
  db.query(
    `INSERT INTO announcements
      (issue, title, published_date, body, full_body, image, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, issue, title, published_date AS date, body, full_body AS "fullBody", image`,
    [news.issue, news.title, news.date || null, news.body, news.fullBody || news.body, news.image || null, news.createdBy],
    (error, response) => result(error, response?.rows?.[0] || null),
  );
};

Content.updateNews = (id, news, result) => {
  db.query(
    `UPDATE announcements SET issue = $1, title = $2, published_date = $3,
      body = $4, full_body = $5, image = $6, updated_at = NOW()
     WHERE id = $7
     RETURNING id, issue, title, published_date AS date, body, full_body AS "fullBody", image`,
    [news.issue, news.title, news.date || null, news.body, news.fullBody || news.body, news.image || null, id],
    (error, response) => result(error, response?.rows?.[0] || null),
  );
};

Content.updateNewsImage = (id, image, result) => {
  db.query(
    `UPDATE announcements SET image = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, issue, title, published_date AS date, body, full_body AS "fullBody", image`,
    [image, id],
    (error, response) => {
      if (error) return result(error, null);
      if (!response.rows.length) return result({ kind: "not_found" }, null);
      result(null, response.rows[0]);
    },
  );
};

Content.createTeacher = (teacher, result) => {
  db.query(
    `INSERT INTO teacher_profiles
      (team, department, name, role, focus, email, phone, image, featured, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, team, department, name, role, focus, email, phone, image, featured`,
    [teacher.team, teacher.department || null, teacher.name, teacher.role, teacher.focus || null, teacher.email, teacher.phone || null, teacher.image || null, !!teacher.featured, teacher.createdBy],
    (error, response) => result(error, response?.rows?.[0] || null),
  );
};

Content.updateTeacher = (id, teacher, result) => {
  db.query(
    `UPDATE teacher_profiles SET team = $1, department = $2, name = $3, role = $4,
      focus = $5, email = $6, phone = $7, image = $8, featured = $9, updated_at = NOW()
     WHERE id = $10
     RETURNING id, team, department, name, role, focus, email, phone, image, featured`,
    [teacher.team, teacher.department || null, teacher.name, teacher.role, teacher.focus || null, teacher.email, teacher.phone || null, teacher.image || null, !!teacher.featured, id],
    (error, response) => result(error, response?.rows?.[0] || null),
  );
};

Content.updateTeacherImage = (id, image, result) => {
  db.query(
    `UPDATE teacher_profiles SET image = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, team, department, name, role, focus, email, phone, image, featured`,
    [image, id],
    (error, response) => {
      if (error) return result(error, null);
      if (!response.rows.length) return result({ kind: "not_found" }, null);
      result(null, response.rows[0]);
    },
  );
};

Content.deleteById = (id, result) => {
  db.query("DELETE FROM content_items WHERE id = $1 RETURNING id", [id], (error, response) => {
    if (error) return result(error, null);
    if (!response.rows.length) return result({ kind: "not_found" }, null);
    result(null, response.rows[0]);
  });
};

Content.deleteTeacherById = (id, result) => {
  db.query("DELETE FROM teacher_profiles WHERE id = $1 RETURNING id", [id], (error, response) => {
    if (error) return result(error, null);
    if (!response.rows.length) return result({ kind: "not_found" }, null);
    result(null, response.rows[0]);
  });
};

Content.deleteNewsById = (id, result) => {
  db.query("DELETE FROM announcements WHERE id = $1 RETURNING id", [id], (error, response) => {
    if (error) return result(error, null);
    if (!response.rows.length) return result({ kind: "not_found" }, null);
    result(null, response.rows[0]);
  });
};

module.exports = Content;
