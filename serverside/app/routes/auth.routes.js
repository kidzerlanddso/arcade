module.exports = app => {
  const auth = require("../controllers/auth.controller");

  app.post("/auth/register", auth.register);
  app.post("/auth/login", auth.login);
  app.post("/auth/refresh", auth.refresh);
  app.post("/auth/logout", auth.logout); 
  app.get("/auth/membership-requests", auth.getMembershipRequests);
};
