import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const currentYear = new Date().getFullYear();
const formatMoney = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 2,
  });

function ArcadeDashboard() {
  const [year, setYear] = useState(currentYear);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setStats(null);
    api.get("/arcade/dashboard/stats", { params: { year } })
      .then((response) => {
        if (active) setStats(response.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Unable to load dashboard statistics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [year]);

  const chartMaximum = useMemo(() => {
    const values = (stats?.months || []).flatMap((month) => [Number(month.fees), Number(month.payments)]);
    return Math.max(...values, 1);
  }, [stats]);

  const months = stats?.months || [];
  const summary = stats?.summary || {};

  return (
    <main className="arcade-management arcade-dashboard">
      <header className="arcade-management-header">
        <div>
          <p className="arcade-eyebrow">KIDZERLAND · ARCADE</p>
          <h1>Business intelligence</h1>
          <p>Yearly performance and month-by-month fee and payment activity.</p>
        </div>
        <label className="arcade-year-picker">Reporting year
          <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {Array.from({ length: 6 }, (_, index) => currentYear - index).map((optionYear) => (
              <option key={optionYear} value={optionYear}>{optionYear}</option>
            ))}
          </select>
        </label>
      </header>

      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      {loading && <p role="status">Loading {year} statistics…</p>}

      {!loading && stats && <>
        <section className="arcade-dashboard-cards" aria-label={`${year} yearly statistics`}>
          <article><span>Customers</span><strong>{summary.customer_count || 0}</strong><small>{summary.active_customers || 0} active accounts</small></article>
          <article><span>New customers</span><strong>{summary.new_customers || 0}</strong><small>Added in {year}</small></article>
          <article><span>Fees issued</span><strong>{formatMoney(summary.fees_total)}</strong><small>Total issued during {year}</small></article>
          <article><span>Payments received</span><strong>{formatMoney(summary.payments_total)}</strong><small>Total received during {year}</small></article>
          <article className="arcade-dashboard-balance"><span>Outstanding balance</span><strong>{formatMoney(summary.outstanding_balance)}</strong><small>Current balance across all years</small></article>
        </section>

        <section className="arcade-section arcade-chart-section">
          <div className="arcade-section-heading">
            <div><h2>Monthly fees and payments</h2><p>Amounts recorded in each month of {year}.</p></div>
            <div className="arcade-chart-legend"><span><i className="arcade-legend-fees" />Fees</span><span><i className="arcade-legend-payments" />Payments</span></div>
          </div>
          <div className="arcade-month-chart" role="img" aria-label={`Monthly fees and payments for ${year}`}>
            {months.map((month) => {
              const fees = Number(month.fees || 0);
              const payments = Number(month.payments || 0);
              const monthName = new Date(year, Number(month.month) - 1, 1).toLocaleString(undefined, { month: "short" });
              return (
                <div className="arcade-month-column" key={month.month}>
                  <div className="arcade-month-bars">
                    <div className="arcade-bar arcade-bar-fees" style={{ height: `${Math.max((fees / chartMaximum) * 100, fees > 0 ? 3 : 0)}%` }} title={`Fees: ${formatMoney(fees)}`} />
                    <div className="arcade-bar arcade-bar-payments" style={{ height: `${Math.max((payments / chartMaximum) * 100, payments > 0 ? 3 : 0)}%` }} title={`Payments: ${formatMoney(payments)}`} />
                  </div>
                  <span>{monthName}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="arcade-section">
          <div className="arcade-section-heading"><div><h2>Monthly breakdown</h2><p>Compare fees issued with payments received.</p></div></div>
          <div className="table-responsive">
            <table className="table arcade-month-table">
              <thead><tr><th>Month</th><th>Fees issued</th><th>Payments received</th><th>Difference</th></tr></thead>
              <tbody>{months.map((month) => {
                const monthName = new Date(year, Number(month.month) - 1, 1).toLocaleString(undefined, { month: "long" });
                const fees = Number(month.fees || 0);
                const payments = Number(month.payments || 0);
                return <tr key={month.month}><th scope="row">{monthName}</th><td>{formatMoney(fees)}</td><td>{formatMoney(payments)}</td><td>{formatMoney(fees - payments)}</td></tr>;
              })}</tbody>
            </table>
          </div>
        </section>
      </>}
    </main>
  );
}

export default ArcadeDashboard;
