// Setup Express
require("dotenv").config({
  path: require("node:path").join(__dirname, ".env"),
});

const express = require("express");
const db = require("./app/models/db");

const cookieParser = require("cookie-parser");

const app = express();

const cors = require('cors');

const allowedOrigin = process.env.FRONTEND_URL || 'https://arcade-ochre-gamma.vercel.app';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Explicitly handle preflight OPTIONS requests across all routes
app.options('*', cors());



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
