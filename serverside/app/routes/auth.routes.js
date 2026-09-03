module.exports = app => {
  const auth = require("../controllers/auth.controller");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt.js");

  app.post("/auth/register", auth.register);
  app.post("/auth/RegisterAdmin", verifyToken, verifyAdmin, auth.RegisterAdmin);
  app.post("/auth/login", auth.login);
  app.post("/auth/refresh", auth.refresh);
  app.post("/auth/logout", auth.logout); 
  app.get("/auth/membership-requests", verifyToken, verifyAdmin, auth.getMembershipRequests);
  app.get("/admin", verifyToken, verifyAdmin, auth.getAdmins);
  app.patch("/auth/user/enable-email", verifyToken, auth.updateEnableEmail);
  app.put("/auth/membership-requests/:id/approve", verifyToken, verifyAdmin, auth.approveMembershipRequest);
  app.put("/auth/membership-requests/bulk-approve", verifyToken, verifyAdmin, auth.approveMembershipRequests);
};
