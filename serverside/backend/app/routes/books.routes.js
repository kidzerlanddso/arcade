module.exports = app => {
  const projects = require("../controllers/books.controller.js");
  //const books = require("../controllers/books.controller");
  const { verifyToken } = require("../middleware/authJwt");

  

  // Retrieve all Books
  app.get("/books", projects.findAll);

  // Retrieve a single Book by ID
  app.get("/books/:id", projects.findOne);

  // Retrieve a single Book by Name
  app.get("/books/title/:title", projects.findName);

  
  //valid JWT required
  // Create a new Book
  app.post("/books", verifyToken, projects.create);
  // Update by ID. using PATCH to avoid null values
  app.patch("/books/:id", verifyToken, projects.updateOne);

  // delete by ID
  app.delete("/books/:id", verifyToken, projects.deleteOne);

  // delete All
  app.delete("/books", verifyToken, projects.deleteAll);
};
