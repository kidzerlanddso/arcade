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
  const [editing, setEditing] = useState(false);
const [bio, setBio] = useState("");
const [linkedinUrl, setLinkedinUrl] = useState("");
const [profileImageUrl, setProfileImageUrl] = useState("");

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
        setBio(currentProfile?.bio || "");
setLinkedinUrl(currentProfile?.linkedin_url || "");
setProfileImageUrl(currentProfile?.profile_image_url || "");
      })
      .catch((error) => {
        console.error("Error loading current profile:", error);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const handleSave = async () => {
  try {
     const response = await api.patch(`/profile/${profile.id}`, {
  bio: bio,
  linkedin_url: linkedinUrl,
  profile_image_url: profileImageUrl
});

    setProfile(response.data);
    setEditing(false);
  } catch (error) {
    console.error("Error updating profile:", error);
  }
};

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
  {profile.profile_image_url ? (
    <img
      src={profile.profile_image_url}
      alt="Profile"
      className="profile-image"
    />
  ) : (
    (profile.firstname || "U").charAt(0).toUpperCase()
  )}
</div>
{editing && (
  <input
    type="url"
    value={profileImageUrl}
    onChange={(e) => setProfileImageUrl(e.target.value)}
    placeholder="Enter profile image URL"
  />
)}

            <div className="linkedin-profile-meta">
              <h2>{fullName}</h2>
              <p className="linkedin-title">Graduate • Batch {profile.year || profile.graduation_year || "-"}</p>
            </div>
            {editing ? (
  <>
    <button onClick={handleSave}>
      Save
    </button>

    <button onClick={() => setEditing(false)}>
      Cancel
    </button>
  </>
) : (
  <button onClick={() => setEditing(true)}>
    Edit Profile
  </button>
)}
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

  {editing ? (
    <textarea
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      placeholder="Write something about yourself"
    />
  ) : (
    <span>{profile.bio || "Profile details coming soon."}</span>
  )}
</div>
            <div className="linkedin-detail-row">
  <span className="linkedin-label">LinkedIn</span>

  {editing ? (
    <input
      type="url"
      value={linkedinUrl}
      onChange={(e) => setLinkedinUrl(e.target.value)}
      placeholder="Enter LinkedIn profile URL"
    />
  ) : (
    <span>
      {profile.linkedin_url ? (
        <a
          href={profile.linkedin_url}
          target="_blank"
          rel="noreferrer"
        >
          View LinkedIn Profile
        </a>
      ) : (
        "-"
      )}
    </span>
  )}
</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
