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

const pieEntries = (counts, limit = 6) => {
  const entries = Object.entries(counts).sort(
    ([, firstCount], [, secondCount]) => secondCount - firstCount,
  );
  const visibleEntries = entries.slice(0, limit);
  const otherCount = entries
    .slice(limit)
    .reduce((total, [, count]) => total + count, 0);

  return otherCount
    ? [...visibleEntries, ["Other", otherCount]]
    : visibleEntries;
};

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
  const [selectedLabel, setSelectedLabel] = useState(entries[0]?.[0] || "");
  const selectedEntry = entries.find(([label]) => label === selectedLabel);

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
              <button
                className={`stats-bar-row ${
                  selectedLabel === label ? "is-selected" : ""
                }`}
                key={label}
                type="button"
                aria-pressed={selectedLabel === label}
                onClick={() => setSelectedLabel(label)}
              >
                <div className="stats-bar-label">
                  <span title={label}>{label}</span>
                  <strong>{count}</strong>
                </div>
                <div className="stats-bar-track">
                  <span style={{ width: `${percentage}%` }} />
                </div>
              </button>
            );
          })
        )}
      </div>
      {selectedEntry && (
        <p className="stats-chart-selection">
          <strong>{selectedEntry[0]}</strong> represents{" "}
          {formatNumber(selectedEntry[1])} of {formatNumber(total)} alumni
          {total ? ` (${Math.round((selectedEntry[1] / total) * 100)}%)` : ""}.
        </p>
      )}
    </section>
  );
}

