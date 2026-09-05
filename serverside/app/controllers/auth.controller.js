const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const config = require("../config/db.config.js");

// Register a new user
exports.register = function(req, res) {
  if (!req.body || !req.body.username || !req.body.password|| !req.body.email) {
    return res.status(400).send({ message: "Username and password are required." });
  }

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: hashedPassword,
    active: 2
  });

  const profileData = {
    firstname: req.body.firstName || req.body.firstname || "",
    lastname: req.body.lastName || req.body.lastname || "",
    email: req.body.email || "",
    current_city: req.body.current_city || "Hamilton",
    current_country: req.body.current_country || "New Zealand",
    year: req.body.yearOfGraduation || req.body.year || null,
    student_id: req.body.studentId || req.body.student_id || null
  };

  User.create(user, profileData, function(err, data) {
    if (err) {
      const isDuplicateUsername =
        err.code === "ER_DUP_ENTRY" ||
        (err.code === "23505" &&
          (err.constraint === "users_username_key" ||
            String(err.message || "").includes("users_username_key")));

      if (isDuplicateUsername) {
        return res.status(409).send({
          message: "This username is already taken. Please choose a different one."
        });
      }

      return res.status(500).send({ message: err.message || "An error occurred during registration." });
    }

    res.status(201).send({ message: "User registered successfully." });
  });
};
 

// Register a new admin
exports.RegisterAdmin = function(req, res) {
  if (!req.body || !req.body.username || !req.body.password|| !req.body.email) {
    return res.status(400).send({ message: "Username and password are required." });
  }

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: hashedPassword,
    active: 1,
    admin: 1
  });

  const profileData = {
    firstname: req.body.firstName || req.body.firstname || "",
    lastname: req.body.lastName || req.body.lastname || "",
    email: req.body.email || "",
    current_city: req.body.current_city || "Hamilton",
    current_country: req.body.current_country || "New Zealand"
  };

  User.create(user, profileData, function(err, data) {
    if (err) {
      const isDuplicateUsername =
        err.code === "ER_DUP_ENTRY" ||
        (err.code === "23505" &&
          (err.constraint === "users_username_key" ||
            String(err.message || "").includes("users_username_key")));

      if (isDuplicateUsername) {
        return res.status(409).send({
          message: "This username is already taken. Please choose a different one."
        });
      }

      return res.status(500).send({ message: err.message || "An error occurred during registration." });
    }

    res.status(201).send({ message: "User registered successfully." });
  });
};

// Login and return a JWT
exports.login = function(req, res) {
  const login = req.body?.login || req.body?.username || req.body?.email;

  if (!login || !req.body?.password) {
    return res.status(400).send({ message: "Username and password are required." });
  }

  User.findByLogin(login, function(err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(401).send({ message: "Username/email and password are required." });
      }
      return res.status(500).send({ message: err.message || "An error occurred during login." });
    }

    // Compare the submitted password with the stored hash
    const passwordIsValid = bcrypt.compareSync(req.body.password, data.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid username/email or password." });
    }

    if (Number(data.active) === 2) {
      return res.status(403).send({
        message: "Admin needs to approve your account."
      });
    }

    if (Number(data.active) === 2) {
      return res.status(403).send({
        message: "Admin needs to approve your account."
      });
    }

    const isAdmin = Number(data.admin) === 1;

    // Sign and return the token (expires in 2 hours)
    const token = jwt.sign(
      { userId: data.id, username: data.username, admin: isAdmin },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign({ userId: data.id, username: data.username, admin: isAdmin },config.REFRESH_SECRET, { expiresIn: '7d' }
    );

    // Cross-site cookies need secure + SameSite=None in production (Vercel ↔ Render).
    const isProd = process.env.NODE_ENV === "production";

    // 3. Send refresh token in a secure, hidden cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,     // Prevents XSS scripts from reading the cookie
      secure: isProd,     // Required for HTTPS / SameSite=None
      sameSite: isProd ? 'none' : 'lax',
      path: '/',          // Must match the path used when clearing the cookie
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching token expiration
    });

    // 4. Send access token and user profile in the JSON body
    //return res.json({ accessToken, user });

    res.status(200).send({
      message: "Login successful.",
      token: token,
      admin: isAdmin
    });
  });
};

// Refresh and return a new JWT
exports.refresh = function(req, res) {
  // 5. Extract the refresh token directly from cookies, not body/headers
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }


  try {
    const decoded = jwt.verify(refreshToken, config.REFRESH_SECRET);
    
    // Issue a fresh short-lived access token
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

// Clear cookie and log out user
exports.logout = function(req, res) {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/'
  });

  // Remove cookies issued before the cookie path was made explicit.
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/auth'
  });
  
  return res.status(200).send({ message: "Logged out successfully." });
};

exports.updateEnableEmail = function(req, res) {
  const userId = req.userId;
  const enabledValue = req.body?.enableEmail;

  if (!userId) {
    return res.status(401).send({ message: "Authentication required." });
  }

  const enabled = enabledValue === true || enabledValue === 1 || enabledValue === "1";

  User.updateEnableEmail(userId, enabled, function(err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({ message: "User not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to update email notification setting."
      });
    }

    return res.status(200).send({
      message: "Email notification preference updated.",
      user: data
    });
  });
};


exports.getMembershipRequests = function(req, res) {
  User.getByActive(2, function(err, users) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to load membership requests."
      });
    }

    res.status(200).send({
      data: users || []
    });
  });
};

exports.getAdmins = function(req, res) {
  User.getAdmins(function(err, users) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to load admin users."
      });
    }

    return res.status(200).send({
      data: users || []
    });
  });
};

exports.approveMembershipRequest = function(req, res) {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).send({ message: "A valid user ID is required." });
  }

  User.approveById(userId, function(err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({ message: "Pending membership request not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to approve membership request."
      });
    }

    return res.status(200).send({
      message: "Membership request approved.",
      user: data
    });
  });
};

exports.approveMembershipRequests = function(req, res) {
  const userIds = Array.isArray(req.body?.userIds) ? req.body.userIds : [];
  const normalizedIds = userIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!normalizedIds.length) {
    return res.status(400).send({ message: "Select at least one membership request to approve." });
  }

  User.approveByIds(normalizedIds, function(err, approvedUsers) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to approve selected membership requests."
      });
    }

    return res.status(200).send({
      message: "Selected membership requests approved.",
      users: approvedUsers || []
    });
  });
};
exports.getPendingMembershipRequests = function(req, res) {
  User.getPendingMembershipRequests(function(err, users) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to load pending membership requests."
      });
    }

    return res.status(200).send({
      count: Number(users?.count || 0)
    });
  });
};

