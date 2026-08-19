// Setup Express
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./app/models/db");
const app = express();

// To help with accessing this server from Postman
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// To help with POST and PUT requests to the server
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Alumni Portal" });
});

try {
  require("./app/routes/books.routes.js")(app);
} catch (err) {
  console.log("Books routes not loaded (optional for this test):", err.code || err.message);
}
require("./app/routes/auth.routes.js")(app);
require("./app/routes/profile.routes.js")(app);
require("./app/routes/employment.routes.js")(app);


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
