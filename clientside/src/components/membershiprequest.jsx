import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function MembershipRequest() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

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

  const handleApprove = async (userId) => {
    setApprovingId(userId);

    try {
      await api.put(`/auth/membership-requests/${userId}/approve`);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error approving membership request:", error);
      alert(error.response?.data?.message || "Unable to approve membership request.");
    } finally {
      setApprovingId(null);
    }
  };

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
                <h3>
                  {[user.firstname, user.lastname].filter(Boolean).join(" ") || "Unknown user"}
                </h3>
                <p><strong>Username:</strong> {user.username || "-"}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Batch:</strong> {user.year || "-"}</p>
                <p><strong>Status:</strong> Pending approval</p>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleApprove(user.id)}
                  disabled={approvingId === user.id}
                >
                  {approvingId === user.id ? "Approving..." : "Approve Request"}
                </button>
                <button type="button" className="btn btn-danger">
                  Decline Request
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MembershipRequest;
