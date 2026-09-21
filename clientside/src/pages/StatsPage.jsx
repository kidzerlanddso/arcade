import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

const getAdminFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return [true, 1, "1", "true"].includes(payload.admin);
  } catch {
    return localStorage.getItem("isAdmin") === "true";
  }
};

const countBy = (items, getKey) =>
  items.reduce((counts, item) => {
    const key =
      String(getKey(item) || "Not specified").trim() || "Not specified";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

const topEntries = (counts, limit = 6) =>
  Object.entries(counts)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .slice(0, limit);

const formatNumber = (value) => new Intl.NumberFormat("en-NZ").format(value);

function StatCard({ label, value, detail, tone }) {
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <article className={`stats-metric-card stats-metric-card-${tone}`}>
      <span className="stats-metric-label">{label}</span>
      <strong>{displayValue}</strong>
      <span className="stats-metric-detail">{detail}</span>
    </article>
  );
}

function DistributionChart({ title, subtitle, entries, total, tone }) {
  return (
    <section className={`stats-chart-card stats-chart-${tone}`}>
      <div className="stats-chart-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="stats-chart-count">{formatNumber(total)}</span>
      </div>
      <div className="stats-bars">
        {entries.length === 0 ? (
          <p className="stats-empty">No data available yet.</p>
        ) : (
          entries.map(([label, count]) => {
            const percentage = total ? Math.max(5, (count / total) * 100) : 0;
            return (
              <div className="stats-bar-row" key={label}>
                <div className="stats-bar-label">
                  <span title={label}>{label}</span>
                  <strong>{count}</strong>
                </div>
                <div className="stats-bar-track">
                  <span style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function StatsPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const isAdmin = getAdminFromToken();

  useEffect(() => {
    if (!isAdmin) return undefined;

    const controller = new AbortController();
    api
      .get("/profile", { signal: controller.signal })
      .then((response) => {
        const data = response.data.data || response.data;
        setProfiles(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setErrorMessage(
            error.response?.data?.message ||
              "Unable to load alumni statistics.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const withExpertise = profiles.filter((profile) => profile.expertise?.length);
  const mentorshipAvailable = profiles.filter(
    (profile) =>
      profile.mentorship_available === true ||
      profile.mentorship_available === 1,
  );
  const completeProfiles = profiles.filter(
    (profile) =>
      profile.firstname &&
      profile.lastname &&
      profile.email &&
      profile.current_city &&
      profile.year,
  );
  const yearEntries = topEntries(countBy(profiles, (profile) => profile.year));
  const cityEntries = topEntries(
    countBy(profiles, (profile) => profile.current_city),
  );
  const expertiseEntries = topEntries(
    countBy(
      profiles.flatMap((profile) => profile.expertise || []),
      (expertise) => expertise.name,
    ),
  );
  const expertiseTotal = profiles.reduce(
    (total, profile) => total + (profile.expertise?.length || 0),
    0,
  );
  const completionRate = profiles.length
    ? Math.round((completeProfiles.length / profiles.length) * 100)
    : 0;

  return (
    <main className="stats-page">
      <header className="stats-hero">
        <div>
          <h1>Admin Intelligence</h1>
        </div>
        <div className="stats-hero-orbit" aria-hidden="true">
          <span>
            <img src="src/assets/logo_footer_white.png" alt="Logo" />
          </span>
        </div>
      </header>

      {errorMessage && <p className="stats-error">{errorMessage}</p>}

      {loading ? (
        <div className="stats-loading">Gathering alumni insights...</div>
      ) : (
        <>
          <section className="stats-metric-grid" aria-label="Alumni summary">
            <StatCard
              label="Active alumni"
              value={profiles.length}
              detail="in the directory"
              tone="blue"
            />
            <StatCard
              label="With expertise"
              value={withExpertise.length}
              detail={`${expertiseTotal} expertise tags`}
              tone="coral"
            />
            <StatCard
              label="Mentorship ready"
              value={mentorshipAvailable.length}
              detail="open to supporting others"
              tone="mint"
            />
            <StatCard
              label="Profile completion"
              value={`${completionRate}%`}
              detail={`${completeProfiles.length} complete profiles`}
              tone="gold"
            />
          </section>

          <section className="stats-chart-grid">
            <DistributionChart
              title="Alumni by graduation year"
              subtitle="Where each cohort is represented"
              entries={yearEntries}
              total={profiles.length}
              tone="violet"
            />
            <DistributionChart
              title="Community footprint"
              subtitle="Most represented cities"
              entries={cityEntries}
              total={profiles.length}
              tone="teal"
            />
            <DistributionChart
              title="Expertise landscape"
              subtitle="Skills and interests shared"
              entries={expertiseEntries}
              total={expertiseTotal}
              tone="orange"
            />
          </section>

          <section className="stats-insight-band">
            <div>
              <span className="stats-eyebrow">Community signal</span>
              <h2>
                {mentorshipAvailable.length
                  ? "Knowledge is ready to move."
                  : "The network is ready to grow."}
              </h2>
              <p>
                {mentorshipAvailable.length
                  ? `${mentorshipAvailable.length} alumni have made themselves available for mentorship and connection.`
                  : "Invite alumni to complete their profiles and make their expertise visible to the community."}
              </p>
            </div>
            <div
              className="stats-ring"
              style={{ "--completion": `${completionRate * 3.6}deg` }}
            >
              <strong>{completionRate}%</strong>
              <span>complete</span>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default StatsPage;
