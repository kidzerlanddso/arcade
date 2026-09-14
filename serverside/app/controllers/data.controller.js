const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const Profile = require("../models/profile.model.js");
const Data = require("../models/data.model.js");
const config = require("../config/db.config.js");

exports.getDynamicData = function(req, res) {
  Data.getDynamicData(function(err, data) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to load dynamic data."
      });
    }

    return res.status(200).send({
      data: data || []
    });
  });
};

exports.getExpertiseSubcategories = function(req, res) {
  const expertiseId = Number(req.params.id);

  if (!Number.isInteger(expertiseId) || expertiseId <= 0) {
    return res.status(400).send({ message: "A valid expertise ID is required." });
  }

  Data.getExpertiseSubcategories(expertiseId, function(err, data) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to load expertise subcategories."
      });
    }

    return res.status(200).send({
      data: data || []
    });
  });
};

exports.addExpertise = function(req, res) {
  const expertise = String(req.body?.expertise || "").trim();

  if (!expertise) {
    return res.status(400).send({ message: "Expertise value is required." });
  }

  Data.addExpertise(expertise, function(err, data) {
    if (err) {
      return res.status(500).send({
        message: err.message || "Unable to add expertise."
      });
    }

    return res.status(200).send({
      message: "Expertise added successfully.",
      data: data || []
    });
  });
};

exports.addExpertiseSubcategory = function(req, res) {
  const expertiseId = Number(req.params.id);
  const subcategory = String(req.body?.subcategory || "").trim();

  if (!Number.isInteger(expertiseId) || expertiseId <= 0) {
    return res.status(400).send({ message: "A valid expertise ID is required." });
  }

  if (!subcategory) {
    return res.status(400).send({ message: "Subcategory value is required." });
  }

  Data.createExpertiseSubcategory(expertiseId, subcategory, function(err, data) {
    if (err) {
      if (err.code === "23503") {
        return res.status(404).send({ message: "Selected expertise was not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to add expertise subcategory."
      });
    }

    return res.status(200).send({
      message: "Subcategory added successfully.",
      data
    });
  });
};

exports.updateExpertise = function(req, res) {
  const expertiseId = Number(req.params.id);
  const expertise = String(req.body?.expertise || "").trim();

  if (!Number.isInteger(expertiseId) || expertiseId <= 0) {
    return res.status(400).send({ message: "A valid expertise ID is required." });
  }

  if (!expertise) {
    return res.status(400).send({ message: "Expertise value is required." });
  }

  Data.updateExpertise(expertiseId, expertise, function(err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({ message: "Expertise was not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to update expertise."
      });
    }

    return res.status(200).send({
      message: "Expertise updated successfully.",
      data
    });
  });
};

exports.updateExpertiseSubcategory = function(req, res) {
  const subcategoryId = Number(req.params.id);
  const subcategory = String(req.body?.subcategory || "").trim();

  if (!Number.isInteger(subcategoryId) || subcategoryId <= 0) {
    return res.status(400).send({ message: "A valid subcategory ID is required." });
  }

  if (!subcategory) {
    return res.status(400).send({ message: "Subcategory value is required." });
  }

  Data.updateExpertiseSubcategory(subcategoryId, subcategory, function(err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({ message: "Subcategory was not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to update subcategory."
      });
    }

    return res.status(200).send({
      message: "Subcategory updated successfully.",
      data
    });
  });
};

exports.deleteDynamicData = function(req, res) {
  const expertiseName = decodeURIComponent(req.params.name || "").trim();

  if (!expertiseName) {
    return res.status(400).send({ message: "A valid expertise value is required." });
  }

  Data.deleteDynamicData(expertiseName, function(err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({ message: "Selected expertise was not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to delete selected expertise."
      });
    }

    return res.status(200).send({
      message: "Selected expertise removed.",
      data: data || []
    });
  });
};

exports.deleteExpertiseSubcategory = function(req, res) {
  const subcategoryId = Number(req.params.id);

  if (!Number.isInteger(subcategoryId) || subcategoryId <= 0) {
    return res.status(400).send({ message: "A valid subcategory ID is required." });
  }

  Data.deleteExpertiseSubcategory(subcategoryId, function(err, data) {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(404).send({ message: "Subcategory was not found." });
      }

      return res.status(500).send({
        message: err.message || "Unable to delete subcategory."
      });
    }

    return res.status(200).send({
      message: "Subcategory deleted successfully.",
      data
    });
  });
};