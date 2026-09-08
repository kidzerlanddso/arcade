module.exports = (app) => {
  const connection = require("../controllers/connection.controller.js");
  const { verifyToken } = require("../middleware/authJwt.js");

  // Connect is for alumni accounts only — admins cannot use it
  const rejectAdminConnect = (req, res, next) => {
    if (req.isAdmin) {
      return res.status(403).send({
        message: "Connect is not available for admin accounts.",
      });
    }
    next();
  };

  app.post(
    "/connection",
    verifyToken,
    rejectAdminConnect,
    connection.sendRequest,
  );
  app.get(
    "/connection/me",
    verifyToken,
    rejectAdminConnect,
    connection.getMyConnections,
  );
  app.get(
    "/connection/pending",
    verifyToken,
    rejectAdminConnect,
    connection.getPending,
  );
  app.get(
    "/connection/status/:userId",
    verifyToken,
    connection.getStatus,
  );
  app.patch(
    "/connection/:id/accept",
    verifyToken,
    rejectAdminConnect,
    connection.acceptRequest,
  );
  app.patch(
    "/connection/:id/reject",
    verifyToken,
    rejectAdminConnect,
    connection.rejectRequest,
  );
  app.delete(
    "/connection/:id",
    verifyToken,
    rejectAdminConnect,
    connection.cancelRequest,
  );
};
