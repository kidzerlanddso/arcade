module.exports = app => {
  const auth = require("../controllers/auth.controller");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt.js");

  app.post("/auth/register", auth.register);
  app.get("/auth/google/config", auth.getGoogleConfig);
  app.post("/auth/google", auth.googleAuth);
  app.post("/auth/google/register", auth.googleRegister);
  app.post("/auth/RegisterAdmin", verifyToken, verifyAdmin, auth.RegisterAdmin);
  app.post("/auth/login", auth.login);
  app.post("/auth/refresh", auth.refresh);
  app.post("/auth/logout", auth.logout); 
  app.get("/auth/membership-requests", verifyToken, verifyAdmin, auth.getMembershipRequests);
  app.get("/admin", verifyToken, verifyAdmin, auth.getAdmins);
 // app.get("/data/dynamicdata", verifyToken, verifyAdmin, auth.getDynamicData);
 // app.post("/data/addExpertise", verifyToken, verifyAdmin, auth.addExpertise);
 // app.delete("/data/dynamicdata/:name", verifyToken, verifyAdmin, auth.deleteDynamicData);
  app.patch("/auth/user/enable-email", verifyToken, auth.updateEnableEmail);
  app.put("/auth/membership-requests/:id/approve", verifyToken, verifyAdmin, auth.approveMembershipRequest);
  app.put("/auth/membership-requests/:id/decline", verifyToken, verifyAdmin, auth.declineMembershipRequest);
  app.put("/auth/membership-requests/bulk-approve", verifyToken, verifyAdmin, auth.approveMembershipRequests);
  app.get("/auth/membership-requests/pending-requests", verifyToken, verifyAdmin, auth.getPendingMembershipRequests);
};

