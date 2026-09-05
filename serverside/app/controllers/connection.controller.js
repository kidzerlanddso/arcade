const Connection = require("../models/connection.model");

exports.sendRequest = (req, res) => {
  const receiverId = Number(req.body.receiver_id);
  const requesterId = Number(req.userId);

  if (!receiverId) {
    res.status(400).send({ message: "receiver_id is required." });
    return;
  }

  if (receiverId === requesterId) {
    res.status(400).send({ message: "You cannot connect with yourself." });
    return;
  }

  Connection.findBetweenUsers(requesterId, receiverId, (err, existing) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error checking existing connection.",
      });
      return;
    }

    if (!existing) {
      const connection = new Connection({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: "pending",
      });

      Connection.create(connection, (createErr, data) => {
        if (createErr) {
          res.status(500).send({
            message: createErr.message || "Error sending connection request.",
          });
          return;
        }

        res.status(201).send(data);
      });
      return;
    }

    if (existing.status === "accepted") {
      res.status(400).send({ message: "You are already connected." });
      return;
    }

    if (existing.status === "pending") {
      if (existing.requester_id === requesterId) {
        res.status(400).send({ message: "Connection request already sent." });
        return;
      }

      res.status(400).send({
        message: "This user already sent you a connection request.",
      });
      return;
    }

    if (existing.status === "rejected" || existing.status === "cancelled") {
      Connection.updateStatus(existing.id, "pending", (updateErr, data) => {
        if (updateErr) {
          if (updateErr.kind === "not_found") {
            res.status(404).send({ message: "Connection request not found." });
            return;
          }

          res.status(500).send({
            message: updateErr.message || "Error resending connection request.",
          });
          return;
        }

        res.send(data);
      });
      return;
    }

    res.status(400).send({ message: "Unable to send connection request." });
  });
};

exports.getMyConnections = (req, res) => {
  Connection.findAcceptedByUserId(req.userId, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error retrieving connections.",
      });
      return;
    }

    res.send(data);
  });
};

exports.getPending = (req, res) => {
  Connection.findPendingSentByUserId(req.userId, (sentErr, sent) => {
    if (sentErr) {
      res.status(500).send({
        message: sentErr.message || "Error retrieving sent requests.",
      });
      return;
    }

    Connection.findPendingReceivedByUserId(req.userId, (receivedErr, received) => {
      if (receivedErr) {
        res.status(500).send({
          message: receivedErr.message || "Error retrieving received requests.",
        });
        return;
      }

      res.send({
        sent: sent || [],
        received: received || [],
      });
    });
  });
};

exports.getStatus = (req, res) => {
  const otherUserId = Number(req.params.userId);
  const currentUserId = Number(req.userId);

  if (!otherUserId) {
    res.status(400).send({ message: "userId is required." });
    return;
  }

  if (otherUserId === currentUserId) {
    res.send({
      status: "self",
      connectionId: null,
      direction: null,
    });
    return;
  }

  Connection.findBetweenUsers(currentUserId, otherUserId, (err, existing) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Error retrieving connection status.",
      });
      return;
    }

    if (!existing) {
      res.send({
        status: "none",
        connectionId: null,
        direction: null,
      });
      return;
    }

    let direction = null;

    if (existing.status === "pending") {
      direction =
        existing.requester_id === currentUserId ? "sent" : "received";
    }

    res.send({
      status: existing.status,
      connectionId: existing.id,
      direction,
    });
  });
};

exports.acceptRequest = (req, res) => {
  const connectionId = Number(req.params.id);

  Connection.findById(connectionId, (err, connection) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: "Connection request not found." });
        return;
      }

      res.status(500).send({
        message: err.message || "Error retrieving connection request.",
      });
      return;
    }

    if (connection.receiver_id !== req.userId) {
      res.status(403).send({
        message: "Only the receiver can accept this request.",
      });
      return;
    }

    if (connection.status !== "pending") {
      res.status(400).send({
        message: "Only pending requests can be accepted.",
      });
      return;
    }

    Connection.updateStatus(connectionId, "accepted", (updateErr, data) => {
      if (updateErr) {
        res.status(500).send({
          message: updateErr.message || "Error accepting connection request.",
        });
        return;
      }

      res.send(data);
    });
  });
};

exports.rejectRequest = (req, res) => {
  const connectionId = Number(req.params.id);

  Connection.findById(connectionId, (err, connection) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: "Connection request not found." });
        return;
      }

      res.status(500).send({
        message: err.message || "Error retrieving connection request.",
      });
      return;
    }

    if (connection.receiver_id !== req.userId) {
      res.status(403).send({
        message: "Only the receiver can reject this request.",
      });
      return;
    }

    if (connection.status !== "pending") {
      res.status(400).send({
        message: "Only pending requests can be rejected.",
      });
      return;
    }

    Connection.updateStatus(connectionId, "rejected", (updateErr, data) => {
      if (updateErr) {
        res.status(500).send({
          message: updateErr.message || "Error rejecting connection request.",
        });
        return;
      }

      res.send(data);
    });
  });
};

exports.cancelRequest = (req, res) => {
  const connectionId = Number(req.params.id);

  Connection.findById(connectionId, (err, connection) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: "Connection request not found." });
        return;
      }

      res.status(500).send({
        message: err.message || "Error retrieving connection request.",
      });
      return;
    }

    const isRequester = connection.requester_id === req.userId;
    const isReceiver = connection.receiver_id === req.userId;

    if (!isRequester && !isReceiver) {
      res.status(403).send({
        message: "You are not allowed to modify this connection.",
      });
      return;
    }

    if (connection.status === "pending" && !isRequester) {
      res.status(403).send({
        message: "Only the sender can cancel a pending request.",
      });
      return;
    }

    if (connection.status !== "pending" && connection.status !== "accepted") {
      res.status(400).send({
        message: "Only pending or accepted connections can be cancelled.",
      });
      return;
    }

    Connection.updateStatus(connectionId, "cancelled", (updateErr, data) => {
      if (updateErr) {
        res.status(500).send({
          message: updateErr.message || "Error cancelling connection.",
        });
        return;
      }

      res.send({
        message: "Connection cancelled successfully.",
        connection: data,
      });
    });
  });
};