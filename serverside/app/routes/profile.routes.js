module.exports = app => {
  const projects = require("../controllers/profile.controller.js");
  //const profile = require("../controllers/profile.controller");
  const { verifyToken } = require("../middleware/authJwt.js");

  

  // Retrieve all profile
  app.get("/profile", projects.findAll);

  // Retrieve a single profile by ID
  app.get("/profile/:id", projects.findOne);

  // Retrieve a single profile by Name
  app.get("/profile/title/:title", projects.findName);

  
  //valid JWT required
  // Create a new profile
  app.post("/profile", verifyToken, projects.create);
  // Update by ID. using PATCH to avoid null values
  app.patch("/profile/:id", verifyToken, projects.updateOne);

  // delete by ID
  app.delete("/profile/:id", verifyToken, projects.deleteOne);

  // delete All
  app.delete("/profile", verifyToken, projects.deleteAll);
};
