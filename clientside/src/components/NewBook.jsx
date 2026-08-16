import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function NewBook() {
  const navigate = useNavigate();

  const [book, setBook] = useState({
    title: "",
    author: "",
    genre: "",
    price: "",
    stock: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/books", book);
      alert("New Book Added successfully");
      navigate("/books");
    } catch (error) {
      console.error(error);
      alert("Error adding book");
    }
  };

  return (
    <div className="book-form">
      <h2>Create New Book</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" value={book.title} onChange={handleChange} placeholder="Title" />
        <input name="author" value={book.author} onChange={handleChange} placeholder="Author" />
        <input name="genre" value={book.genre} onChange={handleChange} placeholder="Genre" />
        <input name="price" value={book.price} onChange={handleChange} placeholder="Price" />
        <input name="stock" value={book.stock} onChange={handleChange} placeholder="Stock" />
        <button className="my-button" type="submit">
          Add Book
        </button>
      </form>
    </div>
  );
}

export default NewBook;
