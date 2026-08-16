import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

function EditBook() {
  const [book, setBook] = useState({
    title: "",
    author: "",
    genre: "",
    price: "",
    stock: ""
  });

  const navigate = useNavigate();
  const { id } = useParams();

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.patch(`/books/${id}`, book);
      alert("Book updated successfully");
      navigate("/books");
    } catch (error) {
      console.error(error);
      alert("Error updating book");
    }
  };

  return (
    <div className="book-form">
      <h2>Edit Book</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" onChange={handleChange} value={book.title} />
        <input name="author" onChange={handleChange} value={book.author} />
        <input name="genre" onChange={handleChange} value={book.genre} />
        <input name="price" onChange={handleChange} value={book.price} />
        <input name="stock" onChange={handleChange} value={book.stock} />
        <button className="my-button" type="submit">
          Update Book
        </button>
      </form>
    </div>
  );
}

export default EditBook;