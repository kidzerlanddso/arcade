module.exports = app => {
  const employment = require("../controllers/employment.controller.js");
  const { verifyToken } = require("../middleware/authJwt.js");

  // Get employment history for one user
  app.get("/employment/user/:userId", employment.findByUserId);

  // Add new employment record
  app.post("/employment", verifyToken, employment.create);
  // Delete an employment record
app.delete("/employment/:id", verifyToken, employment.deleteOne);
};