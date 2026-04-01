import { useEffect, useState } from "react";
import API from "../services/api";
import AlertTypeBadge from "../components/AlertTypeBadge";
import useAlertSocket from "../hooks/useAlertSocket";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .alerts-root {
    min-height: 100vh;
    background: #f7f6f3;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
    padding: 48px 32px;
  }

  .alerts-inner {
    max-width: 760px;
    margin: 0 auto;
  }

  /* ── Header ── */
  .alerts-header {
    margin-bottom: 36px;
    border-bottom: 1.5px solid #e2dfd8;
    padding-bottom: 24px;
  }

  .alerts-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #b8a99a;
    margin-bottom: 6px;
  }

  .alerts-title {
    font-family: 'Lora', serif;
    font-size: 32px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  /* ── Controls ── */
  .alerts-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .search-wrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #b8a99a;
    pointer-events: none;
    font-size: 15px;
  }

  .alerts-search {
    width: 100%;
    padding: 10px 14px 10px 38px;
    background: #fff;
    border: 1.5px solid #e2dfd8;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .alerts-search::placeholder { color: #c4bdb4; }

  .alerts-search:focus {
    border-color: #a0856e;
    box-shadow: 0 0 0 3px rgba(160,133,110,0.12);
  }

  .alerts-select {
    padding: 10px 36px 10px 14px;
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23b8a99a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;
    border: 1.5px solid #e2dfd8;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    white-space: nowrap;
  }

  .alerts-select:focus {
    border-color: #a0856e;
    box-shadow: 0 0 0 3px rgba(160,133,110,0.12);
  }

  /* ── States ── */
  .alerts-status {
    text-align: center;
    padding: 64px 0;
    color: #b8a99a;
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  .alerts-status-icon {
    font-size: 32px;
    display: block;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .spinner {
    display: inline-block;
    width: 22px;
    height: 22px;
    border: 2px solid #e2dfd8;
    border-top-color: #a0856e;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    margin-bottom: 12px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Alert Count ── */
  .alerts-count {
    font-size: 12px;
    color: #b8a99a;
    font-weight: 500;
    margin-bottom: 14px;
    letter-spacing: 0.02em;
  }

  /* ── Alert Card ── */
  .alert-card {
    background: #ffffff;
    border: 1.5px solid #e8e4df;
    border-radius: 14px;
    padding: 20px 22px;
    margin-bottom: 12px;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    animation: fadeSlide 0.3s ease both;
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .alert-card:hover {
    border-color: #d4cfc8;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    transform: translateY(-1px);
  }

  .alert-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .alert-message {
    font-size: 15px;
    font-weight: 500;
    color: #1a1a1a;
    line-height: 1.5;
    flex: 1;
  }

  .alert-divider {
    height: 1px;
    background: #f0ece7;
    margin: 12px 0;
  }

  .alert-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .alert-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #7a7067;
    font-weight: 400;
  }

  .alert-meta-icon {
    font-size: 13px;
    opacity: 0.75;
  }

  .alert-source {
    margin-left: auto;
    font-size: 12px;
    color: #b8a99a;
    font-weight: 500;
    background: #f7f6f3;
    border: 1px solid #e8e4df;
    border-radius: 6px;
    padding: 3px 8px;
  }
`;

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useAlertSocket(setAlerts);

  useEffect(() => {
    API.get("/api/alerts")
      .then((res) => {
        console.log("API DATA:", res.data);
        setAlerts(res.data.reverse());
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = alerts
    .filter((a) => {
      const text = search.toLowerCase();
      return (
        (a.message || "").toLowerCase().includes(text) ||
        (a.location || "").toLowerCase().includes(text)
      );
    })
    .filter((a) => typeFilter === "all" || a.type === typeFilter);

  return (
    <>
      <style>{styles}</style>
      <div className="alerts-root">
        <div className="alerts-inner">

          {/* Header */}
          <div className="alerts-header">
            <p className="alerts-eyebrow">Live Feed</p>
            <h1 className="alerts-title">Alerts</h1>
          </div>

          {/* Controls */}
          <div className="alerts-controls">
            <div className="search-wrapper">
              <span className="search-icon">⌕</span>
              <input
                className="alerts-search"
                type="text"
                placeholder="Search by message or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="alerts-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="predictive">Predictive</option>
              <option value="contamination">Contamination</option>
              <option value="boil_notice">Boil Notice</option>
              <option value="outage">Outage</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="alerts-status">
              <div className="spinner" />
              <div>Fetching alerts…</div>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="alerts-status">
              <span className="alerts-status-icon">🔍</span>
              No alerts match your search
            </div>
          )}

          {/* Count */}
          {!loading && filtered.length > 0 && (
            <p className="alerts-count">
              {filtered.length} alert{filtered.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Alert List */}
          {filtered.map((alert, i) => (
            <div
              key={alert.id}
              className="alert-card"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="alert-card-top">
                <p className="alert-message">{alert.message}</p>
                <AlertTypeBadge type={alert.type} />
              </div>

              <div className="alert-divider" />

              <div className="alert-meta">
                <span className="alert-meta-item">
                  <span className="alert-meta-icon">📍</span>
                  {alert.location}
                </span>
                <span className="alert-meta-item">
                  <span className="alert-meta-icon">🕒</span>
                  {new Date(alert.issued_at).toLocaleString()}
                </span>
                <span className="alert-source">
                  {alert.source || "Unknown"}
                </span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </>
  );
}