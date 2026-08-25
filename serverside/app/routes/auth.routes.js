module.exports = app => {
  const auth = require("../controllers/auth.controller");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt.js");

  app.post("/auth/register", auth.register);
  app.post("/auth/login", auth.login);
  app.post("/auth/refresh", auth.refresh);
  app.post("/auth/logout", auth.logout); 
  app.get("/auth/membership-requests", verifyToken, verifyAdmin, auth.getMembershipRequests);
  app.put("/auth/membership-requests/:id/approve", verifyToken, verifyAdmin, auth.approveMembershipRequest);
};
