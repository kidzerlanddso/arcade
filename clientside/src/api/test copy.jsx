const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // or whatever your bcrypt import name is
const config = require('../config/auth.config'); // adjust import path to your config file
const User = require('../models/user.model'); // adjust import path to your model file

// Login and return a JWT
exports.login = function(req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).send({ message: "Username and password are required." });
  }

  User.findByUsername(req.body.username, function(err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(401).send({ message: "Invalid username or password." });
      }
      return res.status(500).send({ message: err.message || "An error occurred during login." });
    }

    // Compare the submitted password with the stored hash
    const passwordIsValid = bcrypt.compareSync(req.body.password, data.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid username or password." });
    }

    const isAdmin = Number(data.admin) === 1;

    // 1. Sign access token with a short expiration (15 minutes recommended)
    const token = jwt.sign(
      { userId: data.id, username: data.username, admin: isAdmin },
      config.JWT_SECRET,
      { expiresIn: "15m" } 
    );
    
    // 2. Sign refresh token with long expiration
    const refreshToken = jwt.sign(
      { userId: data.id, username: data.username, admin: isAdmin }, 
      config.REFRESH_SECRET, 
      { expiresIn: '7d' }
    );

    // 3. Send refresh token in a secure, hidden cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,     // Prevents XSS scripts from reading the cookie
      secure: false,      // Set to true in production (requires HTTPS)
      sameSite: 'lax',    // Helps protect against CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching token expiration
    });

    // 4. Send access token and metadata to React
    res.status(200).send({
      message: "Login successful.",
      token: token,
      admin: isAdmin
    });
  });
};

// Refresh and return a new JWT
exports.refresh = function(req, res) {
  // Extract the refresh token directly from cookies
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    // Decode the data packaged inside the token
    const decoded = jwt.verify(refreshToken, config.REFRESH_SECRET);

    // 5. Issue a fresh short-lived access token using data from decoded payload
    const token = jwt.sign(
      { userId: decoded.userId, username: decoded.username, admin: decoded.admin },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ 
      token: token,
      admin: decoded.admin
    });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};
