import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function MembershipRequest() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    api
      .get("/auth/membership-requests")
      .then((response) => {
        const pendingUsers = response.data.data || response.data || [];
        setUsers(pendingUsers.filter((user) => Number(user.active) === 2));
      })
      .catch((error) => {
        console.error("Error fetching membership requests:", error);
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (!localStorage.getItem("token")) return null;

  return (
    <div className="book-list">
      <div className="page-header">
        <h2>Membership Requests</h2>
      </div>

      {loading ? (
        <p>Loading membership requests...</p>
      ) : users.length === 0 ? (
        <p>No users with active = 2.</p>
      ) : (
        <div className="profile-card-grid">
          {users.map((user) => (
            <article className="profile-card" key={user.id}>
              <div className="profile-avatar">
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>

              <div className="profile-card-body">
                <h3>{user.username || "Unknown user"}</h3>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Status:</strong> Pending approval</p>
                <p><strong>Active:</strong> {user.active}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MembershipRequest;
