module.exports = (app) => {
  const events = require("../controllers/event.controller.js");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt.js");
  const upload = require("../middleware/upload");

  app.get("/events", verifyToken, events.findAll);
  app.get("/events/attendees", verifyToken, verifyAdmin, events.allAttendees);
  app.get("/events/:id/join-status", verifyToken, events.joinStatus);
  app.post("/events/:id/join", verifyToken, events.join);
  app.get("/events/:id/attendees", verifyToken, verifyAdmin, events.attendees);
  app.post("/events/:id/image", verifyToken, verifyAdmin, upload.single("eventImage"), events.uploadImage);
  app.patch("/events/registrations/:registrationId", verifyToken, verifyAdmin, events.updateRegistration);
  app.post("/events", verifyToken, verifyAdmin, events.create);
  app.patch("/events/:id", verifyToken, verifyAdmin, events.update);
};
