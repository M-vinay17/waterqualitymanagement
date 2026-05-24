import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReportsPanel from "./ReportsPanel";

const BASE = "http://localhost:8000";
const PAGE_SIZE = 10;

function SortIcon({ active, dir }) {
  if (!active) return <span style={{ color: "#cbd5e1", fontSize: "10px" }}>↕</span>;
  return <span style={{ color: "#0e74bd", fontSize: "10px" }}>{dir === "asc" ? "↑" : "↓"}</span>;
}

function Th({ children, sortKey, sort, onSort, width }) {
  const active = sort.key === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        padding: "10px 12px", textAlign: "left",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "9px", fontWeight: 700,
        color: active ? "#0e74bd" : "#94a3b8",
        letterSpacing: "0.10em", textTransform: "uppercase",
        background: "#f8fafc", cursor: "pointer",
        borderBottom: "1px solid #e2eaf4",
        whiteSpace: "nowrap", userSelect: "none",
        width: width || "auto",
        transition: "color 0.15s",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        {children}
        <SortIcon active={active} dir={sort.dir} />
      </span>
    </th>
  );
}

function ReportsBadge({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        padding: "3px 10px", borderRadius: "20px", border: "none",
        background: "rgba(14,116,189,0.10)", color: "#0e74bd",
        fontFamily: "monospace", fontSize: "10px", fontWeight: 700,
        cursor: "pointer", transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "#0e74bd"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(14,116,189,0.10)"; e.currentTarget.style.color = "#0e74bd"; }}
    >
      📄 {count ?? 0}
    </button>
  );
}

/**
 * CollaborationsList
 * Props:
 *   extraRows {array}  new rows from SubmitCollaborationForm (optimistic append)
 */
export default function CollaborationsList({ extraRows = [] }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [sort,    setSort]    = useState({ key: "created_at", dir: "desc" });
  const [panel,   setPanel]   = useState({ open: false, stationId: null });

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${BASE}/collaborations`, { headers })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { if (!cancelled) { setRows(d.data ?? d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const allRows = useMemo(() => [...extraRows, ...rows], [rows, extraRows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter(r => !q || r.project_name?.toLowerCase().includes(q));
  }, [allRows, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
      : { key, dir: "asc" }
    );
    setPage(1);
  };

  const tdStyle = {
    padding: "11px 12px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12px", color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        style={{
          background: "#fff", borderRadius: "14px",
          border: "1px solid #e2eaf4",
          boxShadow: "0 1px 8px rgba(14,116,189,0.07)",
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: "1px solid #f1f5f9",
          flexWrap: "wrap", gap: "10px",
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
            fontWeight: 600, color: "#0f172a",
          }}>
            🤝 Collaborations
          </div>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: "10px", top: "50%",
              transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8",
            }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by project name…"
              style={{
                padding: "8px 12px 8px 32px",
                border: "1px solid #e2eaf4", borderRadius: "8px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "12px",
                color: "#334155", background: "#f8fafc",
                outline: "none", width: "220px",
                transition: "border-color 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = "#0e74bd"; e.target.style.boxShadow = "0 0 0 3px rgba(14,116,189,0.08)"; }}
              onBlur={e => { e.target.style.borderColor = "#e2eaf4"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th sortKey="project_name" sort={sort} onSort={handleSort}>Project Name</Th>
                <Th sortKey="ngo_name"     sort={sort} onSort={handleSort}>NGO Name</Th>
                <th style={{ ...tdStyle, background: "#f8fafc", fontSize: "9px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.10em", textTransform: "uppercase", borderBottom: "1px solid #e2eaf4" }}>
                  Contact Email
                </th>
                <Th sortKey="created_at"   sort={sort} onSort={handleSort}>Date Added</Th>
                <th style={{ ...tdStyle, background: "#f8fafc", fontSize: "9px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.10em", textTransform: "uppercase", borderBottom: "1px solid #e2eaf4" }}>
                  Reports
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {[180, 140, 180, 100, 60].map((w, j) => (
                    <td key={j} style={tdStyle}>
                      <div style={{ height: "12px", width: `${w * 0.6}px`, background: "#f1f5f9", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
                    </td>
                  ))}
                </tr>
              ))}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "#dc2626", padding: "32px" }}>
                    ⚠️ Failed to load: {error}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && !error && paginated.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "15px", color: "#0f172a", marginBottom: "4px" }}>
                      No collaborations found
                    </div>
                    {search && (
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Try adjusting your search</div>
                    )}
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && !error && paginated.map((row, i) => (
                <tr
                  key={row.id ?? row._id ?? i}
                  style={{ transition: "background 0.12s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,116,189,0.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#0f172a", maxWidth: "180px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.project_name}
                    </div>
                  </td>
                  <td style={tdStyle}>{row.ngo_name}</td>
                  <td style={{ ...tdStyle, color: "#0e74bd" }}>
                    <a href={`mailto:${row.contact_email}`} style={{ color: "#0e74bd", textDecoration: "none" }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                    >
                      {row.contact_email}
                    </a>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td style={tdStyle}>
                    <ReportsBadge
                      count={row.report_count ?? 0}
                      onClick={() => setPanel({ open: true, stationId: row.station_id ?? row.id })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 18px", borderTop: "1px solid #f1f5f9",
            fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#94a3b8",
          }}>
            <span>
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {[
                { label: "←", action: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
                { label: "→", action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  style={{
                    padding: "5px 12px", borderRadius: "7px",
                    border: "1px solid #e2eaf4", background: "#fff",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "11px",
                    color: btn.disabled ? "#cbd5e1" : "#334155",
                    cursor: btn.disabled ? "not-allowed" : "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { if (!btn.disabled) e.currentTarget.style.borderColor = "#0e74bd"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2eaf4"; }}
                >
                  {btn.label}
                </button>
              ))}
              <span style={{ padding: "0 6px", color: "#0f172a", fontWeight: 600 }}>
                {page} / {totalPages}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Reports slide-over */}
      <ReportsPanel
        stationId={panel.stationId}
        open={panel.open}
        onClose={() => setPanel({ open: false, stationId: null })}
      />
    </>
  );
}
