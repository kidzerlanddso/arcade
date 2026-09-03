module.exports = (app) => {
  const events = require("../controllers/event.controller.js");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt.js");

  app.get("/events", verifyToken, events.findAll);
  app.post("/events", verifyToken, verifyAdmin, events.create);
  app.patch("/events/:id", verifyToken, verifyAdmin, events.update);
};
