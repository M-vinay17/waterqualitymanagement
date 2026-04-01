import { useEffect, useState } from "react";

export default function ReportQueue() {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ FETCH DATA FROM API
  useEffect(() => {
    fetch("/api/v1/reports?status=pending")
      .then(res => res.json())
      .then(data => {
        console.log("API DATA:", data);

        if (!data || data.length === 0) {
          setReports([
            {
              id: 1,
              description: "Water contamination in Area A",
              reporter: "User123",
              location: "Station A",
              water_source: "River",
              date: "2026-04-01"
            },
            {
              id: 2,
              description: "Dirty water in Area B",
              reporter: "User456",
              location: "Station B",
              water_source: "Lake",
              date: "2026-04-02"
            }
          ]);
        } else {
          setReports(data);
        }
      })
      .catch(err => {
        console.error("Error fetching reports:", err);

        setReports([
          {
            id: 1,
            description: "Fallback report",
            reporter: "System",
            location: "Unknown",
            water_source: "N/A",
            date: "N/A"
          }
        ]);
      });
  }, []);

  // ✅ PAGINATION LOGIC
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ✅ VERIFY / REJECT (PATCH)
  const handleAction = async (id, action) => {
    const prevReports = reports;

    // optimistic UI
    setReports(prev => prev.filter(r => r.id !== id));

    try {
      await fetch(`/api/v1/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      });

      console.log(`Report ${id} -> ${action}`);
    } catch (err) {
      console.error("Error updating report:", err);
      alert("Failed to update report ❌");

      // rollback
      setReports(prevReports);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-3 text-white">
        Report Queue
      </h2>

      {/* EMPTY STATE */}
      {reports.length === 0 ? (
        <p className="text-white">No pending reports</p>
      ) : (
        <>
          {/* REPORT LIST */}
          {paginatedReports.map(r => (
            <div
              key={r.id}
              className="flex justify-between bg-white/10 p-4 rounded mb-3 shadow"
            >
              <div className="flex flex-col gap-1 text-white">
                <p className="font-semibold">
                  {r.description || r.title || "No description"}
                </p>
                <p>👤 {r.reporter || "Unknown"}</p>
                <p>📍 {r.location || "N/A"}</p>
                <p>💧 {r.water_source || "N/A"}</p>
                <p>📅 {r.date || "N/A"}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAction(r.id, "verified")}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Verify
                </button>

                <button
                  onClick={() => handleAction(r.id, "rejected")}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}

          {/* PAGINATION */}
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Prev
            </button>

            <span className="text-white">
              Page {currentPage}
            </span>

            <button
              onClick={() =>
                setCurrentPage(p =>
                  startIndex + itemsPerPage < reports.length ? p + 1 : p
                )
              }
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}