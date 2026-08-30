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
  const [showIntroModal, setShowIntroModal] = useState(false);
const [bio, setBio] = useState("");
const [linkedinUrl, setLinkedinUrl] = useState("");
const [mentorshipAvailable, setMentorshipAvailable] = useState(false);
const [expertise, setExpertise] = useState("");
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
const handleMentorshipDayChange = (day) => {
  const selectedDays = mentorshipAvailability
    .split(",")
    .map((item) => item.trim())
    .filter((item) => mentorshipDays.includes(item));

  if (selectedDays.includes(day)) {
    setMentorshipAvailability(
      selectedDays.filter((item) => item !== day).join(", ")
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
const [showMentorshipDaysDropdown, setShowMentorshipDaysDropdown] = useState(false);
const [education, setEducation] = useState([]);
const [educationBackup, setEducationBackup] = useState([]);
const [institution, setInstitution] = useState("");
const [qualification, setQualification] = useState("");
const [fieldOfStudy, setFieldOfStudy] = useState("");
const [educationStartDate, setEducationStartDate] = useState("");
const [educationEndDate, setEducationEndDate] = useState("");
const [educationDescription, setEducationDescription] = useState("");
const [showEducationForm, setShowEducationForm] = useState(false);
const [showEducationEditMode, setShowEducationEditMode] = useState(false);
const [showEmploymentEditMode, setShowEmploymentEditMode] = useState(false);
  useEffect(() => {
    const payload = getTokenPayload();

    if (!payload) {
      setLoading(false);
      return;
    }

    api
      .get("/profile/me")
      .then((response) => {
        const currentProfile = response.data;

        setProfile(currentProfile || null);
       
        setBio(currentProfile?.bio || "");
setLinkedinUrl(currentProfile?.linkedin_url || "");
setMentorshipAvailable(currentProfile?.mentorship_available ?? false);
setExpertise(currentProfile?.expertise || "");
setMentorshipAvailability(currentProfile?.mentorship_availability || "");
setProfileImageUrl(currentProfile?.profile_image_url || "");
setCurrentCity(currentProfile?.current_city || "");
setCurrentCountry(currentProfile?.current_country || "");
setEmail(currentProfile?.email || "");
setStudentId(currentProfile?.student_id || "");
setFirstName(currentProfile?.firstname || currentProfile?.first_name || "");
setLastName(currentProfile?.lastname || currentProfile?.last_name || "");
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
}, []);
useEffect(() => {
  api
    .get("/country")
    .then((response) => {
      setCountries(response.data || []);
    })
    .catch((error) => {
      console.error("Error loading countries:", error);
      setCountries([]);
    });
}, []);
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
  mentorship_available: mentorshipAvailable,
expertise: expertise,
mentorship_availability: mentorshipAvailability,
  profile_image_url: imageUrl,
  current_city: currentCity,
  current_country:currentCountry,
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
      expertise: expertise,
      mentorship_availability: mentorshipAvailability,
    });

    setProfile((prev) => ({
      ...prev,
      mentorship_available: mentorshipAvailable,
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
      description: description
    });

    setEmployment([...employment, response.data]);
    

    setJobTitle("");
    setCompany("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setShowEmploymentForm(false);
setShowEmploymentEditMode(false);
  } catch (error) {
    console.error("Error adding employment:", error);
  }
};
const handleEditEmployment = (job) => {
  setEditingEmploymentId(job.id);

  setJobTitle(job.job_title || "");
  setCompany(job.company || "");
  setStartDate(job.start_date ? String(job.start_date).split("T")[0] : "");
  setEndDate(job.end_date ? String(job.end_date).split("T")[0] : "");
  setDescription(job.description || "");

  setShowEmploymentEditMode(true);
  setShowEmploymentForm(true);
};
const handleUpdateEmployment = async () => {
  try {
    const response = await api.patch(`/employment/${editingEmploymentId}`, {
      company: company,
      job_title: jobTitle,
      start_date: startDate,
      end_date: endDate || null,
      description: description,
    });

    setEmployment(
      employment.map((job) =>
        job.id === editingEmploymentId ? response.data : job
      )
    );

    setJobTitle("");
    setCompany("");
    setStartDate("");
    setEndDate("");
    setDescription("");

    setEditingEmploymentId(null);
    setShowEmploymentForm(false);
    setShowEmploymentEditMode(false);
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
  const confirmDelete = window.confirm(
  "Are you sure you want to delete this education record?"
);

if (!confirmDelete) {
  return;
}
  try {
    await api.delete(`/education/${id}`);

    setEducation(
      education.filter((item) => item.id !== id)
    );
  } catch (error) {
    console.error("Error deleting education:", error);
  }
};
const handleSaveEducationChanges = async () => {
  
  try {
    const responses = await Promise.all(
      education.map((item) =>
        api.patch(`/education/${item.id}`, {
          institution: item.institution,
          qualification: item.qualification,
          field_of_study: item.field_of_study,
         start_date: formatDateForInput(item.start_date),
end_date: item.end_date ? formatDateForInput(item.end_date) : null,
          description: item.description || "",
        })
      )
    );

    setEducation(responses.map((response) => response.data));
    setShowEducationEditMode(false);
    setShowEducationForm(false);
  } catch (error) {
    console.error("Error updating education:", error);
  }
};
const handleCancelEducationChanges = () => {
  setEducation(educationBackup);
  setShowEducationEditMode(false);
  setShowEducationForm(false);
};
const handleEducationChange = (id, field, value) => {
  setEducation((prev) =>
    prev.map((item) =>
      item.id === id
        ? { ...item, [field]: value }
        : item
    )
  );
};
const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

  <div
    className="linkedin-avatar"
    onClick={() => setShowPhotoModal(true)}
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

  <input
    id="profileImageInput"
    type="file"
    accept="image/*"
    onChange={handleProfileImageChange}
    style={{ display: "none" }}
  />

  {showPhotoModal && (
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

  <div className="linkedin-profile-meta">
    {editing ? (
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
    <p className="linkedin-location">
  {currentCity}, {currentCountry}
</p>
  </div>

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

</div>

          <div className="linkedin-profile-body">
           <div
  className="linkedin-detail-row"
  style={{ display: editing ? "flex" : "none" }}
>
  <span className="linkedin-label">Location</span>

  {editing ? (
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

  {editing ? (
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

  {editing ? (
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
        {/* About Section */}
<div className="profile-section">
  <div className="profile-section-header">
  <h3>About</h3>
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
</div>

  {editing ? (
    <textarea
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      placeholder="Write something about yourself"
    />
  ) : (
    <p>{profile.bio || "Profile details coming soon."}</p>
  )}
</div>
{showAboutModal && (
  <div className="about-modal-overlay">
    <div className="about-modal">
      <h2>Edit about</h2>

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Write something about yourself"
      />

      <div className="about-modal-actions">
  <button
    type="button"
    onClick={() => setShowAboutModal(false)}
  >
    Cancel
  </button>

  <button
    type="button"
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
</div>

  {showMentorshipModal ? (
    <div className="mentorship-edit-fields">
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
    <input
      type="text"
      value={expertise}
      onChange={(e) => setExpertise(e.target.value)}
      placeholder="Areas of expertise"
    />

    <div className="mentorship-days-dropdown">
      <button
        type="button"
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

          <button
            type="button"
            className="mentorship-days-save"
            onClick={handleSaveMentorship}
          >
            Save
          </button>
        </div>
      )}
    </div>
  </>
)}

<div className="mentorship-edit-actions">
  <button
    type="button"
    onClick={() => {
      setMentorshipAvailable(profile.mentorship_available);
      setExpertise(profile.expertise || "");
      setMentorshipAvailability(profile.mentorship_availability || "");
      setShowMentorshipDaysDropdown(false);
      setShowMentorshipModal(false);
    }}
  >
    Cancel
  </button>

  {!mentorshipAvailable && (
    <button
      type="button"
      onClick={handleSaveMentorship}
    >
      Save
    </button>
  )}
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
  <button
    type="button"
    className="section-edit-button"
    onClick={() => {
  setEducationBackup(education.map((item) => ({ ...item })));
  setShowEducationEditMode(true);
}}
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

  {showEducationEditMode && (
    <button
      className="add-experience-button"
      onClick={() => setShowEducationForm(true)}
    >
      +
    </button>
  )}
</div>
  </div>

  {showEducationEditMode && showEducationForm && (
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
      {showEducationEditMode ? (
  <div className="education-edit-field">
    <label htmlFor={`institution-${item.id}`}>Institution</label>

    <input
      id={`institution-${item.id}`}
      name="institution"
      type="text"
      value={item.institution || ""}
      onChange={(e) =>
        handleEducationChange(item.id, "institution", e.target.value)
      }
    />
  </div>
) : (
  <strong>{item.institution || "-"}</strong>
)}

    {showEducationEditMode ? (
  <div className="education-edit-field">
    <label htmlFor={`qualification-${item.id}`}>Qualification</label>

    <input
      id={`qualification-${item.id}`}
      name="qualification"
      type="text"
      value={item.qualification || ""}
      onChange={(e) =>
        handleEducationChange(item.id, "qualification", e.target.value)
      }
    />
  </div>
) : (
  <div>{item.qualification || "-"}</div>
)}

      {showEducationEditMode ? (
  <div className="education-edit-field">
    <label htmlFor={`field-${item.id}`}>Field of Study</label>

    <input
      id={`field-${item.id}`}
      name="field_of_study"
      type="text"
      value={item.field_of_study || ""}
      onChange={(e) =>
        handleEducationChange(item.id, "field_of_study", e.target.value)
      }
    />
  </div>
) : (
  <div>{item.field_of_study || "-"}</div>
)}

        {showEducationEditMode ? (
  <div className="education-dates-edit">
    <div className="education-edit-field">
      <label htmlFor={`start-date-${item.id}`}>Start Date</label>

      <input
        id={`start-date-${item.id}`}
        name="start_date"
        type="date"
      value={formatDateForInput(item.start_date)}
        onChange={(e) =>
          handleEducationChange(item.id, "start_date", e.target.value)
        }
      />
    </div>

    <div className="education-edit-field">
      <label htmlFor={`end-date-${item.id}`}>End Date</label>

      <input
        id={`end-date-${item.id}`}
        name="end_date"
        type="date"
      value={formatDateForInput(item.end_date)}
        onChange={(e) =>
          handleEducationChange(item.id, "end_date", e.target.value)
        }
      />
    </div>
  </div>
) : (
  <div>
    {item.start_date
      ? new Date(item.start_date).toLocaleDateString("en-NZ")
      : "-"}
    {" - "}
    {item.end_date
      ? new Date(item.end_date).toLocaleDateString("en-NZ")
      : "Present"}
  </div>
)}

        {item.description && <p>{item.description}</p>}

        {(editing || showEducationEditMode) && (
          <button onClick={() => handleDeleteEducation(item.id)}>
            Delete
          </button>
        )}
      </div>
    ))
  )}
  {showEducationEditMode && (
  <>
  <button
    type="button"
    className="education-save-button"
    onClick={handleSaveEducationChanges}
  >
    Save
  </button>
  <button
  type="button"
  onClick={handleCancelEducationChanges}
>
  Cancel
</button>
</>
)}
</div>
        <div className="profile-section">
  <div className="profile-section-header">
  <h3>Experience</h3>

<div className="profile-section-actions experience-section-actions">
    {showEmploymentEditMode && (
      <button
        type="button"
        className="add-experience-button"
        onClick={() => setShowEmploymentForm(true)}
      >
        Add
      </button>
    )}

    <button
      type="button"
      className="section-edit-button"
      onClick={() => setShowEmploymentEditMode(true)}
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
  </div>
</div>

    
 
{showEmploymentEditMode && showEmploymentForm && (
  <div className="intro-modal-overlay">
    <div className="intro-modal">

      <div className="intro-modal-header">
      <h2>{editingEmploymentId ? "Edit experience" : "Add experience"}</h2>

        <button
          type="button"
          className="intro-modal-close"
          onClick={() => setShowEmploymentForm(false)}
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
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="intro-form-group">
          <label>Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="intro-form-group">
          <label>Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="intro-form-group">
          <label>End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="intro-form-group">
          <label>Job description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

      </div>

      <div className="intro-modal-footer">
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
          ? new Date(job.start_date).toLocaleDateString("en-NZ")
          : "-"}{" "}
        -{" "}
        {job.end_date
          ? new Date(job.end_date).toLocaleDateString("en-NZ")
          : "Present"}
      </div>

     {showEmploymentEditMode && (
  <div className="experience-item-actions">
    <button
      type="button"
      onClick={() => handleEditEmployment(job)}
    >
      Edit
    </button>

    <button
      type="button"
      onClick={() => handleDeleteEmployment(job.id)}
    >
      Delete
    </button>
  </div>
)}
    </div>
  ))
)}
</div>
      </div>
      {showIntroModal && (
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
    onChange={(e) => setFirstName(e.target.value)}
  />
</div>

<div className="intro-form-group">
  <label>Last name</label>
  <input
    type="text"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
  />
</div>

<div className="intro-form-group">
  <label>City</label>
  <input
    type="text"
    value={currentCity}
    onChange={(e) => setCurrentCity(e.target.value)}
  />
</div>

<div className="intro-form-group">
  <label>Country</label>
  <input
    type="text"
    value={currentCountry}
    onChange={(e) => setCurrentCountry(e.target.value)}
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
    onChange={(e) => setStudentId(e.target.value)}
  />
</div>

<div className="intro-form-group">
  <label>LinkedIn</label>
  <input
    type="text"
    value={linkedinUrl}
    onChange={(e) => setLinkedinUrl(e.target.value)}
  />
</div>
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