function PieChart({ title, subtitle, entries, total, tone }) {
  const [selectedLabel, setSelectedLabel] = useState(entries[0]?.[0] || "");
  const selectedEntry = entries.find(([label]) => label === selectedLabel);
  const segments = entries.map(([label, count], index) => {
    const percentage = total ? (count / total) * 100 : 0;
    return { label, count, percentage, index };
  });

  const gradient = segments.length
    ? `conic-gradient(${segments
        .map((segment, index) => {
          const colors = [
            "var(--rhs-blue)",
            "var(--rhs-orange)",
            "var(--rhs-rust)",
            "var(--rhs-navy)",
            "var(--rhs-charcoal)",
            "var(--rhs-gold)",
          ];
          const start = segments
            .slice(0, index)
            .reduce((sum, item) => sum + item.percentage, 0);
          return `${colors[index % colors.length]} ${start}% ${start + segment.percentage}%`;
        })
        .join(", ")})`
    : "var(--rhs-chart-empty)";

  return (
    <section className={`stats-chart-card stats-chart-${tone}`}>
      <div className="stats-chart-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="stats-chart-count">{formatNumber(total)}</span>
      </div>
      {entries.length === 0 ? (
        <p className="stats-empty">No data available yet.</p>
      ) : (
        <div className="stats-pie-layout">
          <div
            className="stats-pie"
            style={{ background: gradient }}
            aria-label={`${title} chart`}
          >
            <strong>
              {selectedEntry
                ? `${Math.round((selectedEntry[1] / total) * 100)}%`
                : "0%"}
            </strong>
            {/*<span>{selectedEntry?.[0] || "No data"}</span>*/}
          </div>
          <div className="stats-pie-legend">
            {segments.map(({ label, count, percentage, index }) => (
              <button
                className={`stats-pie-legend-item ${selectedLabel === label ? "is-selected" : ""}`}
                key={label}
                type="button"
                aria-pressed={selectedLabel === label}
                onClick={() => setSelectedLabel(label)}
              >
                <span
                  className={`stats-pie-swatch stats-pie-swatch-${index % 6}`}
                />
                <span title={label}>{label}</span>
                <strong>{count}</strong>
                <small>{Math.round(percentage)}%</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function LineChart({ title, subtitle, entries, tone }) {
  const [range, setRange] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(entries.length - 1);
  const rangeSize = range === "all" ? entries.length : Number(range);
  const visibleEntries = entries.slice(-rangeSize);
  const activeIndex = Math.min(
    Math.max(selectedIndex - (entries.length - visibleEntries.length), 0),
    Math.max(visibleEntries.length - 1, 0),
  );
  const selectedEntry = visibleEntries[activeIndex];
  const maxValue = Math.max(...visibleEntries.map(([, count]) => count), 1);
  const width = 640;
  const height = 230;
  const padding = { top: 18, right: 18, bottom: 34, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = visibleEntries.map(([label, count], index) => ({
    label,
    count,
    x:
      padding.left +
      (visibleEntries.length === 1
        ? chartWidth / 2
        : (index / (visibleEntries.length - 1)) * chartWidth),
    y: padding.top + chartHeight - (count / maxValue) * chartHeight,
  }));
  const path = points
    .map(({ x, y }, index) => `${index ? "L" : "M"}${x} ${y}`)
    .join(" ");

  return (
    <section className={`stats-chart-card stats-chart-${tone} stats-line-card`}>
      <div className="stats-chart-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <label className="stats-chart-control">
          <span>Range</span>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option value="all">All time</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
          </select>
        </label>
      </div>
      {points.length === 0 ? (
        <p className="stats-empty">No approved dates available yet.</p>
      ) : (
        <>
          <div className="stats-line-wrap">
            <svg
              className="stats-line"
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={`${title} chart`}
            >
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={height - padding.bottom}
                y2={height - padding.bottom}
              />
              <path d={path} />
              {points.map(({ label, count, x, y }, index) => (
                <g key={label}>
                  <circle
                    className={index === activeIndex ? "is-selected" : ""}
                    cx={x}
                    cy={y}
                    r={index === activeIndex ? 6 : 4}
                    role="button"
                    tabIndex="0"
                    aria-label={`${label}: ${count} approvals`}
                    onClick={() =>
                      setSelectedIndex(
                        index + entries.length - visibleEntries.length,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedIndex(
                          index + entries.length - visibleEntries.length,
                        );
                      }
                    }}
                  />
                  {(index === 0 ||
                    index === points.length - 1 ||
                    index === activeIndex) && (
                    <text x={x} y={height - 10} textAnchor="middle">
                      {label}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
          {selectedEntry && (
            <p className="stats-chart-selection">
              <strong>{selectedEntry[0]}</strong>:{" "}
              {formatNumber(selectedEntry[1])} alumni approved.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function StatsPage() {
  const [profiles, setProfiles] = useState([]);
  const [educationRecords, setEducationRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const isAdmin = getAdminFromToken();

  useEffect(() => {
    if (!isAdmin) return undefined;

    const controller = new AbortController();
    api
      .get("/profile", { signal: controller.signal })
      .then(async (response) => {
        const data = response.data.data || response.data;
        const profileData = Array.isArray(data) ? data : [];
        setProfiles(profileData);
        const educationResponses = await Promise.all(
          profileData.map((profile) =>
            api
              .get(`/education/user/${profile.user_id}`, {
                signal: controller.signal,
              })
              .then((educationResponse) => educationResponse.data || [])
              .catch(() => []),
          ),
        );
        setEducationRecords(educationResponses.flat());
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
  const institutionEntries = pieEntries(
    countBy(educationRecords, (education) => education.institution),
  );
  const approvedDateEntries = Object.entries(
    profiles.reduce((counts, profile) => {
      if (!profile.approved_date) return counts;
      const date = new Date(profile.approved_date);
      if (Number.isNaN(date.getTime())) return counts;
      const month = date.toISOString().slice(0, 7);
      counts[month] = (counts[month] || 0) + 1;
      return counts;
    }, {}),
  ).sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate));
  const expertisePieEntries = pieEntries(
    countBy(
      profiles.flatMap((profile) => profile.expertise || []),
      (expertise) => expertise.name,
    ),
  );
  const expertiseTotal = profiles.reduce(
    (total, profile) => total + (profile.expertise?.length || 0),
    0,
  );
  const sharingEntries = pieEntries(
    countBy(
      profiles.flatMap((profile) =>
        Array.isArray(profile.expertise_sharing_types)
          ? profile.expertise_sharing_types
          : [],
      ),
      (sharingType) => sharingType,
    ),
  );
  const sharingTotal = profiles.reduce(
    (total, profile) =>
      total +
      (Array.isArray(profile.expertise_sharing_types)
        ? profile.expertise_sharing_types.length
        : 0),
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
              tone="navy"
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

            <LineChart
              title="Approved alumni"
              subtitle="Membership approvals over time"
              entries={approvedDateEntries}
              tone="timeline"
            />
            {/*<DistributionChart
              title="Expertise landscape"
              subtitle="Skills and interests shared"
              entries={expertiseEntries}
              total={expertiseTotal}
              tone="orange"
            />*/}
            <PieChart
              title="Expertise Landscape"
              subtitle="How shared skills are distributed"
              entries={expertisePieEntries}
              total={expertiseTotal}
              tone="expertise"
            />
            <PieChart
              title="Sharing Preferences"
              subtitle="Ways alumni want to contribute"
              entries={sharingEntries}
              total={sharingTotal}
              tone="sharing"
            />
            <PieChart
              title="Educational Institutions"
              subtitle="Where alumni have studied"
              entries={institutionEntries}
              total={educationRecords.length}
              tone="institution"
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
