module.exports = app => {
  const auth = require("../controllers/auth.controller");

  app.post("/auth/register", auth.register);
  app.post("/auth/login", auth.login);
};
