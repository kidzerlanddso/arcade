module.exports = app => {
  const data = require("../controllers/data.controller.js");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt.js");

  app.get("/data/dynamicdata", verifyToken, verifyAdmin, data.getDynamicData);
  app.get("/data/dynamicdata/:id/subcategories", verifyToken, verifyAdmin, data.getExpertiseSubcategories);
  app.post("/data/addExpertise", verifyToken, verifyAdmin, data.addExpertise);
  app.post("/data/dynamicdata/:id/subcategories", verifyToken, verifyAdmin, data.addExpertiseSubcategory);
  app.put("/data/dynamicdata/:id", verifyToken, verifyAdmin, data.updateExpertise);
  app.put("/data/dynamicdata/subcategories/:id", verifyToken, verifyAdmin, data.updateExpertiseSubcategory);
  app.delete("/data/dynamicdata/:name", verifyToken, verifyAdmin, data.deleteDynamicData);
  app.delete("/data/dynamicdata/subcategories/:id", verifyToken, verifyAdmin, data.deleteExpertiseSubcategory);
};
