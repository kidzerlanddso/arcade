const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const config = require("../config/db.config.js");
const {
  sendMembershipRequestEmail,
} = require("../services/membershipEmail.service");
const { verifyGoogleIdToken } = require("../services/googleAuth.service");

const parsePathwayPayload = (pathway) => {
  const isStudying = pathway?.type === "studying";
  const isWorking = pathway?.type === "working";

  if (!isStudying && !isWorking) {
    return {
      error: "Please select whether you are currently studying or working.",
    };
  }

  const pathwayData = isStudying
    ? {
        type: "studying",
        institution: String(pathway.institution || "").trim(),
        qualification: String(pathway.qualification || "").trim(),
        field_of_study: String(pathway.field_of_study || "").trim(),
        start_date: pathway.start_date || null,
      }
    : {
        type: "working",
        company: String(pathway.company || "").trim(),
        job_title: String(pathway.job_title || "").trim(),
        start_date: pathway.start_date || null,
      };

  const requiredPathwayFields = isStudying
    ? [
        pathwayData.institution,
        pathwayData.qualification,
        pathwayData.field_of_study,
        pathwayData.start_date,
      ]
    : [pathwayData.company, pathwayData.job_title, pathwayData.start_date];

  if (requiredPathwayFields.some((value) => !value)) {
    return {
      error:
        "Please complete all current situation fields before signing up.",
    };
  }

  return { pathwayData };
};

const sendAuthTokens = (res, user) => {
  const isAdmin = Number(user.admin) === 1;
  const token = jwt.sign(
    { userId: user.id, username: user.username, admin: isAdmin },
    config.JWT_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { userId: user.id, username: user.username, admin: isAdmin },
    config.REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).send({
    message: "Login successful.",
    token,
    admin: isAdmin,
  });
};

const respondForAuthenticatedUser = (res, user) => {
  if (Number(user.active) === 2) {
    return res.status(403).send({
      message: "Admin needs to approve your account.",
    });
  }

  if (Number(user.active) !== 1) {
    return res.status(403).send({
      message: "Your account is not active.",
    });
  }

  return sendAuthTokens(res, user);
};

const notifyEmailEnabledAdmins = (data, pathwayData) => {
  console.log("[membership-email] Looking up email-enabled administrators", {
    registeredUserId: data.user.id,
    registeredUsername: data.user.username,
  });

  User.getEmailEnabledAdmins(async (adminError, adminEmails) => {
    if (adminError) {
      console.error("Unable to load email-enabled administrators:", adminError);
      return;
    }

    console.log("[membership-email] Matching administrators found", {
      count: adminEmails.length,
    });

    if (!adminEmails.length) {
      console.warn(
        "[membership-email] No admins matched admin=1 and enableEmail=1 with a profile email.",
      );
      return;
    }

    try {
      await sendMembershipRequestEmail({
        profile: {
          ...data.profile,
          username: data.user.username,
          adminEmails,
        },
        pathway: pathwayData,
      });
    } catch (emailError) {
      console.error("Unable to send membership request email:", emailError);
    }
  });
};

// Register a new user
exports.register = function (req, res) {
  if (
    !req.body ||
    !req.body.username ||
    !req.body.password ||
    !req.body.email
  ) {
    return res
      .status(400)
      .send({ message: "Username and password are required." });
  }

  const pathwayResult = parsePathwayPayload(req.body.pathway);
  if (pathwayResult.error) {
    return res.status(400).send({ message: pathwayResult.error });
  }
  const pathwayData = pathwayResult.pathwayData;

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: hashedPassword,
    active: 2,
  });

  const profileData = {
    firstname: req.body.firstName || req.body.firstname || "",
    lastname: req.body.lastName || req.body.lastname || "",
    email: req.body.email || "",
    current_city: req.body.current_city || "Hamilton",
    current_country: req.body.current_country || "New Zealand",
    year: req.body.yearOfGraduation || req.body.year || null,
    student_id: req.body.studentId || req.body.student_id || null,
  };

  // Empty strings from the signup form should become null for numeric/optional DB fields
  if (profileData.year === "" || profileData.year === undefined) {
    profileData.year = null;
  } else if (profileData.year !== null) {
    const parsedYear = Number(profileData.year);
    profileData.year = Number.isFinite(parsedYear) ? parsedYear : null;
  }
  if (profileData.student_id === "") {
    profileData.student_id = null;
  }

  User.create(user, profileData, pathwayData, function (err, data) {
    if (err) {
      const isDuplicateUsername =
        err.code === "ER_DUP_ENTRY" ||
        (err.code === "23505" &&
          (err.constraint === "users_username_key" ||
            String(err.message || "").includes("users_username_key")));

      if (isDuplicateUsername) {
        return res.status(409).send({
          message:
            "This username is already taken. Please choose a different one.",
        });
      }

      return res.status(500).send({
        message: err.message || "An error occurred during registration.",
      });
    }

    console.log("[membership-email] Registration committed", {
      userId: data.user.id,
      profileId: data.profile.id,
      active: data.user.active,
    });
    notifyEmailEnabledAdmins(data, pathwayData);
    res.status(201).send({ message: "User registered successfully." });
  });
};

