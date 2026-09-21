// Setup Express
require("dotenv").config();

const {
  isMembershipEmailConfigured,
} = require("./app/services/membershipEmail.service");

console.log(
  "[startup] Membership email service configured:",
  isMembershipEmailConfigured(),
);
console.log(
  "[startup] Resend sender:",
  process.env.RESEND_FROM_EMAIL || "Alumni Connect <onboarding@resend.dev>",
);

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./app/models/db");

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

// Allow local Vite and the deployed frontend (FRONTEND_URL).
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser tools (no Origin header) and configured frontends.
      const isLocalDevelopmentOrigin = /^http:\/\/localhost:\d+$/.test(
        origin || "",
      );

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isLocalDevelopmentOrigin
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

// To help with POST and PUT requests to the server
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Alumni Portal" });
});
app.get("/keepalive", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ ok: true, ts: new Date().toISOString() });
  } catch (error) {
    console.error("keepalive failed:", error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});
require("./app/routes/auth.routes.js")(app);
require("./app/routes/profile.routes.js")(app);
require("./app/routes/employment.routes.js")(app);
require("./app/routes/education.routes.js")(app);
require("./app/routes/country.routes.js")(app);
require("./app/routes/connection.routes.js")(app);
require("./app/routes/event.routes.js")(app);
require("./app/routes/data.routes.js")(app);
require("./app/routes/content.routes.js")(app);
// Start the server running. Once the server is running, the given function will be called, which will
// log a simple message to the server console. Any console.log() statements in your Node.js code
// can be seen in the terminal window used to run the server.

const PORT = process.env.PORT || 3001;

db.ensureEventAttendeesTable((migrationError) => {
  if (migrationError) {
    console.error(
      `Could not prepare event attendees table: ${migrationError.message}`,
    );
    process.exitCode = 1;
    return;
  }

  db.ensureContentTables((contentError) => {
    if (contentError) {
      console.error(`Could not prepare content tables: ${contentError.message}`);
      process.exitCode = 1;
      return;
    }

    db.syncSequences((sequenceError) => {
    if (sequenceError) {
      console.warn(
        `Could not synchronize ${sequenceError.table || "database"} ID sequence: ${sequenceError.message}`,
      );
    }

    app.listen(PORT, () => {
      console.log(
        `CORS enabled Express web server is running on port ${PORT}.`,
      );
    });
    });
  });
});
