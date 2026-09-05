module.exports = app => {
  const data = require("../controllers/data.controller.js");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt.js");


  app.get("/data/dynamicdata", verifyToken, verifyAdmin, data.getDynamicData);
  app.post("/data/addExpertise", verifyToken, verifyAdmin, data.addExpertise);
  app.put("/data/dynamicdata/:id", verifyToken, verifyAdmin, data.updateExpertise);
  app.delete("/data/dynamicdata/:name", verifyToken, verifyAdmin, data.deleteDynamicData);
};
