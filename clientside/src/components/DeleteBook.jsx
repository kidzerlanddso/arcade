import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

function DeleteBook() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [book, setBook] = useState({
    title: "",
    author: "",
    genre: "",
    price: "",
    stock: ""
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBook();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.delete(`/books/${id}`);
      alert("Book deleted successfully");
      navigate("/books");
    } catch (error) {
      console.error(error);
      alert("Error deleting book");
    }
  };

  return (
    <div className="book-form">
      <h2>Delete Book</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" readOnly value={book.title} />
        <input name="author" readOnly value={book.author} />
        <input name="genre" readOnly value={book.genre} />
        <input name="price" readOnly value={book.price} />
        <input name="stock" readOnly value={book.stock} />
        <button className="delete-button" type="submit">
          Delete Book
        </button>
      </form>
    </div>
  );
}

export default DeleteBook;