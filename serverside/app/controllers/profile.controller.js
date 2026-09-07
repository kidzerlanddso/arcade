const Project = require("../models/profile.model");
const sharp = require("sharp");
const { uploadProfileImage: uploadToSupabase } = require("../services/supabaseStorage");
 
// TODO: complete the code as per the instructions given README.md

// Create and save a new Alumni
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({ message: "Content cannot be empty!" });
    return;
  }

  // Create a profile object
  const newprofile = new Project({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email || "",
    current_city: req.body.current_city || "Hamilton",
    current_country: req.body.current_country || "New Zealand",
    year: req.body.year,
    student_id: req.body.student_id,
    user_id: req.body.user_id
  });

  // Save profile in the database
  Project.create(newprofile, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the profile."
      });
    } else {
      res.send(data);
    }
  });
};

// Retrieve all Records
exports.findAll = (req, res) => {
  Project.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving profiles."
      });
    } else {
      res.send(data);
    }
  });
};

// Retrieve a single record by ID
exports.findOne = (req, res) => {
  Project.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `profile with id ${req.params.id} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving profile with id " + req.params.id
        });
      }
    } else {
      res.send(data);
    }
  });
};

exports.findMine = (req, res) => {
  Project.findByUserId(req.userId, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: "Error retrieving your profile."
      });
    }

    if (!data) {
      return res.status(404).send({ message: "Your profile was not found." });
    }

    return res.send(data);
  });
};

exports.findByUser = (req, res) => {
  const userId = Number(req.params.userId);

  if (!userId) {
    return res.status(400).send({ message: "userId is required." });
  }

  Project.findByUserId(userId, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: "Error retrieving profile."
      });
    }

    if (!data) {
      return res.status(404).send({ message: "Profile not found." });
    }

    return res.send(data);
  });
};


// Retrieve a single record by name
exports.findName = (req, res) => {
  Project.findByName(req.params.title, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `profile with name ${req.params.title} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving profile with name " + req.params.title
        });
      }
    } else {
      res.send(data);
    }
  });
};


exports.getExpertise = (req, res) => {
  Project.getExpertise((err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving expertise."
      });
    } else {
      res.send(data);
    }
  });
};
// Update the profile by ID
exports.updateOne = (req, res) => {

  Project.updateById(req.params.id, req.body, req.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `profile with id ${req.params.id} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving profile with id " + req.params.id
        });
      }
    } else {
      res.send(data);
    }
  });
};
exports.uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({
      message: "No image file uploaded."
    });
  }

  try {
    const profileId = req.params.id;
    const filePath = `profiles/profile-${profileId}-${Date.now()}.webp`;

    const compressedBuffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: "cover" })
      .webp({ quality: 75 })
      .toBuffer();

    const imageUrl = await uploadToSupabase(
      filePath,
      compressedBuffer,
      "image/webp"
    );

    res.send({
      profile_image_url: imageUrl
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);

    res.status(500).send({
      message: error.message || "Error processing profile image."
    });
  }
};

// Retrieve a single profile by ID
exports.deleteOne = (req, res) => {
  Project.deleteById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `profile with id ${req.params.id} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving profile with id " + req.params.id
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Delete all profiles
exports.deleteAll = (req, res) => {
  Project.eraseAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while deleting all profiles."
      });
    } else {
      res.send(data);
    }
  });
};
