const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config/db.config.js");

// Register a new user
exports.register = function(req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).send({ message: "Username and password are required." });
  }

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: hashedPassword
  });

  User.create(user, function(err, data) {
    if (err) {
      // MySQL duplicate entry error code
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).send({ message: "Username already exists." });
      }
      return res.status(500).send({ message: err.message || "An error occurred during registration." });
    }
    res.status(201).send({ message: "User registered successfully." });
  });
};

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

    // Sign and return the token (expires in 24 hours)
     const token = jwt.sign(         
      { userId: data.id, username: data.username },
      config.JWT_SECRET,        
      { expiresIn: "24h" }       
     );

   
    res.status(200).send({
      message: "Login successful.",
      token: token
    });
  });
};
