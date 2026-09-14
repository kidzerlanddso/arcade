import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterAdmin from "./RegisterAdmin";
import * as XLSX from "xlsx";

import api from "../api/axios";

const getAdminFromToken = () => {
  const currentToken = localStorage.getItem("token");

  if (!currentToken) return false;

  try {
    const payload = JSON.parse(atob(currentToken.split(".")[1] || ""));
    const adminValue = payload.admin;
    if (adminValue !== undefined && adminValue !== null) {
      return adminValue === true || adminValue === 1 || adminValue === "1" || adminValue === "true";
    }
  } catch (error) {
    console.error("Error decoding token for admin status:", error);
  }

  const storedAdmin = localStorage.getItem("isAdmin");
  return storedAdmin === "true" || storedAdmin === "1";
};

function AdminList() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showRegisterAdmin, setShowRegisterAdmin] = useState(false);
  
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);

  const token = localStorage.getItem("token");
  const isAdmin = getAdminFromToken();

  useEffect(() => {
    const controller = new AbortController();
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      navigate("/login", { replace: true });
      return;
    }

    Promise.all([
      api.get("/admin", { signal: controller.signal }),
      api.get("/events/attendees", { signal: controller.signal }),
    ])
      .then(([adminResponse, registrationsResponse]) => {
        const adminData = adminResponse.data.data || adminResponse.data;
        setAdmins(Array.isArray(adminData) ? adminData : []);
        setEventRegistrations(registrationsResponse.data || []);
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          console.error("Error fetching admin users:", error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort(); 
  }, [navigate]);

  const filteredAdmins = admins.filter((admin) => {
    const fullName = `${admin.firstname || ""} ${admin.lastname || ""}`.trim().toLowerCase();
    const username = `${admin.username || ""}`.toLowerCase();
    const email = `${admin.profile_email || admin.email || ""}`.toLowerCase();
    const searchValue = searchTerm.trim().toLowerCase();

    return (
      searchValue === "" ||
      fullName.includes(searchValue) ||
      username.includes(searchValue) ||
      email.includes(searchValue)
    );
  });

  const handleProfileSelection = (profileId) => {
    setSelectedProfileIds((selectedIds) => {
      const profileKey = String(profileId);

      return selectedIds.includes(profileKey)
        ? selectedIds.filter((selectedId) => selectedId !== profileKey)
        : [...selectedIds, profileKey];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProfileIds(filteredAdmins.map((admin) => String(admin.id)));
    } else {
      setSelectedProfileIds([]);
    }
  };
  
  const handleExport = () => {
      const reportRows = filteredAdmins
        .filter((admin) => selectedProfileIds.includes(String(admin.id)))
        .map((admin) => ({
        "First name": admin.firstname || admin.first_name || "",
        "Last name": admin.lastname || admin.last_name || "",
        Username: admin.username || "",
        Email: admin.profile_email || "",
        City: admin.current_city || "",
        Country: admin.current_country || ""
        }));
  
      if (!reportRows.length) return;
  
      const worksheet = XLSX.utils.json_to_sheet(reportRows);
      const workbook = XLSX.utils.book_new();
  
      XLSX.utils.book_append_sheet(workbook, worksheet, "Profiles");
      XLSX.writeFile(workbook, "RHS-admin-report.xlsx");
  };



  const handleEmailSelected = async () => {
    const emailAddresses = filteredAdmins
      .filter((admin) => selectedProfileIds.includes(String(admin.id)))
      .map((admin) => admin.profile_email?.trim())
      .filter(Boolean);

    if (!emailAddresses.length) {
      alert("The selected profiles do not have email addresses.");
      return;
    }

    const recipients = emailAddresses.join(",");

    try {
      await navigator.clipboard.writeText(recipients);
    } catch (error) {
      console.error("Unable to copy email addresses:", error);
    }

    const mailtoRecipients = emailAddresses.map((email) => encodeURIComponent(email)).join(",");
    window.location.assign(`mailto:${mailtoRecipients}`);
  };

  if (!token) return null;

  return (
    <div className="book-list">
      <div className="page-header">
        <h2>List of Admin</h2>
        <div className="action-row">
          {isAdmin && (
            <button
              type="button"
              className="auth-tab btn btn-success"
              onClick={() => setShowRegisterAdmin(true)}
            >
              + Add an Admin
            </button>
          )}
        </div>
      </div>

      {showRegisterAdmin && (
        <RegisterAdmin isOpen={showRegisterAdmin} onClose={() => setShowRegisterAdmin(false)} />
      )}

      <div className="profile-toolbar">
        <div className="profile-view-controls">
          <label className="profile-select-all">
            <input
              type="checkbox"
              checked={filteredAdmins.length > 0 && selectedProfileIds.length === filteredAdmins.length}
              onChange={handleSelectAll}
            />
            Select all ({filteredAdmins.length})
          </label>

          <button
            type="button"
            className="profile-email-button"
            onClick={handleEmailSelected}
            disabled={selectedProfileIds.length === 0}
          >
            Email
          </button>

          <button
            type="button"
            className="profile-export-button"
            onClick={handleExport}
            disabled={selectedProfileIds.length === 0}
          >
            Export Excel
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Search by name, username or email"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading admin users...</p>
      ) : filteredAdmins.length === 0 ? (
        <p>No admin users found.</p>
      ) : (
         <div className={viewMode === "list" ? "profile-list-view" : "profile-card-grid"}>
          {filteredAdmins.map((admin) => {
            const name = `${admin.firstname || ""} ${admin.lastname || ""}`.trim() || admin.username || "Admin";
            const email = admin.profile_email || admin.email || "-";

            return (
              <article className="profile-card" key={admin.id}>
                <label className="profile-select-checkbox">
                <input
                  type="checkbox"
                  checked={selectedProfileIds.includes(String(admin.id))}
                  onChange={() => handleProfileSelection(admin.id)}
                  aria-label={`Select ${admin.firstname || "admin"} ${admin.lastname || ""}`}
                />
              </label>
                <div className="profile-avatar">
                  {(admin.firstname || admin.username || "A").charAt(0).toUpperCase()}
                </div>

                <div className="profile-card-body">
                  <h3>{name}</h3>
                  <p><strong>Username:</strong> {admin.username || "-"}</p>
                  <p><strong>Email:</strong> {email}</p>
                  <p><strong>Location:</strong> {admin.current_city || "-"} {admin.current_country || ""}</p>
                  
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default AdminList;
