// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../components/SummaryCard";
import WaterMap from "../components/WaterMap";
import WaterChart from "../components/WaterChart";
import ReportsTable from "../components/ReportsTable";
import Profile from "./Profile"; // assuming it's in pages/ or adjust path

// Optional: if using framer-motion version of Profile
// import { AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();

  // Protect route
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [showProfile, setShowProfile] = useState(false);

  const [summary] = useState({
    totalReports: 128,
    activeAlerts: 4,
    stations: 12,
    verified: 95,
  });

  const [stations, setStations] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Dummy data (unchanged)
    setStations([
      { id: 1, name: "North River", lat: 37.776, lng: -122.417, status: "safe", ph: 7.4, turbidity: 0.8, do: 8.5 },
      { id: 2, name: "Bay Edge", lat: 37.781, lng: -122.405, status: "warning", ph: 6.6, turbidity: 3.1, do: 6.8 },
      { id: 3, name: "Old Mill", lat: 37.769, lng: -122.432, status: "contaminated", ph: 5.9, turbidity: 7.9, do: 3.7 },
    ]);

    setChartData([
      { day: "Day -6", quality: 78 },
      { day: "Day -5", quality: 80 },
      { day: "Day -4", quality: 76 },
      { day: "Day -3", quality: 74 },
      { day: "Day -2", quality: 81 },
      { day: "Day -1", quality: 83 },
      { day: "Today", quality: 82 },
    ]);

    setReports([
      { id: "R-1001", location: "North River", status: "Verified", date: "2026-02-18" },
      { id: "R-1002", location: "Bay Edge", status: "Pending", date: "2026-02-19" },
      { id: "R-1003", location: "Old Mill", status: "Rejected", date: "2026-02-20" },
      { id: "R-1004", location: "South Creek", status: "Verified", date: "2026-02-20" },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header / Navbar */}
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-700">
          Water Quality Monitor
        </h1>

        <div className="flex items-center gap-5">
          {/* User Avatar + Name → opens profile */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white font-medium text-lg shadow">
              A
              {/* You can replace "A" with initials or use an <img> */}
              {/* <img src="/path/to/user-avatar.jpg" alt="User" className="w-full h-full rounded-full object-cover" /> */}
            </div>
            <span className="font-medium text-gray-700 hidden sm:block">
              Admin User
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content area with flex for side-by-side layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Dashboard Content */}
        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            showProfile ? "lg:w-2/3" : "w-full"
          }`}
        >
          <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <SummaryCard
                title="Total Reports"
                count={summary.totalReports}
                bg="bg-sky-500"
                textColor="text-white"
              />
              <SummaryCard
                title="Active Alerts"
                count={summary.activeAlerts}
                bg="bg-amber-400"
                textColor="text-white"
              />
              <SummaryCard
                title="Water Stations"
                count={summary.stations}
                bg="bg-emerald-500"
                textColor="text-white"
              />
              <SummaryCard
                title="Verified Reports"
                count={summary.verified}
                bg="bg-indigo-500"
                textColor="text-white"
              />
            </section>

            {/* Map + Chart + Table */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <WaterMap stations={stations} />
                <WaterChart data={chartData} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  Recent Reports
                </h2>
                <ReportsTable reports={reports} />
              </div>
            </section>
          </main>
        </div>

        {/* Profile Panel (slides in from right) */}
        {/* If using Framer Motion version of Profile, wrap in AnimatePresence */}
        {/* <AnimatePresence> */}
        {showProfile && (
          <div className="w-full lg:w-1/3 border-l border-gray-200 bg-white overflow-y-auto shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)]">
            <Profile onClose={() => setShowProfile(false)} />
          </div>
        )}
        {/* </AnimatePresence> */}

        {/* Optional backdrop overlay (click to close) - good for mobile */}
        {showProfile && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setShowProfile(false)}
          />
        )}
      </div>
    </div>
  );
}