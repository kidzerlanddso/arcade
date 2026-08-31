import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function MembershipRequest() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [approvingId, setApprovingId] = useState(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);


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

  const filteredProfiles = users.filter((user) => {
    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.toLowerCase();
    const city = `${user.current_city || ""}`.toLowerCase();
    const searchValue = searchTerm.toLowerCase().trim();
    const matchesSearch =
      searchValue === "" ||
      fullName.includes(searchValue) ||
      city.includes(searchValue);
    const profileYear = user.year || user.graduation_year;
    const matchesYear = selectedYear === "all" || String(profileYear) === String(selectedYear);

    return matchesSearch && matchesYear;
  });


  const handleProfileSelection = (userId) => {
    setSelectedProfileIds((selectedIds) => {
      const profileKey = String(userId);

      return selectedIds.includes(profileKey)
        ? selectedIds.filter((selectedId) => selectedId !== profileKey)
        : [...selectedIds, profileKey];
    });
  };

  const handleBulkApprove = async () => {
    if (!selectedProfileIds.length) {
      return;
    }

    setBulkApproving(true);

    try {
      await api.put("/auth/membership-requests/bulk-approve", {
        userIds: selectedProfileIds.map((id) => Number(id))
      });

      setUsers((currentUsers) => currentUsers.filter((user) => !selectedProfileIds.includes(String(user.id))));
      setSelectedProfileIds([]);
    } catch (error) {
      console.error("Error approving selected membership requests:", error);
      alert(error.response?.data?.message || "Unable to approve selected requests.");
    } finally {
      setBulkApproving(false);
    }
  };
  
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
   const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProfileIds(filteredProfiles.map((user) => String(user.id)));
    } else {
      setSelectedProfileIds([]);
    }
  };


  if (!localStorage.getItem("token")) return null;

  return (
    <div className="book-list">
      <div className="page-header">
        <h2>Membership Requests</h2>
      </div>

      <div className="profile-toolbar">
        <div className="profile-view-controls">
          <label className="profile-select-all">
            <input
              type="checkbox"
              checked={filteredProfiles.length > 0 && selectedProfileIds.length === filteredProfiles.length}
              onChange={handleSelectAll}
            />
            Select all ({filteredProfiles.length})
          </label>

          {selectedProfileIds.length > 0 && (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleBulkApprove}
              disabled={bulkApproving}
            >
              {bulkApproving ? "Approving..." : `Approve Selected (${selectedProfileIds.length})`}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p>Loading membership requests...</p>
      ) : users.length === 0 ? (
        <p>No users with active = 2.</p>
      ) : (
        <div className={viewMode === "list" ? "profile-list-view" : "profile-card-grid"}>
          {users.map((user) => (
            <article className="profile-card" key={user.id}>
              <div className="profile-card-body " >
              
              <label className="profile-select-checkbox">
                <input
                  type="checkbox"
                  checked={selectedProfileIds.includes(String(user.id))}
                  onChange={() => handleProfileSelection(user.id)}
                  aria-label={`Select ${user.firstname || "user"} ${user.lastname || ""}`}
                />
              </label>
              <div className="profile-avatar">
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>
              
              <h3>{[user.firstname, user.lastname].filter(Boolean).join(" ") || "Unknown user"}</h3>
                
                <p><strong>Graduated:</strong> {user.year} &nbsp;<strong>Student ID:</strong> {user.id}</p>
                
                <p>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleApprove(user.id)}
                  disabled={approvingId === user.id}
                >
                  {approvingId === user.id ? "Approving..." : "Approve"}
                </button> <button type="button" className="btn btn-danger">
                  Decline
                </button></p>
                   
              </div>
            </article>
          ))}           
            
        </div>
      )}
    </div>
  );
}

export default MembershipRequest;
