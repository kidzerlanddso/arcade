const db = require("../models/db");

module.exports = (app) => {
  app.get("/country", (req, res) => {
    db.query(
      'SELECT "Code", "Name", "Continent" FROM public.country ORDER BY "Name" ASC',
      (err, result) => {
        if (err) {
          console.log("Country load error:", err);
          return res.status(500).send({
            message: "Error loading countries",
          });
        }

        res.send(result.rows);
      }
    );
  });
};