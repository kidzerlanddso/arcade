// Setup Express
require("dotenv").config({ path: require("node:path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const db = require("./app/models/db");

const cookieParser = require("cookie-parser");

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
app.get("/", (req, res) => {
  res.json({ message: "Arcade Customer Accounts API" });
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
require("./app/routes/arcadeCustomer.routes.js")(app);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`API server is listening on port ${PORT}`);
});

