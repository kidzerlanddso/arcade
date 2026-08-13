const Project = require("../models/books.model");
 
// TODO: complete the code as per the instructions given README.md

// Create and save a new Book
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({ message: "Content cannot be empty!" });
    return;
  }

  // Create a Book object
  const newBook = new Project({
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    price: req.body.price,
    stock: req.body.stock
  });

  // Save Book in the database
  Project.create(newBook, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Book."
      });
    } else {
      res.send(data);
    }
  });
};

// Retrieve all Books
exports.findAll = (req, res) => {
  Project.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving books."
      });
    } else {
      res.send(data);
    }
  });
};

// Retrieve a single Book by ID
exports.findOne = (req, res) => {
  Project.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Book with id ${req.params.id} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Book with id " + req.params.id
        });
      }
    } else {
      res.send(data);
    }
  });
};


// Retrieve a single Book by name
exports.findName = (req, res) => {
  Project.findByName(req.params.title, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Book with name ${req.params.title} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Book with name " + req.params.title
        });
      }
    } else {
      res.send(data);
    }
  });
};



// Update the book by ID
exports.updateOne = (req, res) => {

  Project.updateById(req.params.id, req.body, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Book with id ${req.params.id} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Book with id " + req.params.id
        });
      }
    } else {
      res.send(data);
    }
  });
};


// Retrieve a single Book by ID
exports.deleteOne = (req, res) => {
  Project.deleteById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Book with id ${req.params.id} not found.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Book with id " + req.params.id
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Delete all Books
exports.deleteAll = (req, res) => {
  Project.eraseAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while deleting all books."
      });
    } else {
      res.send(data);
    }
  });
};