// Register a new admin
exports.RegisterAdmin = function (req, res) {
  if (
    !req.body ||
    !req.body.username ||
    !req.body.password ||
    !req.body.email
  ) {
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
    admin: 1,
  });

  const profileData = {
    firstname: req.body.firstName || req.body.firstname || "",
    lastname: req.body.lastName || req.body.lastname || "",
    email: req.body.email || "",
    current_city: req.body.current_city || "Hamilton",
    current_country: req.body.current_country || "New Zealand",
  };

  User.create(user, profileData, function (err, data) {
    if (err) {
      const isDuplicateUsername =
        err.code === "ER_DUP_ENTRY" ||
        (err.code === "23505" &&
          (err.constraint === "users_username_key" ||
            String(err.message || "").includes("users_username_key")));

      if (isDuplicateUsername) {
        return res.status(409).send({
          message:
            "This username is already taken. Please choose a different one.",
        });
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
  const login = req.body?.login || req.body?.username || req.body?.email;

  if (!login || !req.body?.password) {
    return res
      .status(400)
      .send({ message: "Username and password are required." });
  }

  User.findByLogin(login, function (err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res
          .status(401)
          .send({ message: "Username/email and password are required." });
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
      return res
        .status(401)
        .send({ message: "Invalid username/email or password." });
    }

    return respondForAuthenticatedUser(res, data);
  });
};

exports.getGoogleConfig = function (req, res) {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  return res.status(200).send({
    enabled: Boolean(clientId),
    clientId: clientId || null,
  });
};

exports.googleAuth = async function (req, res) {
  const credential = req.body?.credential;

  if (!credential) {
    return res.status(400).send({ message: "Google credential is required." });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).send({
      message: "Google sign-in is not configured on the server.",
    });
  }

  let googleUser;
  try {
    googleUser = await verifyGoogleIdToken(credential);
  } catch (error) {
    console.error("Google token verification failed:", error.message);
    return res.status(401).send({
      message: "Google sign-in failed. Please try again.",
    });
  }

  if (!googleUser.emailVerified) {
    return res.status(403).send({
      message: "Please verify your Google email before continuing.",
    });
  }

  User.findByGoogleId(googleUser.googleId, (googleLookupError, userByGoogle) => {
    if (googleLookupError && googleLookupError.kind !== "not_found") {
      return res.status(500).send({
        message:
          googleLookupError.message || "An error occurred during Google sign-in.",
      });
    }

    if (userByGoogle) {
      return respondForAuthenticatedUser(res, userByGoogle);
    }

    User.findByProfileEmail(googleUser.email, (emailLookupError, userByEmail) => {
      if (emailLookupError && emailLookupError.kind !== "not_found") {
        return res.status(500).send({
          message:
            emailLookupError.message || "An error occurred during Google sign-in.",
        });
      }

      if (userByEmail) {
        if (userByEmail.google_id && userByEmail.google_id !== googleUser.googleId) {
          return res.status(409).send({
            message:
              "This email is linked to a different Google account. Contact an administrator.",
          });
        }

        if (!userByEmail.google_id) {
          return User.linkGoogleId(
            userByEmail.id,
            googleUser.googleId,
            (linkError, linkedUser) => {
              if (linkError) {
                return res.status(500).send({
                  message:
                    linkError.message || "Unable to link your Google account.",
                });
              }
              return respondForAuthenticatedUser(res, linkedUser);
            },
          );
        }

        return respondForAuthenticatedUser(res, userByEmail);
      }

      const registrationToken = jwt.sign(
        {
          purpose: "google_register",
          googleId: googleUser.googleId,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
        },
        config.JWT_SECRET,
        { expiresIn: "30m" },
      );

      return res.status(200).send({
        needsRegistration: true,
        registrationToken,
        profile: {
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
        },
      });
    });
  });
};

exports.googleRegister = function (req, res) {
  const registrationToken = req.body?.registrationToken;

  if (!registrationToken) {
    return res.status(400).send({
      message: "Google signup session is missing. Please sign in with Google again.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(registrationToken, config.JWT_SECRET);
  } catch (error) {
    return res.status(401).send({
      message: "Google signup session expired. Please sign in with Google again.",
    });
  }

  if (decoded.purpose !== "google_register" || !decoded.googleId || !decoded.email) {
    return res.status(400).send({ message: "Invalid Google signup session." });
  }

  const pathwayResult = parsePathwayPayload(req.body.pathway);
  if (pathwayResult.error) {
    return res.status(400).send({ message: pathwayResult.error });
  }
  const pathwayData = pathwayResult.pathwayData;

  const yearRaw = req.body.year ?? req.body.yearOfGraduation;
  let year = null;
  if (yearRaw !== undefined && yearRaw !== null && String(yearRaw).trim() !== "") {
    const parsedYear = Number(yearRaw);
    if (!Number.isFinite(parsedYear)) {
      return res.status(400).send({
        message: "Please enter a valid year of graduation.",
      });
    }
    year = parsedYear;
  }

  if (year === null) {
    return res.status(400).send({
      message: "Year of graduation is required.",
    });
  }

  const profileData = {
    firstname: decoded.firstName || "",
    lastname: decoded.lastName || "",
    email: decoded.email,
    current_city: req.body.current_city || "Hamilton",
    current_country: req.body.current_country || "New Zealand",
    year,
    student_id: req.body.student_id || req.body.studentId || null,
  };

  if (profileData.student_id === "") {
    profileData.student_id = null;
  }

  User.findByGoogleId(decoded.googleId, (existingGoogleError, existingGoogleUser) => {
    if (existingGoogleError && existingGoogleError.kind !== "not_found") {
      return res.status(500).send({
        message:
          existingGoogleError.message ||
          "An error occurred during Google registration.",
      });
    }

    if (existingGoogleUser) {
      return res.status(409).send({
        message: "This Google account is already registered.",
      });
    }

    User.findByProfileEmail(decoded.email, (existingEmailError, existingEmailUser) => {
      if (existingEmailError && existingEmailError.kind !== "not_found") {
        return res.status(500).send({
          message:
            existingEmailError.message ||
            "An error occurred during Google registration.",
        });
      }

      if (existingEmailUser) {
        return res.status(409).send({
          message:
            "An account with this email already exists. Sign in with username and password or Google.",
        });
      }

      const emailLocalPart = decoded.email.split("@")[0] || "alumni";
      User.generateUniqueUsername(emailLocalPart, (usernameError, username) => {
        if (usernameError) {
          return res.status(500).send({
            message:
              usernameError.message || "Unable to create your account username.",
          });
        }

        const hashedPassword = bcrypt.hashSync(
          crypto.randomBytes(32).toString("hex"),
          10,
        );

        const user = new User({
          username,
          password: hashedPassword,
          active: 2,
          google_id: decoded.googleId,
        });

        User.create(user, profileData, pathwayData, function (err, data) {
          if (err) {
            return res.status(500).send({
              message: err.message || "An error occurred during registration.",
            });
          }

          console.log("[membership-email] Google registration committed", {
            userId: data.user.id,
            profileId: data.profile.id,
            active: data.user.active,
          });
          notifyEmailEnabledAdmins(data, pathwayData);
          res.status(201).send({
            message:
              "Registration submitted. An admin must approve your account before you can sign in.",
          });
        });
      });
    });
  });
};

// Refresh and return a new JWT
exports.refresh = function (req, res) {
  // 5. Extract the refresh token directly from cookies, not body/headers
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.REFRESH_SECRET);

    // Issue a fresh short-lived access token
    const token = jwt.sign(
      {
        userId: decoded.userId,
        username: decoded.username,
        admin: decoded.admin,
      },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return res.json({
      token: token,
      admin: decoded.admin,
    });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

// Clear cookie and log out user
exports.logout = function (req, res) {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  // Remove cookies issued before the cookie path was made explicit.
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/auth",
  });

  return res.status(200).send({ message: "Logged out successfully." });
};

exports.updateEnableEmail = function (req, res) {
  const userId = req.userId;
  const enabledValue = req.body?.enableEmail;

  if (!userId) {
    return res.status(401).send({ message: "Authentication required." });
  }

  const enabled =
    enabledValue === true || enabledValue === 1 || enabledValue === "1";

  User.updateEnableEmail(userId, enabled, function (err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({ message: "User not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to update email notification setting.",
      });
    }

    return res.status(200).send({
      message: "Email notification preference updated.",
      user: data,
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

exports.getAdmins = function (req, res) {
  User.getAdmins(function (err, users) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to load admin users.",
      });
    }

    return res.status(200).send({
      data: users || [],
    });
  });
};

exports.approveMembershipRequest = function (req, res) {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).send({ message: "A valid user ID is required." });
  }

  User.approveById(userId, function (err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res
          .status(404)
          .send({ message: "Pending membership request not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to approve membership request.",
      });
    }

    return res.status(200).send({
      message: "Membership request approved.",
      user: data,
    });
  });
};
exports.declineMembershipRequest = function (req, res) {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).send({ message: "A valid user ID is required." });
  }

  User.declineById(userId, function (err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res
          .status(404)
          .send({ message: "Pending membership request not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to decline membership request.",
      });
    }

    return res.status(200).send({
      message: "Membership request declined.",
      user: data,
    });
  });
};

exports.approveMembershipRequests = function (req, res) {
  const userIds = Array.isArray(req.body?.userIds) ? req.body.userIds : [];
  const normalizedIds = userIds
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!normalizedIds.length) {
    return res
      .status(400)
      .send({ message: "Select at least one membership request to approve." });
  }

  User.approveByIds(normalizedIds, function (err, approvedUsers) {
    if (err) {
      return res.status(500).send({
        message:
          err.message || "Unable to approve selected membership requests.",
      });
    }

    return res.status(200).send({
      message: "Selected membership requests approved.",
      users: approvedUsers || [],
    });
  });
};
exports.getPendingMembershipRequests = function (req, res) {
  User.getPendingMembershipRequests(function (err, users) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to load pending membership requests.",
      });
    }

    return res.status(200).send({
      count: Number(users?.count || 0),
    });
  });
};
