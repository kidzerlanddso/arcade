import { useEffect, useState } from "react";

import api from "../api/axios";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function MyProfilePage({ readOnly = false }) {
  const { id: viewProfileId } = useParams();
  const isViewingOther = readOnly && Boolean(viewProfileId);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [employment, setEmployment] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [showEmploymentForm, setShowEmploymentForm] = useState(false);
  const [currentCity, setCurrentCity] = useState("");
  const [currentCountry, setCurrentCountry] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countries, setCountries] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [education, setEducation] = useState([]);
  const [institution, setInstitution] = useState("");
  const [qualification, setQualification] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [educationStartDate, setEducationStartDate] = useState("");
  const [educationEndDate, setEducationEndDate] = useState("");
  const [educationDescription, setEducationDescription] = useState("");
  const [showEducationForm, setShowEducationForm] = useState(false);
  // ========== Connect feature state ==========
  const [showConnectModal, setShowConnectModal] = useState(false); // Modal visibility
  const [connections, setConnections] = useState([]);             // Accepted connections
  const [pendingSent, setPendingSent] = useState([]);             // Pending requests I sent
  const [pendingReceived, setPendingReceived] = useState([]);     // Pending requests I received
  const [connectToast, setConnectToast] = useState("");
  const navigate = useNavigate();

  const applyProfileToState = (currentProfile) => {
    setProfile(currentProfile || null);
    setBio(currentProfile?.bio || "");
    setLinkedinUrl(currentProfile?.linkedin_url || "");
    setProfileImageUrl(currentProfile?.profile_image_url || "");
    setCurrentCity(currentProfile?.current_city || "");
    setCurrentCountry(currentProfile?.current_country || "");
    setEmail(currentProfile?.email || "");
    setStudentId(currentProfile?.student_id || "");
    setFirstName(currentProfile?.firstname || currentProfile?.first_name || "");
    setLastName(currentProfile?.lastname || currentProfile?.last_name || "");
  };

  useEffect(() => {
    if (isViewingOther) {
      setLoading(true);

      api
        .get(`/profile/${viewProfileId}`)
        .then(async (response) => {
          const currentProfile = response.data;
          applyProfileToState(currentProfile);

          const userId = currentProfile?.user_id;
          if (!userId) return;

          const [employmentResponse, educationResponse] = await Promise.all([
            api.get(`/employment/user/${userId}`),
            api.get(`/education/user/${userId}`),
          ]);

          setEmployment(employmentResponse.data || []);
          setEducation(educationResponse.data || []);
        })
        .catch((error) => {
          console.error("Error loading profile:", error);
          setProfile(null);
        })
        .finally(() => {
          setLoading(false);
        });

      return;
    }

    const payload = getTokenPayload();

    if (!payload) {
      setLoading(false);
      return;
    }

    api
      .get("/profile/me")
      .then((response) => {
        applyProfileToState(response.data);
      })
      .catch((error) => {
        console.error("Error loading current profile:", error);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });

    api
      .get(`/employment/user/${payload.userId}`)
      .then((response) => {
        setEmployment(response.data || []);
      })
      .catch((error) => {
        console.error("Error loading employment history:", error);
        setEmployment([]);
      });

    api
      .get(`/education/user/${payload.userId}`)
      .then((response) => {
        setEducation(response.data || []);
      })
      .catch((error) => {
        console.error("Error loading education history:", error);
        setEducation([]);
      });
  }, [isViewingOther, viewProfileId]);

  useEffect(() => {
    if (isViewingOther) return;

    api
      .get("/country")
      .then((response) => {
        setCountries(response.data || []);
      })
      .catch((error) => {
        console.error("Error loading countries:", error);
        setCountries([]);
      });
  }, [isViewingOther]);
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const uploadResponse = await api.post(
        `/profile/${profile.id}/image`,
        formData
      );

      const imageUrl = uploadResponse.data.profile_image_url;

      await api.patch(`/profile/${profile.id}`, {
        profile_image_url: imageUrl,
      });

      setProfile((prev) => ({
        ...prev,
        profile_image_url: imageUrl,
      }));

      setProfileImageUrl(imageUrl);

      e.target.value = "";
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };
  const handleOpenConnectionProfile = async (item) => {
    let profileId = item.profile_id;

    if (!profileId && item.other_user_id) {
      try {
        const response = await api.get(`/profile/user/${item.other_user_id}`);
        profileId = response.data?.id;
      } catch (error) {
        console.error("Error resolving connection profile:", error);
        alert("Unable to open this profile.");
        return;
      }
    }

    if (!profileId) {
      alert("Profile not available.");
      return;
    }

    setShowConnectModal(false);
    navigate(`/profile/view/${profileId}`);
  };
  const handleSave = async () => {
    try {
      let imageUrl = profileImageUrl;

      // If the user selected a new profile image.
      if (profileImageFile) {
        const formData = new FormData();
        formData.append("profileImage", profileImageFile);

        const uploadResponse = await api.post(
          `/profile/${profile.id}/image`,
          formData
        );

        imageUrl = uploadResponse.data.profile_image_url;
        setProfileImageUrl(imageUrl);
      }

      // Save Profile information to the database.
      const response = await api.patch(`/profile/${profile.id}`, {
        firstname: firstName,
        lastname: lastName,
        bio: bio,
        linkedin_url: linkedinUrl,
        profile_image_url: imageUrl,
        current_city: currentCity,
        current_country: currentCountry,
        email: email,
        student_id: studentId,

      });

      setProfile(response.data);
      setProfileImageFile(null);
      setEditing(false);

    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  const handleAddEmployment = async () => {
    const payload = getTokenPayload();

    try {
      const response = await api.post("/employment", {
        user_id: payload.userId,
        company: company,
        job_title: jobTitle,
        start_date: startDate,
        end_date: endDate || null,
        description: description
      });

      setEmployment([...employment, response.data]);

      setJobTitle("");
      setCompany("");
      setStartDate("");
      setEndDate("");
      setDescription("");
    } catch (error) {
      console.error("Error adding employment:", error);
    }
  };
  const handleAddEducation = async () => {
    const payload = getTokenPayload();

    try {
      const response = await api.post("/education", {
        user_id: payload.userId,
        institution: institution,
        qualification: qualification,
        field_of_study: fieldOfStudy,
        start_date: educationStartDate,
        end_date: educationEndDate || null,
        description: educationDescription
      });

      setEducation([...education, response.data]);

      setInstitution("");
      setQualification("");
      setFieldOfStudy("");
      setEducationStartDate("");
      setEducationEndDate("");
      setEducationDescription("");
      setShowEducationForm(false);
    } catch (error) {
      console.error("Error adding education:", error);
    }
  };
  const handleDeleteEmployment = async (id) => {
    try {
      await api.delete(`/employment/${id}`);

      setEmployment(
        employment.filter((job) => job.id !== id)
      );
    } catch (error) {
      console.error("Error deleting employment:", error);
    }
  };
  const handleDeleteEducation = async (id) => {
    try {
      await api.delete(`/education/${id}`);

      setEducation(
        education.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  // ========== Connect feature ==========

  // Display connection name
  const formatConnectionName = (item) =>
    `${item.firstname || ""} ${item.lastname || ""}`.trim() || "Unknown";

  const renderConnectionAvatar = (item) => {
    const name = formatConnectionName(item);

    if (item.profile_image_url) {
      return (
        <img
          src={item.profile_image_url}
          alt={name}
          className="connect-row-avatar"
        />
      );
    }

    return (
      <div className="connect-row-avatar connect-row-avatar--placeholder" aria-hidden="true">
        {(item.firstname || "U").charAt(0).toUpperCase()}
      </div>
    );
  };

  // Fetch connections and pending requests from API
  const loadConnections = async () => {
    try {
      const [connectionsResponse, pendingResponse] = await Promise.all([
        api.get("/connection/me"),
        api.get("/connection/pending"),
      ]);

      setConnections(connectionsResponse.data || []);
      setPendingSent(pendingResponse.data?.sent || []);
      setPendingReceived(pendingResponse.data?.received || []);
    } catch (error) {
      console.error("Error loading connections:", error);
      alert(error.response?.data?.message || "Failed to load connections.");
    }
  };

  // Open Connections modal and load data
  const handleOpenConnections = async () => {
    setShowConnectModal(true);
    await loadConnections();
  };

  const showConnectToast = (message) => {
    setConnectToast(message);
    setTimeout(() => {
      setConnectToast("");
    }, 3000);
  };

  // Accept connection request
  const handleAcceptConnection = async (connectionId, item) => {
    try {
      await api.patch(`/connection/${connectionId}/accept`);
      const name = formatConnectionName(item);
      showConnectToast(`Connection request from ${name} accepted!`);
      await loadConnections();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to accept connection request.");
    }
  };

  // Reject connection request
  const handleRejectConnection = async (connectionId) => {
    try {
      await api.patch(`/connection/${connectionId}/reject`);
      await loadConnections();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject connection request.");
    }
  };

  // Cancel a sent request or disconnect an accepted connection
  const handleCancelConnection = async (connectionId, successMessage = null) => {
    try {
      await api.delete(`/connection/${connectionId}`);
      if (successMessage) {
        showConnectToast(successMessage);
      }
      await loadConnections();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel connection.");
    }
  };

  if (loading) {
    return <div className="book-list"><p>Loading profile...</p></div>;
  }

  if (!profile) {
    return (
      <div className="book-list">
        <div className="page-header">
          <h2>{isViewingOther ? "Alumni Profile" : "My Profile"}</h2>
        </div>
        <p>No profile found for this user.</p>
        {isViewingOther && (
          <Link to="/profile/me" className="profile-header-button">
            Back to My Profile
          </Link>
        )}
      </div>
    );
  }

  const fullName = `${profile.firstname || profile.first_name || "Unknown"} ${profile.lastname || profile.last_name || ""}`.trim();

  return (
    <div className="book-list">
      {connectToast && (
        <div className="connect-toast connect-toast--long" role="status">
          {connectToast}
        </div>
      )}
      <div className="linkedin-profile-shell">
        <div className="linkedin-cover" />

        <div className="linkedin-profile-card">
          <div className="linkedin-profile-header">

            <div
              className="linkedin-avatar"
              onClick={isViewingOther ? undefined : () => setShowPhotoModal(true)}
              style={isViewingOther ? { cursor: "default" } : undefined}
            >
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

            {!isViewingOther && (
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ display: "none" }}
            />
            )}

            {!isViewingOther && showPhotoModal && (
              <div className="photo-modal-overlay">
                <div className="photo-modal">

                  <button
                    className="photo-modal-close"
                    onClick={() => setShowPhotoModal(false)}
                  >
                    ×
                  </button>

                  <h2>Profile photo</h2>

                  <img
                    src={profile.profile_image_url}
                    alt="Profile"
                    className="photo-modal-image"
                  />

                  <button
                    className="change-photo-button"
                    onClick={() => {
                      document
                        .getElementById("profileImageInput")
                        ?.click();

                      setShowPhotoModal(false);
                    }}
                  >
                    Change photo
                  </button>

                </div>
              </div>
            )}

            {!isViewingOther && showConnectModal && (
              <div className="modal-overlay" onClick={() => setShowConnectModal(false)}>
                <div
                  className="modal-card connect-modal"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>My Connections</h3>
                    <button
                      type="button"
                      className="close-button"
                      onClick={() => setShowConnectModal(false)}
                      aria-label="Close connections"
                    >
                      ×
                    </button>
                  </div>

                  <div className="connect-modal-body">
                    {/* Requests received from others */}
                    <section className="connect-section">
                      <h4>Requests received ({pendingReceived.length})</h4>
                      {pendingReceived.length === 0 ? (
                        <p className="connect-empty">No pending requests.</p>
                      ) : (
                        pendingReceived.map((item) => (
                          <div key={item.id} className="connect-row">
                            <div className="connect-row-main">
                              {renderConnectionAvatar(item)}
                              <div className="connect-row-info">
                                <strong>{formatConnectionName(item)}</strong>
                                <span>
                                  {[item.current_city, item.current_country].filter(Boolean).join(", ") || "—"}
                                </span>
                              </div>
                            </div>
                            <div className="connect-row-actions">
                              <button
                                type="button"
                                className="connect-button connect-button--accept"
                                onClick={() => handleAcceptConnection(item.id, item)}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="connect-button connect-button--reject"
                                onClick={() => handleRejectConnection(item.id)}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </section>

                    {/* Requests I sent that are still pending */}
                    <section className="connect-section">
                      <h4>Requests sent ({pendingSent.length})</h4>
                      {pendingSent.length === 0 ? (
                        <p className="connect-empty">No sent requests.</p>
                      ) : (
                        pendingSent.map((item) => (
                          <div key={item.id} className="connect-row">
                            <div className="connect-row-main">
                              {renderConnectionAvatar(item)}
                              <div className="connect-row-info">
                                <strong>{formatConnectionName(item)}</strong>
                                <span className="connect-status-label">Pending</span>
                              </div>
                            </div>
                            <div className="connect-row-actions">
                              <button
                                type="button"
                                className="connect-button connect-button--reject"
                                onClick={() =>
                                  handleCancelConnection(
                                    item.id,
                                    `Connection request to ${formatConnectionName(item)} cancelled!`
                                  )
                                }
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </section>

                    {/* Accepted connections */}
                    <section className="connect-section">
                      <h4>Connections ({connections.length})</h4>
                      {connections.length === 0 ? (
                        <p className="connect-empty">No connections yet.</p>
                      ) : (
                        connections.map((item) => (

                          <div
                            key={item.id}
                            className="connect-row connect-row--clickable"
                            onClick={() => handleOpenConnectionProfile(item)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleOpenConnectionProfile(item);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                          <div className="connect-row-main">
                            {renderConnectionAvatar(item)}
                            <div className="connect-row-info">
                              <strong>{formatConnectionName(item)}</strong>
                              <span>
                                {[item.current_city, item.current_country].filter(Boolean).join(", ") || "—"}
                              </span>
                            </div>
                          </div>
                          <div className="connect-row-actions">
                            <button
                              type="button"
                              className="connect-button connect-button--reject"
                              onClick={(e) => {
                                e.stopPropagation();  // 关键：点 Disconnect 不跳转
                                handleCancelConnection(item.id);
                              }}
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                        ))
                      )}
                    </section>
                  </div>
                </div>
              </div>
            )}

            <div className="linkedin-profile-meta">
              {editing && !isViewingOther ? (
                <>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />

                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </>
              ) : (
                <h2>{fullName}</h2>
              )}

              <p className="linkedin-title">
                Graduate • Batch {profile.year || profile.graduation_year || "-"}
              </p>
            </div>

            {/* Connections entry next to Edit Profile */}
            <div className="profile-header-actions">
              {isViewingOther ? (
                <Link to="/profile/me" className="profile-header-button">
                  Back to My Profile
                </Link>
              ) : (
                <>
              {!editing && (
                <button type="button" className="connect-open-button" onClick={handleOpenConnections}>
                  Connections
                  {pendingReceived.length > 0 ? ` (${pendingReceived.length})` : ""}
                </button>
              )}

              {editing ? (
                <>
                  <button onClick={handleSave}>
                    Save
                  </button>

                  <button
                    onClick={() => {
                      setEditing(false);
                      setProfileImageFile(null);
                      setShowEmploymentForm(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              )}
                </>
              )}
            </div>

          </div>

          <div className="linkedin-profile-body">
            <div className="linkedin-detail-row">
              <span className="linkedin-label">Location</span>

              {editing && !isViewingOther ? (
                <div className="location-edit-fields">
                  <input
                    type="text"
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    placeholder="Enter city"
                  />

                  <select
                    value={currentCountry}
                    onChange={(e) => setCurrentCountry(e.target.value)}
                  >
                    <option value="">Select country</option>

                    {countries.map((country) => (
                      <option key={country.Code} value={country.Name}>
                        {country.Name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span>
                  {profile.current_city || "-"}
                  {profile.current_country ? `, ${profile.current_country}` : ""}
                </span>
              )}
            </div>

            <div className="linkedin-detail-row">
              <span className="linkedin-label">Email</span>

              {editing && !isViewingOther ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              ) : (
                <span>{profile.email || "-"}</span>
              )}
            </div>

            <div className="linkedin-detail-row">
              <span className="linkedin-label">Student ID</span>

              {editing && !isViewingOther ? (
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student ID"
                />
              ) : (
                <span>{profile.student_id || "-"}</span>
              )}
            </div>

            <div className="linkedin-detail-row">
              <span className="linkedin-label">About</span>

              {editing && !isViewingOther ? (
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

              {editing && !isViewingOther ? (
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
        {/* Education Section */}
        <div className="profile-section">
          <div className="profile-section-header">
            <h3>Education</h3>

            {editing && !isViewingOther && (
              <button
                className="add-experience-button"
                onClick={() => setShowEducationForm(true)}
              >
                +
              </button>
            )}
          </div>

          {editing && !isViewingOther && showEducationForm && (
            <div>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Institution"
              />

              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Qualification"
              />

              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="Field of study"
              />

              <input
                type="date"
                value={educationStartDate}
                onChange={(e) => setEducationStartDate(e.target.value)}
              />

              <input
                type="date"
                value={educationEndDate}
                onChange={(e) => setEducationEndDate(e.target.value)}
              />

              <textarea
                value={educationDescription}
                onChange={(e) => setEducationDescription(e.target.value)}
                placeholder="Education description"
              />

              <button
                className="add-record-button"
                onClick={handleAddEducation}>
                Add Education
              </button>
            </div>
          )}

          {education.length === 0 ? (
            <span>No education history added.</span>
          ) : (
            education.map((item) => (
              <div key={item.id} className="experience-item">
                <strong>{item.institution || "-"}</strong>

                <div>{item.qualification || "-"}</div>

                <div>{item.field_of_study || "-"}</div>

                <div>
                  {item.start_date
                    ? new Date(item.start_date).toLocaleDateString("en-NZ")
                    : "-"}
                  {" - "}
                  {item.end_date
                    ? new Date(item.end_date).toLocaleDateString("en-NZ")
                    : "Present"}
                </div>

                {item.description && <p>{item.description}</p>}

                {editing && !isViewingOther && (
                  <button onClick={() => handleDeleteEducation(item.id)}>
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="profile-section">
          <div className="profile-section-header">
            <h3>Experience</h3>

            {editing && !isViewingOther && (
              <button
                className="add-experience-button"
                onClick={() => setShowEmploymentForm(true)}
              >
                +
              </button>
            )}
          </div>
          {editing && !isViewingOther && showEmploymentForm && (
            <div>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job title"
              />

              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
              />

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job description"
              />

              <button
                className="add-record-button"
                onClick={handleAddEmployment}>
                Add Employment
              </button>
            </div>
          )}

          {employment.length === 0 ? (
            <span>No employment history added.</span>
          ) : (
            employment.map((job) => (
              <div key={job.id} className="experience-item">
                <strong>{job.job_title || "-"}</strong>

                <div>{job.company || "-"}</div>

                <div>
                  {job.start_date
                    ? new Date(job.start_date).toLocaleDateString("en-NZ")
                    : "-"}{" "}
                  -{" "}
                  {job.end_date
                    ? new Date(job.end_date).toLocaleDateString("en-NZ")
                    : "Present"}
                </div>

                {editing && !isViewingOther && (
                  <button onClick={() => handleDeleteEmployment(job.id)}>
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
