module.exports = (app) => {
  const controller = require("../controllers/arcadePayables.controller.js");
  const { verifyToken, verifyAdmin } = require("../middleware/authJwt.js");

  app.get(
    "/arcade/payables",
    verifyToken,
    verifyAdmin,
    controller.getMonthlyPayables,
  );
  app.post(
    "/arcade/payables/expenses",
    verifyToken,
    verifyAdmin,
    controller.createExpense,
  );
  app.put(
    "/arcade/payables/expenses/:id",
    verifyToken,
    verifyAdmin,
    controller.updateExpense,
  );
  app.delete(
    "/arcade/payables/expenses/:id",
    verifyToken,
    verifyAdmin,
    controller.deleteExpense,
  );
};
