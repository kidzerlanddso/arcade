module.exports = app => {
  const education = require("../controllers/education.controller.js");
  const { verifyToken } = require("../middleware/authJwt.js");

  // Get education history for one user
  app.get("/education/user/:userId", education.findByUserId);

  // Add new education record
  app.post("/education", verifyToken, education.create);

  // Delete an education record
  app.delete("/education/:id", verifyToken, education.delete);
};