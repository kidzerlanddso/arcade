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
    <button onClick={() => setEditing(true)}>
      Edit Profile
    </button>
  )}

</div>

          <div className="linkedin-profile-body">
           <div className="linkedin-detail-row">
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
        {/* Education Section */}
<div className="profile-section">
  <div className="profile-section-header">
    <h3>Education</h3>

    {editing && (
      <button
        className="add-experience-button"
        onClick={() => setShowEducationForm(true)}
      >
        +
      </button>
    )}
  </div>

  {editing && showEducationForm && (
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

        {editing && (
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

    {editing && (
      <button
  className="add-experience-button"
  onClick={() => setShowEmploymentForm(true)}
>
  +
</button>
    )}
  </div>
  {editing && showEmploymentForm && (
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

      {editing && (
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
