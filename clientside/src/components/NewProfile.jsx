import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function Newprofile() {
  const navigate = useNavigate();

  const [profile, setprofile] = useState({
    firstname: "",
    lastname: "",
    email: "",
    year: "",
    student_id: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setprofile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/profiles", profile);
      alert("New profile Added successfully");
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Error adding profile");
    }
  };

  return (
    <div className="book-form">
      <h2>Create New profile</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={profile.firstname} onChange={handleChange} placeholder="First Name" />
        <input name="lastname" value={profile.lastname} onChange={handleChange} placeholder="Last Name" />
        <input name="email" value={profile.email} onChange={handleChange} placeholder="Email" />
        <input name="year" value={profile.year} onChange={handleChange} placeholder="Year" />
        <input name="student_id" value={profile.student_id} onChange={handleChange} placeholder="Student ID" />
        <button className="my-button" type="submit">
          Add profile
        </button>
      </form>
    </div>
  );
}

export default Newprofile;
