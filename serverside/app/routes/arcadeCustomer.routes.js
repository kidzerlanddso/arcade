module.exports = (app) => {
  const controller = require("../controllers/arcadeCustomer.controller.js");
  const { verifyToken, verifyAdmin, verifySparkles } = require("../middleware/authJwt.js");
  const requireAdmin = [verifyToken, verifyAdmin];

  app.get("/arcade/dashboard/stats", ...requireAdmin, controller.getDashboardStats);
  app.get("/arcade/customers", ...requireAdmin, controller.getCustomers);
  app.get("/arcade/customers/:id", ...requireAdmin, controller.getCustomerById);
  app.post("/arcade/customers", ...requireAdmin, controller.createCustomer);
  app.put("/arcade/customers/:id", ...requireAdmin, controller.updateCustomer);
  app.delete("/arcade/customers/:id", ...requireAdmin, controller.deleteCustomer);

  app.post("/arcade/customers/:customerId/contacts", ...requireAdmin, controller.createContact);

  app.post("/arcade/fees", ...requireAdmin, controller.createFee);
  app.post("/arcade/fees/generate-monthly", ...requireAdmin, controller.generateMonthlyFees);
  app.put("/arcade/fees/:id", ...requireAdmin, controller.updateFee);
  app.delete("/arcade/fees/:id", ...requireAdmin, controller.deleteFee);

  app.post("/arcade/payments", ...requireAdmin, controller.createPayment);
  app.put("/arcade/payments/:id", ...requireAdmin, controller.updatePayment);
  app.delete("/arcade/payments/:id", ...requireAdmin, controller.deletePayment);
  app.get("/arcade/payments/report", ...requireAdmin, controller.getPaymentReport);
  app.get("/arcade/sparkles/daily-payments", verifyToken, verifySparkles, controller.getSparklesDailyPayments);
  app.post("/arcade/sparkles/daily-payments", verifyToken, verifySparkles, controller.createSparklesDailyPayment);
  app.put("/arcade/sparkles/daily-payments/:id", verifyToken, verifySparkles, controller.updateSparklesDailyPayment);
  app.delete("/arcade/sparkles/daily-payments/:id", verifyToken, verifySparkles, controller.deleteSparklesDailyPayment);
};
