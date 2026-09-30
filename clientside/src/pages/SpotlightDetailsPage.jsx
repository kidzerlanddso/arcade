import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import schoolBackground from "../assets/school_bg.webp";

const formatSpotlightDate = (value) => {
  if (!value) return "";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return date.toLocaleDateString("en-NZ", { dateStyle: "long" });
};

const getSpotlightCategory = (spotlight) =>
  spotlight.spotlightType === "teacher"
    ? "Teacher Spotlight"
    : spotlight.spotlightType === "alumni"
      ? "Alumni Spotlight"
      : "General Spotlight";

function SpotlightDetailsPage() {
  const { spotlightId } = useParams();
  const [spotlights, setSpotlights] = useState([]);
  const [spotlight, setSpotlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setErrorMessage("");
    const request = spotlightId
      ? api.get(`/content/spotlights/${spotlightId}`).then((response) => {
          if (isCurrent) setSpotlight(response.data);
        })
      : api.get("/content/spotlights").then((response) => {
          if (isCurrent) setSpotlights(response.data);
        });

    request
      .catch((error) => {
        if (isCurrent) {
          setErrorMessage(
            error.response?.data?.message || "Unable to load spotlights.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [spotlightId]);

  if (loading) {
    return <main className="spotlight-detail-page"><p>Loading spotlights...</p></main>;
  }

  if (errorMessage) {
    return (
      <main className="spotlight-detail-page">
        <p className="events-error" role="alert">{errorMessage}</p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </main>
    );
  }

  if (!spotlightId) {
    return (
      <main className="spotlight-detail-page spotlight-index-page">
        <Link className="spotlight-detail-back" to="/dashboard">Back to Dashboard</Link>
        <header className="spotlight-index-header">
          <p className="spotlight-detail-category">Rototuna community</p>
          <h1>Spotlights</h1>
          <p>Stories and achievements from our teachers, alumni, and community.</p>
        </header>
        {spotlights.length ? (
          <div className="teacher-spotlight-grid">
            {spotlights.map((item) => {
              const subject = item.displayName || "Rototuna community";
              return (
                <Link
                  to={`/spotlights/${item.id}`}
                  className="dashboard-spotlight-card"
                  key={item.id}
                >
                  <img
                    src={item.image || item.teacherImage || schoolBackground}
                    alt={item.image ? item.title : `${subject} profile`}
                  />
                  <div className="dashboard-spotlight-card-copy">
                    <p className="dashboard-spotlight-teacher">{subject}</p>
                    <h2>{item.title}</h2>
                    <p>{item.story}</p>
                    <small>{formatSpotlightDate(item.achievementDate)}</small>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="events-empty-state">No spotlights have been published yet.</p>
        )}
      </main>
    );
  }

  if (!spotlight) {
    return (
      <main className="spotlight-detail-page">
        <p className="events-error" role="alert">Spotlight not found.</p>
        <Link to="/spotlights">View all spotlights</Link>
      </main>
    );
  }

  const subject = spotlight.displayName || "Rototuna community";

  return (
    <main className="spotlight-detail-page">
      <Link className="spotlight-detail-back" to="/spotlights">Back to all spotlights</Link>
      <article className="spotlight-detail-article">
        <div className="spotlight-detail-heading">
          <p className="spotlight-detail-category">{getSpotlightCategory(spotlight)}</p>
          <h1>{spotlight.title}</h1>
          <p className="spotlight-detail-byline">
            {subject}{spotlight.teacherRole ? ` · ${spotlight.teacherRole}` : ""}
            {spotlight.achievementDate ? ` · ${formatSpotlightDate(spotlight.achievementDate)}` : ""}
          </p>
        </div>
        <img
          className="spotlight-detail-image"
          src={spotlight.image || spotlight.teacherImage || schoolBackground}
          alt={spotlight.image ? spotlight.title : `${subject} profile`}
        />
        <div className="spotlight-detail-story">
          {spotlight.story.split(/\n\s*\n/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}

export default SpotlightDetailsPage;
