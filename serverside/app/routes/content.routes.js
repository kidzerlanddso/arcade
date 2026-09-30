module.exports = (app) => {
  const content = require("../controllers/content.controller");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt");
  const upload = require("../middleware/upload");

  app.get("/content/news", verifyToken, content.findNews);
  app.post("/content/news", verifyToken, verifyAdmin, content.createNews);
  app.patch("/content/news/:id", verifyToken, verifyAdmin, content.updateNews);
  app.post("/content/news/:id/image", verifyToken, verifyAdmin, upload.single("newsImage"), content.uploadNewsImage);
  app.delete("/content/news/:id", verifyToken, verifyAdmin, content.deleteNews);

  app.get("/content/teachers", verifyToken, content.findTeachers);
  app.get("/content/spotlights", verifyToken, content.findPublicSpotlights);
  app.get("/content/spotlights/admin", verifyToken, verifyAdmin, content.findAllSpotlightsForAdmin);
  app.get("/content/spotlights/:id", verifyToken, content.findSpotlightById);
  app.post("/content/spotlights", verifyToken, verifyAdmin, content.createGeneralSpotlight);
  app.get("/content/teachers/:teacherId/spotlights", verifyToken, verifyAdmin, content.findTeacherSpotlights);
  app.post("/content/teachers/:teacherId/spotlights", verifyToken, verifyAdmin, content.createSpotlight);
  app.patch("/content/spotlights/:id", verifyToken, verifyAdmin, content.updateSpotlight);
  app.post("/content/spotlights/:id/image", verifyToken, verifyAdmin, upload.single("spotlightImage"), content.uploadSpotlightImage);
  app.delete("/content/spotlights/:id", verifyToken, verifyAdmin, content.deleteSpotlight);
  app.post("/content/teachers", verifyToken, verifyAdmin, content.createTeacher);
  app.patch("/content/teachers/:id", verifyToken, verifyAdmin, content.updateTeacher);
  app.post("/content/teachers/:id/image", verifyToken, verifyAdmin, upload.single("teacherImage"), content.uploadTeacherImage);
  app.delete("/content/teachers/:id", verifyToken, verifyAdmin, content.deleteTeacher);
};
