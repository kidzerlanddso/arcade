const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const config = require("../config/db.config.js");

// Register a new user
exports.register = function (req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .send({ message: "Username and password are required." });
  }

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: hashedPassword,
    active: 1,
  });
  const profileData = {
    firstname: req.body.firstName || req.body.firstname || "",
    lastname: req.body.lastName || req.body.lastname || "",
    email: req.body.email || "",
    year:
      req.body.yearOfGraduation || req.body.year || new Date().getFullYear(),
    student_id: req.body.studentId || req.body.student_id || 0,
  };
  // const profileData = {
  //   firstname: req.body.firstName || req.body.firstname || "",
  //   lastname: req.body.lastName || req.body.lastname || "",
  //   year: req.body.yearOfGraduation || req.body.year || null,
  //   student_id: req.body.studentId || req.body.student_id || null
  // };

  User.create(user, profileData, function (err, data) {
    if (err) {
      if (err.code === "ER_DUP_ENTRY" || err.code === "23505") {
        return res.status(409).send({ message: "Username already exists." });
      }
      return res.status(500).send({
        message: err.message || "An error occurred during registration.",
      });
    }

    res.status(201).send({ message: "User registered successfully." });
  });
};

// Login and return a JWT
exports.login = function (req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    return res
      .status(400)
      .send({ message: "Username and password are required." });
  }

  User.findByUsername(req.body.username, function (err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res
          .status(401)
          .send({ message: "Invalid username or password." });
      }
      return res
        .status(500)
        .send({ message: err.message || "An error occurred during login." });
    }

    // Compare the submitted password with the stored hash
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      data.password,
    );
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid username or password." });
    }

    const isAdmin = Number(data.admin) === 1;

    // Sign and return the token (expires in 24 hours)
    const token = jwt.sign(
      { userId: data.id, username: data.username, admin: isAdmin },
      config.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.status(200).send({
      message: "Login successful.",
      token: token,
      admin: isAdmin,
    });
  });
};

exports.getMembershipRequests = function (req, res) {
  User.getByActive(2, function (err, users) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to load membership requests.",
      });
    }

    res.status(200).send({
      data: users || [],
    });
  });
};
