const Employment = require("../models/employment.model");

// Get all employment records for one user
exports.findByUserId = (req, res) => {
  Employment.findByUserId(req.params.userId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error retrieving employment history."
      });
      return;
    }

    res.send(data);
  });
};

// Create a new employment record
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content cannot be empty!"
    });
    return;
  }

  const employment = new Employment({
    user_id: req.body.user_id,
    company: req.body.company,
    job_title: req.body.job_title,
    start_date: req.body.start_date,
    end_date: req.body.end_date || null,
    description: req.body.description
  });

  Employment.create(employment, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error creating employment record."
      });
      return;
    }

    res.send(data);
  });
};
exports.deleteOne = (req, res) => {
  Employment.deleteById(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error deleting employment record."
      });
      return;
    }

    res.send({
      message: "Employment record deleted successfully."
    });
  });
};