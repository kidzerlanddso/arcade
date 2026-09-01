import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Register from "../components/Register";

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

function ProfileList() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const isAdmin = getAdminFromToken();
  // const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedExpertise, setSelectedExpertise] = useState("all");
  const [sortBy, setSortBy] = useState("firstname");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("tile");
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  const profilesPerPage = 20;
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    year: ""
  });

  useEffect(() => {
    const controller = new AbortController();
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      navigate("/login", { replace: true });
      return;
    }

    api
      .get("/profile", { signal: controller.signal })
      .then((response) => {
        const profileData = response.data.data || response.data;
        setProfiles(profileData);
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          console.error("Error fetching profiles:", error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const years = Array.from(
    new Set(
      profiles
        .map((profile) => Number(profile.year || profile.graduation_year))
        .filter((year) => !Number.isNaN(year))
    )
  ).sort((a, b) => b - a);

  const expertiseOptions = Array.from(
    new Set(
      profiles.flatMap((profile) => {
        const value = profile.expertise || profile.expertise_area || profile.expertise_field || "";
        return String(value)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      })
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredProfiles = profiles.filter((profile) => {
    const fullName = `${profile.firstname || ""} ${profile.lastname || ""}`.toLowerCase();
    const city = `${profile.current_city || ""}`.toLowerCase();
    const student_id = `${profile.student_id || ""}`.toLowerCase();
    const expertise = `${profile.expertise || ""}`.toLowerCase();
    const searchValue = searchTerm.toLowerCase().trim();
    const matchesSearch =
      searchValue === "" ||
      fullName.includes(searchValue) ||
      city.includes(searchValue)||
      student_id.includes(searchValue)||
      expertise.includes(searchValue);
    const profileYear = profile.year || profile.graduation_year;
    const matchesYear = selectedYear === "all" || String(profileYear) === String(selectedYear);
    const profileExpertise = String(profile.expertise || profile.expertise_area || profile.expertise_field || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const matchesExpertise =
      selectedExpertise === "all" ||
      profileExpertise.includes(String(selectedExpertise).trim().toLowerCase());
    return matchesSearch && matchesYear && matchesExpertise;
  });

  const sortedProfiles = [...filteredProfiles].sort((firstProfile, secondProfile) => {
    const firstValue = (firstProfile[sortBy] || "").toLowerCase();
    const secondValue = (secondProfile[sortBy] || "").toLowerCase();
    const comparison = firstValue.localeCompare(secondValue);

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.max(1, Math.ceil(sortedProfiles.length / profilesPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const visibleProfiles = sortedProfiles.slice(
    (visiblePage - 1) * profilesPerPage,
    visiblePage * profilesPerPage
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
      return;
    }

    setSortBy(field);
    setSortDirection("asc");
  };

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
      setSelectedProfileIds(sortedProfiles.map((profile) => String(profile.id)));
    } else {
      setSelectedProfileIds([]);
    }
  };

  const handleExport = () => {
    const reportRows = sortedProfiles
      .filter((profile) => selectedProfileIds.includes(String(profile.id)))
      .map((profile) => ({
      "First name": profile.firstname || profile.first_name || "",
      "Last name": profile.lastname || profile.last_name || "",
      Username: profile.username || "",
      Email: profile.email || "",
      City: profile.current_city || "",
      Country: profile.current_country || "",
      "Batch year": profile.year || profile.graduation_year || "",
      "Student ID": profile.student_id || "",
      Expertise: profile.expertise || profile.expertise_area || profile.expertise_field || ""
      }));

    if (!reportRows.length) return;

    const worksheet = XLSX.utils.json_to_sheet(reportRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Profiles");
    XLSX.writeFile(workbook, "alumni-profiles-report.xlsx");
  };

  const handleEmailSelected = async () => {
    const emailAddresses = sortedProfiles
      .filter((profile) => selectedProfileIds.includes(String(profile.id)))
      .map((profile) => profile.email?.trim())
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

  const [showRegister, setShowRegister] = useState(false);

  if (!token) return null;

  return (
    <div className="book-list">
      <div className="page-header">
        <h2>List of Profiles</h2>
        <div className="action-row">
          {isAdmin && (
            
            <button
              type="button"
              className="auth-tab btn btn-success "
              onClick={() => setShowRegister(true)}
            >
             + Create a profile
            </button>
          )}
        </div>
      </div>
      {showRegister && (
        <Register isOpen={showRegister} onClose={() => setShowRegister(false)} />
      )}

      <div className="profile-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, city, student id or expertise"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          className="year-filter"
          value={selectedYear}
          onChange={(event) => setSelectedYear(event.target.value)}
        >
          <option value="all">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          className="year-filter"
          value={selectedExpertise}
          onChange={(event) => setSelectedExpertise(event.target.value)}
        >
          <option value="all">All Expertise</option>
          {expertiseOptions.map((expertise) => (
            <option key={expertise} value={expertise}>
              {expertise}
            </option>
          ))}
        </select>

        </div>
        <div className="profile-toolbar">
        {isAdmin && (
          <div className="profile-view-controls" aria-label="Profile view options">
          
            {viewMode === "list" && (
              <label className="profile-select-all">
                <input
                  type="checkbox"
                  checked={sortedProfiles.length > 0 && selectedProfileIds.length === sortedProfiles.length}
                  onChange={handleSelectAll}
                />
                Select all ({sortedProfiles.length})
              </label>
            )}
            <button
              type="button"
              className={viewMode === "tile" ? "active" : ""}
              onClick={() => setViewMode("tile")}
            >
              Tile View
            </button>
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              List View
            </button>
              
            {viewMode === "list" && (
              <button
                type="button"
                className="profile-export-button"
                onClick={handleExport}
                disabled={selectedProfileIds.length === 0}
              >
                Export Excel
              </button>
            )}
            {viewMode === "list" && (
              <button
                type="button"
                className="profile-email-button"
                onClick={handleEmailSelected}
                disabled={selectedProfileIds.length === 0}
              >
                Email
              </button>
            )}
          </div>
           )}
        <div className="profile-sort-controls" aria-label="Sort profiles">
            <span>Sort by:</span>
            <button
              type="button"
              className={sortBy === "firstname" ? "active" : ""}
              onClick={() => handleSort("firstname")}
            >
              First name {sortBy === "firstname" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </button>
            <button
              type="button"
              className={sortBy === "lastname" ? "active" : ""}
              onClick={() => handleSort("lastname")}
            >
              Last name {sortBy === "lastname" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
            </button>
          </div>
      </div>
      <br/>

      {loading ? (
        <p>Loading profiles...</p>
      ) : (
        <div className={viewMode === "list" ? "profile-list-view" : "profile-card-grid"}>
          {visibleProfiles.map((profile) => (
          <article className="profile-card" key={profile.id}>
            {isAdmin && viewMode === "list" && (
              <label className="profile-select-checkbox">
                <input
                  type="checkbox"
                  checked={selectedProfileIds.includes(String(profile.id))}
                  onChange={() => handleProfileSelection(profile.id)}
                  aria-label={`Select ${profile.firstname || "profile"} ${profile.lastname || ""}`}
                />
              </label>
            )}
            <div className="profile-avatar">
              {profile.profile_image_url ? (
                <img src={profile.profile_image_url} alt={`${profile.firstname || "User"}'s avatar`} className="dp-image"/>
              ) : (
                (profile.firstname || "U").charAt(0).toUpperCase()
              )}
            </div>

            <div className="profile-card-body">
              <h3>
                {profile.firstname || profile.first_name || "Unknown"} {profile.lastname || profile.last_name || ""}
              </h3>
              <p><strong>{profile.current_city}</strong> {profile.current_country}</p>
              <p><strong>Email:</strong> {profile.email || "-"}</p>
              <p><strong>Batch of </strong> {profile.year || profile.graduation_year || "-"}</p>

              {isAdmin && (
                <div className="profile-card-actions">
                  <Link
                    className="icon-action edit-action"
                    to={`/profile/edit/${profile.id}`}
                    aria-label={`Edit ${profile.firstname || "profile"}`}
                    title="Edit"
                  >
                    ✏️
                  </Link>
                  <Link
                    className="icon-action delete-action"
                    to={`/profile/delete/${profile.id}`}
                    aria-label={`Delete ${profile.firstname || "profile"}`}
                    title="Delete"
                  >
                    🗑️
                  </Link>
                </div>
              )}
            </div>
          </article>
          ))}
        </div>
      )}

      {!loading && sortedProfiles.length > 0 && (
        <div className="profile-pagination" aria-label="Profile pagination">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))}
            disabled={visiblePage === 1}
          >
            Previous
          </button>
          <span>Page {visiblePage} of {totalPages}</span>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, Math.min(page, totalPages) + 1))}
            disabled={visiblePage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      
    </div>
  );
}

export default ProfileList;
