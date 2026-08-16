import { useState, useEffect } from "react";

import api from "../api/axios";
// const API_URL = "http://localhost:3001";
import { Link, useNavigate } from "react-router-dom";

function BookList() {
   const navigate = useNavigate(); 
  const [books, setBooks] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get("/books")
      .then(response => {
        const booksData = response.data.data || response.data;

        setBooks(booksData);
        console.log(response.data);
      
      })
      .catch(error => {
        console.error("Error fetching books:", error);
      });
  }, []);

  
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
    
  };

  return (
       {token && ( <div className="book-list">
            
            <h2>List of Books 1</h2>
            <div className="row-wrapper">         
                  <div className="column-6">
                        {token && ( <nav>
                            <Link className="link-color" to="/books/new">Create Book</Link> <br/>
                        </nav>
                        )}
                  </div>
                  <div className="column-6">
                        {token && (
                        <button className="logout-button" onClick={logout}>
                            Logout
                        </button>            
                        )}
                  </div>
             </div>
            
            
            
            <br/>

            <table  className="book-table">
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Genre</th>
                        <th>Price</th>
                        <th>Stock</th>
                        {token && (<th colSpan={2}>Action</th> )}
                    </tr>

            {books.map((book) => (
                
                <tr key={book.id}>
                    
                        <td>{book.id}</td>
                        <td><h4>{book.title}</h4></td>
                        <td>{book.author}</td>
                        <td>{book.genre}</td>
                        <td>{book.price}</td>
                        <td>{book.stock}</td>
                        <td>
                            <Link to={`/books/edit/${book.id}`}>
                                Edit
                            </Link>
                            
                        </td>
                        <td>
                            <Link className="link-color" to={`/books/delete/${book.id}`}>
                                Delete
                            </Link>              
                        </td>
                        
                </tr>
                
            )
            
            )}
            </table>

        </div>
        )}
  );
}
export default BookList;