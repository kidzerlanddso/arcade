// Setup Express
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path"); 
const db = require("./app/models/db");

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Allow local Vite and the deployed frontend (FRONTEND_URL).
const allowedOrigins = [
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser tools (no Origin header) and configured frontends.
    const isLocalDevelopmentOrigin = /^http:\/\/localhost:\d+$/.test(origin || "");

    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));


// To help with POST and PUT requests to the server
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/", (req, res) => {
  res.json({ message: "Welcome to Alumni Portal" }); 
});

require("./app/routes/auth.routes.js")(app);
require("./app/routes/profile.routes.js")(app);
require("./app/routes/employment.routes.js")(app);
require("./app/routes/education.routes.js")(app);
require("./app/routes/country.routes.js")(app);
require("./app/routes/connection.routes.js")(app);
require("./app/routes/event.routes.js")(app);
require("./app/routes/data.routes.js")(app);
// Start the server running. Once the server is running, the given function will be called, which will
// log a simple message to the server console. Any console.log() statements in your Node.js code
// can be seen in the terminal window used to run the server.

const PORT = process.env.PORT || 3001;

 db.syncSequences((error) => {
  if (error) {
    console.warn(
      `Could not synchronize ${error.table || "database"} ID sequence: ${error.message}`,
    );
  }

  app.listen(PORT, () => {
    console.log(`CORS enabled Express web server is running on port ${PORT}.`);
  });
    });


