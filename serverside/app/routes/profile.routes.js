module.exports = app => {
  const projects = require("../controllers/profile.controller.js");
  //const profile = require("../controllers/profile.controller");
  const { verifyToken } = require("../middleware/authJwt.js");
  const upload = require("../middleware/upload");

  

  // Retrieve all profile
  app.get("/profile", projects.findAll);
  app.get("/profile/me", verifyToken, projects.findMine);
app.get("/profile/user/:userId", verifyToken, projects.findByUser);
app.get("/profile/expertise/options", verifyToken, projects.getExpertise);
app.get(
  "/profile/expertise/:expertiseId/subcategories",
  verifyToken,
  projects.getExpertiseSubcategories
);

  // Retrieve a single profile by Name
  app.get("/profile/title/:title", projects.findName);

  // Retrieve a single profile by ID
  app.get("/profile/:id", projects.findOne);

  
  //valid JWT required
  // Create a new profile
  app.post("/profile", verifyToken, projects.create);
  // Update by ID. using PATCH to avoid null values
  app.patch("/profile/:id", verifyToken, projects.updateOne);
  app.post(
  "/profile/:id/image",
  verifyToken,
  upload.single("profileImage"),
  projects.uploadProfileImage
);

  // delete by ID
  app.delete("/profile/:id", verifyToken, projects.deleteOne);

  // delete All
  app.delete("/profile", verifyToken, projects.deleteAll);
};
