const db = require("./db");

const Project = function(book) {
  this.title = book.title;
  this.author = book.author;
  this.genre = book.genre;
  this.price = book.price;
  this.stock = book.stock;
};

Project.create = (newBook, result) => {
  db.query(
    "INSERT INTO books (title, author, genre, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [newBook.title, newBook.author, newBook.genre, newBook.price, newBook.stock],
    (err, res) => {
      if (err) {
        console.log("Create error: ", err);
        result(err, null);
        return;
      }
      result(null, { id: res.rows[0].id, ...res.rows[0] });
    }
  );
};

Project.getAll = (result) => {
  db.query("SELECT * FROM books", (err, res) => {
    if (err) {
      console.log("GetAll error: ", err);
      result(err, null);
      return;
    }
    result(null, res.rows);
  });
};

Project.findById = (id, result) => {
  db.query("SELECT * FROM books WHERE id = $1", [id], (err, res) => {
    if (err) {
      console.log("FindById error: ", err);
      result(err, null);
      return;
    }

    if (res.rows.length) {
      result(null, res.rows[0]);
      return;
    }

    result(null, null);
  });
};

Project.findByName = (title, result) => {
  db.query("SELECT * FROM books WHERE title ILIKE $1", [`%${title}%`], (err, res) => {
    if (err) {
      console.log("findByName error: ", err);
      result(err, null);
      return;
    }

    if (res.rows.length) {
      result(null, res.rows);
      return;
    }

    result(null, []);
  });
};

Project.updateById = (id, book, result) => {
  const entries = Object.entries(book);
  const fields = entries.map(([key], index) => `${key} = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  values.push(id);

  db.query(
    `UPDATE books SET ${fields.join(", ")} WHERE id = $${fields.length + 1} RETURNING *`,
    values,
    (err, res) => {
      if (err) {
        console.log("Error while Updating: ", err);
        result(err, null);
        return;
      }

      if (!res.rows.length) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, res.rows[0]);
    }
  );
};

Project.deleteById = (id, result) => {
  db.query("DELETE FROM books WHERE id = $1 RETURNING *", [id], (err, res) => {
    if (err) {
      console.log("Error while Deleting: ", err);
      result(err, null);
      return;
    }

    if (!res.rows.length) {
      result({ kind: "NO such ID found" }, null);
      return;
    }

    result(null, res.rows);
  });
};

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