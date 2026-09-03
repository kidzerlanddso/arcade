const Education = require("../models/education.model");

// Get all education records for one user
exports.findByUserId = (req, res) => {
  Education.findByUserId(req.params.userId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error retrieving education history."
      });
      return;
    }

    res.send(data);
  });
};

// Create a new education record
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content cannot be empty!"
    });
    return;
  }

  const education = new Education({
    user_id: req.body.user_id,
    institution: req.body.institution,
    qualification: req.body.qualification,
    field_of_study: req.body.field_of_study,
    start_date: req.body.start_date,
    end_date: req.body.end_date || null,
    description: req.body.description
  });

  Education.create(education, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error creating education record."
      });
      return;
    }

    res.send(data);
  });
};
// Update an education record
exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content cannot be empty!"
    });
    return;
  }

  const education = new Education({
    institution: req.body.institution,
    qualification: req.body.qualification,
    field_of_study: req.body.field_of_study,
    start_date: req.body.start_date,
    end_date: req.body.end_date || null,
    description: req.body.description
  });

  Education.updateById(req.params.id, education, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Education record with id ${req.params.id} was not found.`
        });
        return;
      }

      res.status(500).send({
        message: err.message || "Error updating education record."
      });
      return;
    }

    res.send(data);
  });
};
// Delete an education record
exports.delete = (req, res) => {
  Education.deleteById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Education record with id ${req.params.id} was not found.`
        });
        return;
      }

      res.status(500).send({
        message: err.message || "Error deleting education record."
      });
      return;
    }

    res.send({
      message: "Education record deleted successfully.",
      data: data
    });
  });
};