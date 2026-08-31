const Event = require("../models/event.model");

const requiredFields = ["title", "date", "startTime", "endTime", "location", "description", "price"];

const validateEvent = (body) => requiredFields.every((field) => body[field] !== undefined && body[field] !== "");

exports.findAll = (req, res) => {
  Event.findAll((err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Error retrieving events." });
      return;
    }

    res.send(data);
  });
};

exports.create = (req, res) => {
  if (!req.body || !validateEvent(req.body)) {
    res.status(400).send({ message: "All event fields are required." });
    return;
  }

  Event.create({ ...req.body, created_by: req.userId }, (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Error creating event." });
      return;
    }

    res.status(201).send(data);
  });
};

exports.update = (req, res) => {
  if (!req.body || !validateEvent(req.body)) {
    res.status(400).send({ message: "All event fields are required." });
    return;
  }

  Event.updateById(req.params.id, req.body, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `Event with id ${req.params.id} was not found.` });
        return;
      }

      res.status(500).send({ message: err.message || "Error updating event." });
      return;
    }

    res.send(data);
  });
};
