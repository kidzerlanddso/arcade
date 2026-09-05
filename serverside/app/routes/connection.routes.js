module.exports = (app) => {
    const connection = require("../controllers/connection.controller.js");
    const { verifyToken } = require("../middleware/authJwt.js");
  
    app.post("/connection", verifyToken, connection.sendRequest);
    app.get("/connection/me", verifyToken, connection.getMyConnections);
    app.get("/connection/pending", verifyToken, connection.getPending);
    app.get("/connection/status/:userId", verifyToken, connection.getStatus);
    app.patch("/connection/:id/accept", verifyToken, connection.acceptRequest);
    app.patch("/connection/:id/reject", verifyToken, connection.rejectRequest);
    app.delete("/connection/:id", verifyToken, connection.cancelRequest);
  };