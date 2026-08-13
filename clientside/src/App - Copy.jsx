import { useState, useEffect } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import BookList from "./components/BookList";
import NewBook from "./components/NewBook";
import EditBook from "./components/EditBook";
import DeleteBook from "./components/DeleteBook";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import './css/style.scss';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [count, setCount] = useState(0)

  const token = localStorage.getItem("token");
 

  return (
    <>
    

      <Routes>

        <Route path="/login" element={
            <section id="center">        
              <div className="row-wrapper">         
                  <div className="column-6"><Register /></div>
                  <div className="column-6"><Login /></div>
              </div>
              <hr />
              <div className="row-wrapper"> 
                  <hr />
                  <BookList />
              </div>        
            </section>
        } />

        {/* Protected Route */}
        <Route
          path="/books"
          element={token ? <BookList /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/login" />} />

        <Route path="/books/new" element={<NewBook />} />

        <Route path="/books/edit/:id" element={
          localStorage.getItem("token")
            ? <EditBook />
            : <Navigate to="/" />
        } />
        <Route path="/books/delete/:id"  element={
          localStorage.getItem("token")
            ? <DeleteBook />
            : <Navigate to="/" />
        } />

      </Routes>

    </>
  )
}

export default App
