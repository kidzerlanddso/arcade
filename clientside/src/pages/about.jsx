import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AboutAlumniConnect() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="book-list"
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2rem 1rem 3rem",
      }}
    >
      <div
        style={{
          marginBottom: "2rem",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        }}
      >
        <img
          src="https://www.rhs.school.nz/edit/cache/images/096rg073a6854--w_1600-h_1067-e_jpg-cp_center-cs_5063.jpg"
          alt="Rototuna High School community"
          style={{
            width: "100%",
            height: "360px",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <h1>About Alumni Connect</h1>
      <p>
        Alumni Connect is a platform designed to connect alumni of Rototuna High
        School. It provides a space for alumni to network, share experiences,
        and stay updated with the latest news and events related to their alma
        mater.
      </p>
      <p>
        The platform offers features such as user profiles, discussion forums,
        event listings, and more. Alumni can create and manage their profiles,
        connect with fellow alumni, and participate in discussions on topics of
        interest.
      </p>
      <p>
        Our goal is to foster a strong alumni community, enabling members to
        maintain connections, collaborate on projects, and support each other's
        professional and personal growth.
      </p>
      <p>
        We are committed to providing a safe and inclusive environment for all
        alumni, and we encourage active participation and engagement from our
        members. Join us today and be a part of the Alumni Connect community!
      </p>
    </div>
  );
}

export default AboutAlumniConnect;
