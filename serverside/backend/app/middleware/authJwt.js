const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");

const verifyToken = function(req, res, next) {
  // The token is expected in the Authorization header as: Bearer <token>
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).send({ message: "No token provided. Access denied." });
  }

  // Split "Bearer <token>" and take the second part
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Malformed token. Access denied." });
  }

  jwt.verify(token, config.JWT_SECRET, function(err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Invalid or expired token. Please log in again." });
    }
    // Attach the decoded user info to the request for use in controllers
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  });
};

module.exports = { verifyToken };
