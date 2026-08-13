const db = require("./db");

// TODO: complete the code as per the instructions given README.md

const Project = function(book) {
  this.title = book.title;
  this.author = book.author;
  this.genre = book.genre;
  this.price = book.price;
  this.stock = book.stock;
};

// CREATE a new book
Project.create = (newBook, result) => {
  db.query("INSERT INTO books SET ?", newBook, (err, res) => {
    if (err) {
      console.log("Create error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newBook });
  });
};

// RETRIEVE all books
Project.getAll = (result) => {
  db.query("SELECT * FROM books", (err, res) => {
    if (err) {
      console.log("GetAll error: ", err);
      result(err, null);
      return;
    }
    result(null, res);
  });
};

// RETRIEVE a book by ID
Project.findById = (id, result) => {
  db.query("SELECT * FROM books WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("FindById error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, res[0]);
      return;
    }

  });
};

// RETRIEVE a book by Name 
Project.findByName = (title, result) => {
  db.query("SELECT * FROM books WHERE title LIKE ?", [`%${title}%`], (err, res) => {
    if (err) {
      console.log("findByName error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, res);
      return;
    }

  });
};


// UPDATE a book by ID 
Project.updateById = (id, book, result) => {
  const fields = [];
  const values = [];

  for (const key in book) {
    fields.push(`${key} = ?`);
    values.push(book[key]);
  }

  values.push(id);

  db.query(`UPDATE books SET  ${fields.join(", ")} WHERE id = ?`, 
   values,
   (err, res) => {
      if (err) {
      console.log("Error while Updating : ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows === 0) {
      result({ kind: "not_found" }, null);
      return;
    }
  result(null, { id: id, ...book });
 }

  );
};


// DELETE a book by ID
Project.deleteById = (id, result) => {
  db.query("DELETE FROM books WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("Error while Deleting: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows === 0) {
      result({ kind: "NO such ID found" }, null);
      return;
    }

    result(null, res);
  });
};


// DELETE all books

Project.eraseAll = (result) => {
  db.query("DELETE FROM books", (err, res) => {
    if (err) {
      console.log("error while deleting: ", err);
      result(err, null);
      return;
    }
    result(null, res);
  });
};
module.exports = Project;