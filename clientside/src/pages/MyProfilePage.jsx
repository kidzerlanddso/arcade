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

const getAdminFromToken = () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) return false;

    try {
        const payload = JSON.parse(atob(currentToken.split(".")[1] || ""));
        const adminValue = payload.admin;
        if (adminValue !== undefined && adminValue !== null) {
            return (
                adminValue === true ||
                adminValue === 1 ||
                adminValue === "1" ||
                adminValue === "true"
            );
        }
    } catch (error) {
        console.error("Error decoding token for admin status:", error);
    }

    const storedAdmin = localStorage.getItem("isAdmin");
    return storedAdmin === "true" || storedAdmin === "1";
};

function MyProfilePage({ readOnly = false }) {
    const { id: viewProfileId } = useParams();
    const isViewingOther = readOnly && Boolean(viewProfileId);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const isAdmin = getAdminFromToken();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [showIntroModal, setShowIntroModal] = useState(false);
    const [bio, setBio] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [enableEmail, setEnableEmail] = useState("");
    const [mentorshipAvailable, setMentorshipAvailable] = useState(false);
    const [expertise, setExpertise] = useState("");
    const [expertiseId, setExpertiseId] = useState("");
    const [expertiseOptions, setExpertiseOptions] = useState([]);
    const [mentorshipAvailability, setMentorshipAvailability] = useState("");
    const mentorshipDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    const canAccess = isAdmin || !isViewingOther;
    const handleMentorshipDayChange = (day) => {
        const selectedDays = mentorshipAvailability
            .split(",")
            .map((item) => item.trim())
            .filter((item) => mentorshipDays.includes(item));

        if (selectedDays.includes(day)) {
            setMentorshipAvailability(
                selectedDays.filter((item) => item !== day).join(", "),
            );
        } else {
            setMentorshipAvailability([...selectedDays, day].join(", "));
        }
    };
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [employment, setEmployment] = useState([]);
    const [jobTitle, setJobTitle] = useState("");
    const [editingEmploymentId, setEditingEmploymentId] = useState(null);
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
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showMentorshipModal, setShowMentorshipModal] = useState(false);
    const [showMentorshipDaysDropdown, setShowMentorshipDaysDropdown] =
        useState(false);
    const [education, setEducation] = useState([]);
    const [institution, setInstitution] = useState("");
    const [qualification, setQualification] = useState("");
    const [fieldOfStudy, setFieldOfStudy] = useState("");
    const [educationStartDate, setEducationStartDate] = useState("");
    const [educationEndDate, setEducationEndDate] = useState("");
    const [educationDescription, setEducationDescription] = useState("");
    const [showEducationForm, setShowEducationForm] = useState(false);
const [showConnectModal, setShowConnectModal] = useState(false);
const [connections, setConnections] = useState([]);
const [pendingSent, setPendingSent] = useState([]);
const [pendingReceived, setPendingReceived] = useState([]);
const [connectToast, setConnectToast] = useState("");

const [showEducationManager, setShowEducationManager] = useState(false);
const [editingEducationId, setEditingEducationId] = useState(null);
const [showExperienceManager, setShowExperienceManager] = useState(false);

