import { useEffect, useState } from "react";

import api from "../api/axios";

const getTokenPayload = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    return JSON.parse(atob(token.split(".")[1] || ""));
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

function MyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const payload = getTokenPayload();

    if (!payload) {
      setLoading(false);
      return;
    }

    api
      .get("/profile")
      .then((response) => {
        const profiles = response.data.data || response.data || [];
        const currentProfile = profiles.find(
          (item) => Number(item.user_id) === Number(payload.userId)
        ) || profiles[0];

        setProfile(currentProfile || null);
      })
      .catch((error) => {
        console.error("Error loading current profile:", error);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="book-list"><p>Loading profile...</p></div>;
  }

  if (!profile) {
    return (
      <div className="book-list">
        <div className="page-header">
          <h2>My Profile</h2>
        </div>
        <p>No profile found for this user.</p>
      </div>
    );
  }

  const fullName = `${profile.firstname || profile.first_name || "Unknown"} ${profile.lastname || profile.last_name || ""}`.trim();

  return (
    <div className="book-list">
      <div className="linkedin-profile-shell">
        <div className="linkedin-cover" />

        <div className="linkedin-profile-card">
          <div className="linkedin-profile-header">
            <div className="linkedin-avatar">
              {(profile.firstname || "U").charAt(0).toUpperCase()}
            </div>

            <div className="linkedin-profile-meta">
              <h2>{fullName}</h2>
              <p className="linkedin-title">Graduate • Batch {profile.year || profile.graduation_year || "-"}</p>
            </div>
          </div>

          <div className="linkedin-profile-body">
            <div className="linkedin-detail-row">
              <span className="linkedin-label">Location</span>
              <span>{profile.current_city || "-"}{profile.current_country ? `, ${profile.current_country}` : ""}</span>
            </div>

            <div className="linkedin-detail-row">
              <span className="linkedin-label">Email</span>
              <span>{profile.email || "-"}</span>
            </div>

            <div className="linkedin-detail-row">
              <span className="linkedin-label">Student ID</span>
              <span>{profile.student_id || "-"}</span>
            </div>

            <div className="linkedin-detail-row">
              <span className="linkedin-label">About</span>
              <span>{profile.bio || "Profile details coming soon."}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
