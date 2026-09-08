const Event = require("../models/event.model");
const sharp = require("sharp");
const { uploadProfileImage: uploadToStorage } = require("../services/supabaseStorage");

const requiredFields = ["title", "date", "startTime", "endTime", "location", "description"];

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

exports.uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).send({ message: "No image file uploaded." });

  try {
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: "cover" })
      .webp({ quality: 75 })
      .toBuffer();
    const imagePath = `events/event-${req.params.id}-${Date.now()}.webp`;
    const imageUrl = await uploadToStorage(imagePath, compressedBuffer, "image/webp");

    Event.updateImage(req.params.id, imageUrl, (error, event) => {
      if (error) return res.status(error.kind === "not_found" ? 404 : 500).send({ message: error.kind === "not_found" ? "Event not found." : error.message });
      res.send(event);
    });
  } catch (error) {
    console.error("Error processing event image:", error);
    res.status(500).send({ message: error.message || "Unable to process event image." });
  }
};

exports.join = (req, res) => {
  if (req.isAdmin) {
    res.status(403).send({ message: "Administrators cannot register for events." });
    return;
  }

  Event.join(req.params.id, req.userId, (err, data) => {
    if (err) {
      if (err.kind === "event_not_found") {
        res.status(404).send({ message: "Event not found." });
        return;
      }

      res.status(500).send({ message: err.message || "Unable to join event." });
      return;
    }

    res.status(data.alreadyJoined ? 200 : 201).send({ joined: true, ...data });
  });
};

exports.joinStatus = (req, res) => {
  Event.hasJoined(req.params.id, req.userId, (err, joined) => {
    if (err) {
      res.status(500).send({ message: err.message || "Unable to load event registration." });
      return;
    }

    res.send({ joined: Boolean(joined), joinedAt: joined?.joinedAt || null });
  });
};

exports.updateRegistration = (req, res) => {
  const allowedStatuses = ["pending", "confirmed", "cancelled"];
  const status = req.body?.status;
  const attended = req.body?.attended;

  if (!allowedStatuses.includes(status) || typeof attended !== "boolean") {
    res.status(400).send({ message: "A valid status and attendance value are required." });
    return;
  }

  Event.updateRegistration(req.params.registrationId, { status, attended }, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: "Registration not found." });
        return;
      }

      res.status(500).send({ message: err.message || "Unable to update registration." });
      return;
    }

    res.send(data);
  });
};

exports.attendees = (req, res) => {
  Event.getAttendees(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Unable to load event attendees." });
      return;
    }

    res.send(data);
  });
};

exports.allAttendees = (req, res) => {
  Event.getAllAttendees((err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Unable to load event attendees." });
      return;
    }

    res.send(data);
  });
};