const applyProfileToState = (currentProfile) => {
    setProfile(currentProfile || null);
    setBio(currentProfile?.bio || "");
    setLinkedinUrl(currentProfile?.linkedin_url || "");
    setMentorshipAvailable(
        currentProfile?.mentorship_available ?? false,
    );
    setExpertise(currentProfile?.expertise || "");

    setExpertiseId(
        Array.isArray(currentProfile?.expertise_id) &&
        currentProfile.expertise_id.length > 0
            ? String(currentProfile.expertise_id[0])
            : ""
    );

    setMentorshipAvailability(
        currentProfile?.mentorship_availability || "",
    );
    setProfileImageUrl(currentProfile?.profile_image_url || "");
    setCurrentCity(currentProfile?.current_city || "");
    setCurrentCountry(currentProfile?.current_country || "");
    setEmail(currentProfile?.email || "");
    setStudentId(currentProfile?.student_id || "");
    setFirstName(
        currentProfile?.firstname || currentProfile?.first_name || "",
    );
    setLastName(
        currentProfile?.lastname || currentProfile?.last_name || "",
    );
    setEnableEmail(Boolean(currentProfile?.enableEmail ?? false));
};
    useEffect(() => {
        if (isViewingOther) {
            setLoading(true);

            api.get(`/profile/${viewProfileId}`)
                .then(async (response) => {
                    const currentProfile = response.data;
                    applyProfileToState(currentProfile);

                    const userId = currentProfile?.user_id;
                    if (!userId) return;

                    const [employmentResponse, educationResponse] =
                        await Promise.all([
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
            window.location.href = "/login";
            return;
        }

        api.get("/profile/me")
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

        api.get(`/employment/user/${payload.userId}`)
            .then((response) => {
                setEmployment(response.data || []);
            })
            .catch((error) => {
                console.error("Error loading employment history:", error);
                setEmployment([]);
            });
        api.get(`/education/user/${payload.userId}`)
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

        api.get("/country")
            .then((response) => {
                setCountries(response.data || []);
            })
            .catch((error) => {
                console.error("Error loading countries:", error);
                setCountries([]);
            });
}, [isViewingOther]);

useEffect(() => {
  api.get("/profile/expertise/options")
    .then((response) => {
      setExpertiseOptions(response.data || []);
    })
    .catch((error) => {
      console.error("Error loading expertise options:", error);
    });
}, []);

useEffect(() => {
  if (isViewingOther || isAdmin) return;

  api
    .get("/connection/pending")
    .then((response) => {
      setPendingReceived(response.data?.received || []);
    })
    .catch((error) => {
      console.error("Error loading pending connections:", error);
    });
}, [isViewingOther, isAdmin]);

useEffect(() => {
  if (!profile || expertiseOptions.length === 0) return;

  const savedId = Array.isArray(profile.expertise_id)
    ? profile.expertise_id[0]
    : profile.expertise_id;

  if (!savedId) return;

  const selected = expertiseOptions.find(
    (item) => String(item.expertise_id) === String(savedId)
  );

  if (selected) {
    setExpertiseId(String(savedId));
    setExpertise(selected.expertise);
  }
}, [profile, expertiseOptions]);
    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];

        if (!file) return;
        if (!profile?.id) {
            alert(
                "Your profile has not loaded yet. Please wait a moment and try again.",
            );
            return;
        }

        try {
            const formData = new FormData();
            formData.append("profileImage", file);

            const uploadResponse = await api.post(
                `/profile/${profile.id}/image`,
                formData,
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
        // Use profile_id only — never connection.id or other_user_id as the URL id
        let profileId = item.profile_id ? Number(item.profile_id) : null;

        if (!profileId && item.other_user_id) {
            try {
                const response = await api.get(
                    `/profile/user/${item.other_user_id}`,
                );
                profileId = Number(
                    response.data?.id ?? response.data?.data?.id,
                );
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
                    formData,
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
                mentorship_available: mentorshipAvailable,
            expertise_id: expertiseId ? [Number(expertiseId)] : [],
                mentorship_availability: mentorshipAvailability,
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
    const handleSaveAbout = async () => {
        try {
            await api.patch(`/profile/${profile.id}`, {
                bio: bio,
            });

            setProfile((prev) => ({
                ...prev,
                bio: bio,
            }));

            setShowAboutModal(false);
        } catch (error) {
            console.error("Error saving About:", error);
        }
    };
    const handleSaveMentorship = async () => {
        try {
            await api.patch(`/profile/${profile.id}`, {
                mentorship_available: mentorshipAvailable,
            expertise_id: expertiseId ? [Number(expertiseId)] : [],
               mentorship_availability: mentorshipAvailability,
            });

            setProfile((prev) => ({
                ...prev,
                mentorship_available: mentorshipAvailable,
                expertise_id: expertiseId ? Number(expertiseId) : null,
                expertise: expertise,
                mentorship_availability: mentorshipAvailability,
            }));

            setShowMentorshipModal(false);
        } catch (error) {
            console.error("Error saving Mentorship:", error);
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
                description: description,
            });

            setEmployment([...employment, response.data]);

            setJobTitle("");
            setCompany("");
            setStartDate("");
            setEndDate("");
            setDescription("");
            setShowEmploymentForm(false);
        
        } catch (error) {
            console.error("Error adding employment:", error);
        }
    };
    const handleEditEmployment = (job) => {
        setEditingEmploymentId(job.id);

        setJobTitle(job.job_title || "");
        setCompany(job.company || "");
        setStartDate(
            job.start_date ? String(job.start_date).split("T")[0] : "",
        );
        setEndDate(job.end_date ? String(job.end_date).split("T")[0] : "");
        setDescription(job.description || "");


        setShowEmploymentForm(true);
    };
    const handleUpdateEmployment = async () => {
        try {
            const response = await api.patch(
                `/employment/${editingEmploymentId}`,
                {
                    company: company,
                    job_title: jobTitle,
                    start_date: startDate,
                    end_date: endDate || null,
                    description: description,
                },
            );

            setEmployment(
                employment.map((job) =>
                    job.id === editingEmploymentId ? response.data : job,
                ),
            );

            setJobTitle("");
            setCompany("");
            setStartDate("");
            setEndDate("");
            setDescription("");

            setEditingEmploymentId(null);
            setShowEmploymentForm(false);
        
        } catch (error) {
            console.error("Error updating employment:", error);
        }
    };
    const handleAddEducation = async () => {
        const payload = getTokenPayload();
        if (!educationStartDate) {
            alert("Please select a start date.");
            return;
        }

        try {
           let response;

if (editingEducationId) {
  response = await api.patch(`/education/${editingEducationId}`, {
    institution: institution,
    qualification: qualification,
    field_of_study: fieldOfStudy,
    start_date: educationStartDate,
    end_date: educationEndDate || null,
    description: educationDescription,
  });

  setEducation(
    education.map((item) =>
      item.id === editingEducationId ? response.data : item
    )
  );
} else {
  response = await api.post("/education", {
    user_id: payload.userId,
    institution: institution,
    qualification: qualification,
    field_of_study: fieldOfStudy,
    start_date: educationStartDate,
    end_date: educationEndDate || null,
    description: educationDescription,
  });

  setEducation([...education, response.data]);
}
            setInstitution("");
            setQualification("");
            setFieldOfStudy("");
            setEducationStartDate("");
            setEducationEndDate("");
            setEducationDescription("");
            setEditingEducationId(null);
            setShowEducationForm(false);
        } catch (error) {
            console.error("Error adding education:", error);
        }
    };
    const handleDeleteEmployment = async (id) => {
        try {
            await api.delete(`/employment/${id}`);

            setEmployment(employment.filter((job) => job.id !== id));
        } catch (error) {
            console.error("Error deleting employment:", error);
        }
    };
    const handleDeleteEducation = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this education record?",
        );

        if (!confirmDelete) {
            return;
        }
        try {
            await api.delete(`/education/${id}`);

            setEducation(education.filter((item) => item.id !== id));
            setEditingEducationId(null);
setShowEducationForm(false);
        } catch (error) {
            console.error("Error deleting education:", error);
        }
    };
    
  
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";

        const date = new Date(dateValue);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };
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
            <div
                className="connect-row-avatar connect-row-avatar--placeholder"
                aria-hidden="true"
            >
                {(item.firstname || "U").charAt(0).toUpperCase()}
            </div>
        );
    };

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
            alert(
                error.response?.data?.message || "Failed to load connections.",
            );
        }
    };

    const handleOpenConnections = async () => {
        if (isAdmin) return;
        setShowConnectModal(true);
        await loadConnections();
    };

    const showConnectToast = (message) => {
        setConnectToast(message);
        setTimeout(() => {
            setConnectToast("");
        }, 3000);
    };

    const handleAcceptConnection = async (connectionId, item) => {
        try {
            await api.patch(`/connection/${connectionId}/accept`);
            const name = formatConnectionName(item);
            showConnectToast(`Connection request from ${name} accepted!`);
            await loadConnections();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Failed to accept connection request.",
            );
        }
    };

    const handleRejectConnection = async (connectionId) => {
        try {
            await api.patch(`/connection/${connectionId}/reject`);
            await loadConnections();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Failed to reject connection request.",
            );
        }
    };

    const handleCancelConnection = async (
        connectionId,
        successMessage = null,
    ) => {
        try {
            await api.delete(`/connection/${connectionId}`);
            if (successMessage) {
                showConnectToast(successMessage);
            }
            await loadConnections();
        } catch (error) {
            alert(
                error.response?.data?.message || "Failed to cancel connection.",
            );
        }
    };

    if (loading) {
        return (
            <div className="book-list">
                <p>Loading profile...</p>
            </div>
        );
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

    const fullName =
        `${profile.firstname || profile.first_name || "Unknown"} ${profile.lastname || profile.last_name || ""}`.trim();

    return (
        <div className="book-list">
            {connectToast && !isAdmin && (
                <div
                    className="connect-toast connect-toast--long"
                    role="status"
                >
                    {connectToast}
                </div>
            )}
            <div className="linkedin-profile-shell">
                <div className="linkedin-cover" />

                <div className="linkedin-profile-card">
                    <div className="linkedin-profile-header">
                        <div
                            className="linkedin-avatar"
                            onClick={
                                isViewingOther
                                    ? undefined
                                    : () => setShowPhotoModal(true)
                            }
                            style={
                                isViewingOther ? { cursor: "default" } : undefined
                            }
                        >
                            {profile.profile_image_url ? (
                                <img
                                    src={profile.profile_image_url}
                                    alt="Profile"
                                    className="profile-image"
                                />
                            ) : (
                                (profile.firstname || "U")
                                    .charAt(0)
                                    .toUpperCase()
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
                                        脳
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
                                                .getElementById(
                                                    "profileImageInput",
                                                )
                                                ?.click();

                                            setShowPhotoModal(false);
                                        }}
                                    >
                                        Change photo
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isViewingOther && !isAdmin && showConnectModal && (
                            <div
                                className="modal-overlay"
                                onClick={() => setShowConnectModal(false)}
                            >
                                <div
                                    className="modal-card connect-modal"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <div className="modal-header">
                                        <h3>My Connections</h3>
                                        <button
                                            type="button"
                                            className="close-button"
                                            onClick={() =>
                                                setShowConnectModal(false)
                                            }
                                            aria-label="Close connections"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="connect-modal-body">
                                        <section className="connect-section">
                                            <h4>
                                                Requests received (
                                                {pendingReceived.length})
                                            </h4>
                                            {pendingReceived.length === 0 ? (
                                                <p className="connect-empty">
                                                    No pending requests.
                                                </p>
                                            ) : (
                                                pendingReceived.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="connect-row"
                                                    >
                                                        <div className="connect-row-main">
                                                            {renderConnectionAvatar(
                                                                item,
                                                            )}
                                                            <div className="connect-row-info">
                                                                <strong>
                                                                    {formatConnectionName(
                                                                        item,
                                                                    )}
                                                                </strong>
                                                                <span>
                                                                    {[
                                                                        item.current_city,
                                                                        item.current_country,
                                                                    ]
                                                                        .filter(
                                                                            Boolean,
                                                                        )
                                                                        .join(
                                                                            ", ",
                                                                        ) || "—"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="connect-row-actions">
                                                            <button
                                                                type="button"
                                                                className="connect-button connect-button--accept"
                                                                onClick={() =>
                                                                    handleAcceptConnection(
                                                                        item.id,
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="connect-button connect-button--reject"
                                                                onClick={() =>
                                                                    handleRejectConnection(
                                                                        item.id,
                                                                    )
                                                                }
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </section>

                                        <section className="connect-section">
                                            <h4>
                                                Requests sent (
                                                {pendingSent.length})
                                            </h4>
                                            {pendingSent.length === 0 ? (
                                                <p className="connect-empty">
                                                    No sent requests.
                                                </p>
                                            ) : (
                                                pendingSent.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="connect-row"
                                                    >
                                                        <div className="connect-row-main">
                                                            {renderConnectionAvatar(
                                                                item,
                                                            )}
                                                            <div className="connect-row-info">
                                                                <strong>
                                                                    {formatConnectionName(
                                                                        item,
                                                                    )}
                                                                </strong>
                                                                <span className="connect-status-label">
                                                                    Pending
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="connect-row-actions">
                                                            <button
                                                                type="button"
                                                                className="connect-button connect-button--reject"
                                                                onClick={() =>
                                                                    handleCancelConnection(
                                                                        item.id,
                                                                        `Connection request to ${formatConnectionName(item)} cancelled!`,
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

                                        <section className="connect-section">
                                            <h4>
                                                Connections ({connections.length})
                                            </h4>
                                            {connections.length === 0 ? (
                                                <p className="connect-empty">
                                                    No connections yet.
                                                </p>
                                            ) : (
                                                connections.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="connect-row connect-row--clickable"
                                                        onClick={() =>
                                                            handleOpenConnectionProfile(
                                                                item,
                                                            )
                                                        }
                                                        onKeyDown={(event) => {
                                                            if (
                                                                event.key ===
                                                                    "Enter" ||
                                                                event.key === " "
                                                            ) {
                                                                event.preventDefault();
                                                                handleOpenConnectionProfile(
                                                                    item,
                                                                );
                                                            }
                                                        }}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        <div className="connect-row-main">
                                                            {renderConnectionAvatar(
                                                                item,
                                                            )}
                                                            <div className="connect-row-info">
                                                                <strong>
                                                                    {formatConnectionName(
                                                                        item,
                                                                    )}
                                                                </strong>
                                                                <span>
                                                                    {[
                                                                        item.current_city,
                                                                        item.current_country,
                                                                    ]
                                                                        .filter(
                                                                            Boolean,
                                                                        )
                                                                        .join(
                                                                            ", ",
                                                                        ) || "—"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="connect-row-actions">
                                                            <button
                                                                type="button"
                                                                className="connect-button connect-button--reject"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleCancelConnection(
                                                                        item.id,
                                                                    );
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
                                        onChange={(e) =>
                                            setFirstName(e.target.value)
                                        }
                                        placeholder="Enter first name"
                                    />

                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) =>
                                            setLastName(e.target.value)
                                        }
                                        placeholder="Enter last name"
                                    />
                                </>
                            ) : (
                                <h2>{fullName}</h2>
                            )}

                            <p className="linkedin-title">
                                Batch of {" "}
                                {profile.year || profile.graduation_year || "-"}
                            </p>
                            <p className="linkedin-location">
                                {currentCity}, {currentCountry}
                            </p>
                        </div>

                        <div className="profile-header-actions">
                            {isViewingOther ? (
                                <Link
                                    to={isAdmin ? "/profile" : "/profile/me"}
                                    className="profile-header-button"
                                >
                                    {isAdmin
                                        ? "Back to Profiles"
                                        : "Back to My Profile"}
                                </Link>
                            ) : (
                                <>
                                    {!editing && !isAdmin && (
                                        <button
                                            type="button"
                                            className="connect-open-button"
                                            onClick={handleOpenConnections}
                                        >
                                            Connections
                                            {pendingReceived.length > 0 && (
                                                <span
                                                    className="connect-open-badge"
                                                    aria-label={`${pendingReceived.length} pending connection requests`}
                                                >
                                                    {pendingReceived.length > 9
                                                        ? "9+"
                                                        : pendingReceived.length}
                                                </span>
                                            )}
                                        </button>
                                    )}

                                    {editing && !isViewingOther ? (
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
                                        <button
                                            type="button"
                                            className="profile-edit-button"
                                            onClick={() => {
                                                setShowIntroModal(true);
                                            }}
                                            aria-label="Edit intro"
                                        >
                                            <svg
                                                width="42"
                                                height="42"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                            </svg>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="linkedin-profile-body">
                        <div
                            className="linkedin-detail-row"
                            style={{ display: editing && !isViewingOther ? "flex" : "none" }}
                        >
                            <span className="linkedin-label">Location</span>

                            {editing && !isViewingOther ? (
                                <div className="location-edit-fields">
                                    <input
                                        type="text"
                                        value={currentCity}
                                        onChange={(e) =>
                                            setCurrentCity(e.target.value)
                                        }
                                        placeholder="Enter city"
                                    />

                                    <select
                                        value={currentCountry}
                                        onChange={(e) =>
                                            setCurrentCountry(e.target.value)
                                        }
                                    >
                                        <option value="">Select country</option>

                                        {countries.map((country) => (
                                            <option
                                                key={country.Code}
                                                value={country.Name}
                                            >
                                                {country.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <span>
                                    {profile.current_city || "-"}
                                    {profile.current_country
                                        ? `, ${profile.current_country}`
                                        : ""}
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
                                    onChange={(e) =>
                                        setStudentId(e.target.value)
                                    }
                                    placeholder="Enter student ID"
                                />
                            ) : (
                                <span>{profile.student_id || "-"}</span>
                            )}
                        </div>

                        <div className="linkedin-detail-row">
                            <span className="linkedin-label">LinkedIn</span>

                            {editing && !isViewingOther ? (
                                <input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) =>
                                        setLinkedinUrl(e.target.value)
                                    }
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
                                            {profile.linkedin_url}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {/* About Section */}
                <div className="profile-section">
                    <div className="profile-section-header">
                        <h3>About</h3>
                        {!isViewingOther && (
                        <button
                            type="button"
                            className="section-edit-button"
                            onClick={() => setShowAboutModal(true)}
                            aria-label="Edit About"
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                        </button>
                        )}
                    </div>

                    {editing && !isViewingOther ? (
                        <textarea
                            className="about-modal-textarea"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Write something about yourself"
                        />
                    ) : (
                        <p>{profile.bio || "Profile details coming soon."}</p>
                    )}
                </div>
                {showAboutModal && !isViewingOther && (
                    <div className="about-modal-overlay">
                        <div className="about-modal">
                            <h2>Edit about</h2>

                            <textarea
                                className="about-modal-textarea"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Write something about yourself"
                            />

                            <div className="about-modal-actions">
                                <button
                                    className="about-cancel-button"
                                    onClick={() => setShowAboutModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="about-save-button"
                                    onClick={handleSaveAbout}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
  {/* Mentorship Section */}
                <div className="profile-section">
                    <div className="profile-section-header">
                        <h3>Mentorship</h3>
                        {!isViewingOther && (
                        <button
                            type="button"
                            className="section-edit-button"
                            onClick={() => setShowMentorshipModal(true)}
                            aria-label="Edit Mentorship"
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                        </button>
                        )}
                    </div>

  {showMentorshipModal ? (
  <div className="intro-modal-overlay">
    <div className="intro-modal mentorship-modal">

<div className="intro-modal-header">
  <h2>Edit mentorship</h2>

        <button
          type="button"
          className="intro-modal-close"
          onClick={() => {
            setMentorshipAvailable(profile.mentorship_available);
            setExpertise(profile.expertise || "");
            setMentorshipAvailability(profile.mentorship_availability || "");
            setShowMentorshipDaysDropdown(false);
            setShowMentorshipModal(false);
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

    <div className="intro-modal-body mentorship-edit-fields">
      <label className="mentorship-checkbox">
        <input
          type="checkbox"
          checked={mentorshipAvailable}
          onChange={(e) => setMentorshipAvailable(e.target.checked)}
        />
        Available for mentorship
      </label>
{mentorshipAvailable && (
  <>
  <label className="mentorship-field-label">
  Expertise
</label>
    <select
    className="mentorship-expertise-select"
  value={expertiseId}
  onChange={(e) => {
    setExpertiseId(e.target.value);

    const selected = expertiseOptions.find(
      (item) => String(item.expertise_id) === e.target.value
    );

    setExpertise(selected?.expertise || "");
  }}
>
  <option value="">Select expertise</option>

  {expertiseOptions.map((item) => (
    <option key={item.expertise_id} value={item.expertise_id}>
      {item.expertise}
    </option>
  ))}
</select>
<label className="mentorship-field-label">
  Availability
</label>

<small className="mentorship-field-help">
  Choose one or more days when you are available to mentor.
</small>
    <div className="mentorship-days-dropdown">
      <button
        type="button"
        className="mentorship-availability-select"
        onClick={() =>
          setShowMentorshipDaysDropdown(!showMentorshipDaysDropdown)
        }
      >
        {mentorshipAvailability || "Select days"} ▾
      </button>

      {showMentorshipDaysDropdown && (
        <div className="mentorship-days-options">
          {mentorshipDays.map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={mentorshipAvailability
                  .split(",")
                  .map((item) => item.trim())
                  .includes(day)}
                onChange={() => handleMentorshipDayChange(day)}
              />
              {day}
            </label>
          ))}

          
      
        </div>
      )}
           
      
    </div>
  </>
)}
</div>

<div className="intro-modal-footer">
  <button
    type="button"
    className="intro-save-button"
    onClick={handleSaveMentorship}
  >
    Save
  </button>
    </div>
  </div>
  </div>
  ) : (
    <>
      <p>
        <strong>Available for mentorship:</strong>{" "}
        {mentorshipAvailable ? "Yes" : "No"}
      </p>

      {mentorshipAvailable && (
  <>
    <p>
      <strong>Expertise:</strong> {expertise || "-"}
    </p>

    <p>
      <strong>Availability:</strong> {mentorshipAvailability || "-"}
    </p>
  </>
)}
    </>
    )}
</div>
{/* Education Section */}

                <div className="profile-section">
                    <div className="profile-section-header">
                        <h3>Education</h3>
                        
                          <div className="education-header-actions">
                          {!isViewingOther && ( <button

                              type="button"
                              className="linkedin-add-button"
                              onClick={() => {
                                setEditingEducationId(null);
                                setInstitution("");
                                setQualification("");
                                setFieldOfStudy("");
                                setEducationStartDate("");
                                setEducationEndDate("");
                                setEducationDescription("");
                                setShowEducationForm(true);
                              }}
                              aria-label="Add education"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                aria-hidden="true"
                              >
                                <path d="M11 5h2v14h-2zM5 11h14v2H5z" />
                              </svg>
                            </button>
                            )}

                        {canAccess && (
                        <div className="education-header-actions">
                            <button
                                type="button"
                                className="section-edit-button"
                                onClick={() => setShowEducationManager(true)}
                                aria-label="Edit Education"
                            >
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                            </button>
                        </div>
                        )}
                    </div>
{!isViewingOther && showEducationManager && (
  <div className="intro-modal-overlay">
    <div className="intro-modal">
      <div className="intro-modal-header">
        <h2>Education</h2>

        <button
          type="button"
          className="intro-modal-close"
          onClick={() => setShowEducationManager(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="intro-modal-body">
    {education.length === 0 ? (
  <p>No education added.</p>
) : (
  education.map((item) => (
    <div key={item.id} className="experience-manager-item">

      <div className="experience-manager-info">
        <strong>{item.institution || "-"}</strong>

        <div>{item.qualification || "-"}</div>

        {(item.field_of_study || item.fieldOfStudy) && (
          <div>
            {item.field_of_study || item.fieldOfStudy}
          </div>
        )}

        <div>
          {item.start_date
            ? new Date(item.start_date).toLocaleDateString("en-GB")
            : ""}

          {" - "}

          {item.end_date
            ? new Date(item.end_date).toLocaleDateString("en-GB")
            : "Present"}
        </div>
      </div>

     <button
  type="button"
  className="section-edit-button"
  onClick={() => {
    setEditingEducationId(item.id);

    setInstitution(item.institution || "");
    setQualification(item.qualification || "");
    setFieldOfStudy(item.field_of_study || item.fieldOfStudy || "");

    setEducationStartDate(
      item.start_date ? String(item.start_date).split("T")[0] : ""
    );

    setEducationEndDate(
      item.end_date ? String(item.end_date).split("T")[0] : ""
    );

    setEducationDescription(item.description || "");

    setShowEducationManager(false);
    setShowEducationForm(true);
  }}
  aria-label="Edit education"
>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>

    </div>
  ))
)}
      </div>
    </div>
  </div>
)}
                    {!isViewingOther && showEducationForm && (
                    <div className="intro-modal-overlay">
  <div className="intro-modal">

    <div className="intro-modal-header">
    <h2>{editingEducationId ? "Edit education" : "Add education"}</h2>

      <button
        type="button"
        className="intro-modal-close"
        onClick={() => setShowEducationForm(false)}
        aria-label="Close"
      >
        ×
      </button>
    </div>

    <div className="intro-modal-body">
                            <input
                                type="text"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
                                placeholder="Institution"
                            />

                            <input
                                type="text"
                                value={qualification}
                                onChange={(e) =>
                                    setQualification(e.target.value)
                                }
                                placeholder="Qualification"
                            />

                            <input
                                type="text"
                                value={fieldOfStudy}
                                onChange={(e) =>
                                    setFieldOfStudy(e.target.value)
                                }
                                placeholder="Field of study"
                            />

                            <input
                                type="date"
                                value={educationStartDate}
                                onChange={(e) =>
                                    setEducationStartDate(e.target.value)
                                }
                            />

                            <input
                                type="date"
                                value={educationEndDate}
                                onChange={(e) =>
                                    setEducationEndDate(e.target.value)
                                }
                            />

                            <textarea
                                value={educationDescription}
                                onChange={(e) =>
                                    setEducationDescription(e.target.value)
                                }
                                placeholder="Education description"
                            />

                           </div>

                          <div className="intro-modal-footer">                          
                            {editingEducationId && (
                              <button
                                type="button"
                                className="education-delete-button"
                                onClick={() => handleDeleteEducation(editingEducationId)}
                              >
                                Delete education
                              </button>
                            )}
                            <button
                              type="button"
                              className="intro-save-button"
                              onClick={handleAddEducation}
                            >
                              {editingEducationId ? "Save" : "Add"}
                            </button>
                          </div>

                          </div>
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

                               
                            </div>
                        ))
                    )}
                    </div>

<div className="profile-section">
  <div className="profile-section-header">
    <h3>Experience</h3>

                        
                        <div className="profile-section-actions experience-section-actions">
                            {!isViewingOther && (
                              <button
                                type="button"
                                className="linkedin-add-button"
                                onClick={() => {
                                setEditingEmploymentId(null);

                                setJobTitle("");
                                setCompany("");
                                setStartDate("");
                                setEndDate("");
                                setDescription("");
                                setShowEmploymentForm(true);
                              }}
                                aria-label="Add experience"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  aria-hidden="true"
                                >
                                  <path d="M11 5h2v14h-2zM5 11h14v2H5z" />
                                </svg>
                            </button>
                            )}

                            {canAccess && (
                              <button
                                type="button"
                                className="section-edit-button"
                            onClick={() => setShowExperienceManager(true)}
                                aria-label="Edit Experience"
                            >
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                            </button>
                            )}
                        </div>
                        
                    </div>
{showExperienceManager && (
  <div className="intro-modal-overlay">
    <div className="intro-modal">
      <div className="intro-modal-header">
        <h2>Experience</h2>

        <button
          type="button"
          className="intro-modal-close"
          onClick={() => setShowExperienceManager(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="intro-modal-body">
    {employment.length === 0 ? (
  <p>No experience added.</p>
) : (
  employment.map((job) => (
    <div key={job.id} className="experience-manager-item">
      <div className="experience-manager-info">
        <strong>{job.job_title}</strong>
        <div>{job.company}</div>

        <div>
          {job.start_date
            ? new Date(job.start_date).toLocaleDateString("en-GB")
            : ""}
          {" - "}
          {job.end_date
            ? new Date(job.end_date).toLocaleDateString("en-GB")
            : "Present"}
        </div>
      </div>

      <button
        type="button"
        className="section-edit-button"
        onClick={() => {
          setShowExperienceManager(false);
          handleEditEmployment(job);
        }}
        aria-label="Edit experience"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </div>
  ))
)}
      </div>
    </div>
  </div>
)}
                    {showEmploymentForm && (
                        <div className="intro-modal-overlay">
                            <div className="intro-modal">
                                <div className="intro-modal-header">
                                    <h2>
                                        {editingEmploymentId
                                            ? "Edit experience"
                                            : "Add experience"}
                                    </h2>

                                    <button
                                        type="button"
                                        className="intro-modal-close"
                                        onClick={() =>
                                            setShowEmploymentForm(false)
                                        }
                                        aria-label="Close"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="intro-modal-body">
                                    <div className="intro-form-group">
                                        <label>Job title</label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) =>
                                                setJobTitle(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="intro-form-group">
                                        <label>Company</label>
                                        <input
                                            type="text"
                                            value={company}
                                            onChange={(e) =>
                                                setCompany(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="intro-form-group">
                                        <label>Start date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) =>
                                                setStartDate(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="intro-form-group">
                                        <label>End date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) =>
                                                setEndDate(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="intro-form-group">
                                        <label>Job description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="intro-modal-footer">
                                    {editingEmploymentId && (
                                      <button
                                        type="button"
                                        className="employment-delete-modal-button"
                                        onClick={() => handleDeleteEmployment(editingEmploymentId)}
                                      >
                                        Delete experience
                                      </button>
                                    )}
                                    <button
                                        type="button"
                                        className="intro-save-button"
                                        onClick={
                                            editingEmploymentId
                                                ? handleUpdateEmployment
                                                : handleAddEmployment
                                        }
                                    >
                                        {editingEmploymentId ? "Save" : "Add"}
                                    </button>
                                </div>
                            </div>
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
                                        ? new Date(
                                              job.start_date,
                                          ).toLocaleDateString("en-NZ")
                                        : "-"}{" "}
                                    -{" "}
                                    {job.end_date
                                        ? new Date(
                                              job.end_date,
                                          ).toLocaleDateString("en-NZ")
                                        : "Present"}
                                </div>

                               
                            </div>
                        ))
                    )}
                </div>
            </div>
            {showIntroModal && !isViewingOther && (
                <div className="intro-modal-overlay">
                    <div className="intro-modal">
                        <div className="intro-modal-header">
                            <h2>Edit intro</h2>

                            <button
                                type="button"
                                className="intro-modal-close"
                                onClick={() => {
                                    setShowIntroModal(false);
                                    setEditing(false);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="intro-modal-body">
                            <div className="intro-form-group">
                                <label>First name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                />
                            </div>

                            <div className="intro-form-group">
                                <label>Last name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                />
                            </div>

                            <div className="intro-form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={currentCity}
                                    onChange={(e) =>
                                        setCurrentCity(e.target.value)
                                    }
                                />
                            </div>

                            <div className="intro-form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    value={currentCountry}
                                    onChange={(e) =>
                                        setCurrentCountry(e.target.value)
                                    }
                                />
                            </div>

                            <div className="intro-form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="intro-form-group">
                                <label>Student ID</label>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) =>
                                        setStudentId(e.target.value)
                                    }
                                />
                            </div>

                            <div className="intro-form-group">
                                <label>LinkedIn</label>
                                <input
                                    type="text"
                                    value={linkedinUrl}
                                    onChange={(e) =>
                                        setLinkedinUrl(e.target.value)
                                    }
                                />
                            </div>
                            {isAdmin && (
                                <div className="toggle-container">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(enableEmail)}
                                            onChange={async (e) => {
                                                const nextValue =
                                                    e.target.checked;
                                                setEnableEmail(nextValue);

                                                try {
                                                    await api.patch(
                                                        "/auth/user/enable-email",
                                                        {
                                                            enableEmail:
                                                                nextValue,
                                                        },
                                                    );
                                                } catch (error) {
                                                    console.error(
                                                        "Error updating email notification preference:",
                                                        error,
                                                    );
                                                    setEnableEmail(!nextValue);
                                                }
                                            }}
                                        />
                                        <span className="slider" />
                                    </label>
                                    <span className="toggle-label">
                                        Receive Email Notifications
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="intro-modal-footer">
                            <button
                                type="button"
                                className="intro-save-button"
                                onClick={async () => {
                                    await handleSave();
                                    setShowIntroModal(false);
                                    setEditing(false);
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}

export default MyProfilePage;
