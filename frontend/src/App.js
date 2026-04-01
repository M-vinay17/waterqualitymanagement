import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import AlertDetails from "./pages/AlertDetails";
import UserReports from "./pages/UserReports";
import WaterStation from "./pages/stationmap";
import HistoricalCharts from "./pages/HistoricalCharts";

// Authority
import AuthorityDashboard from "./pages/authority/Dashboard";
import RoleGuard from "./components/RoleGuard";
import Forbidden from "./pages/Forbidden";

// ✅ Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Alerts */}
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts/:id"
          element={
            <ProtectedRoute>
              <AlertDetails />
            </ProtectedRoute>
          }
        />

        {/* Charts */}
        <Route
          path="/alerts/history"
          element={
            <ProtectedRoute>
              <HistoricalCharts />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <UserReports />
            </ProtectedRoute>
          }
        />

        {/* Stations */}
        <Route
          path="/water-stations"
          element={
            <ProtectedRoute>
              <WaterStation />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ✅ AUTHORITY DASHBOARD (YOUR WORK) */}
        <Route
          path="/authority/dashboard"
          element={
            <RoleGuard roles={["authority", "admin"]}>
              <AuthorityDashboard />
            </RoleGuard>
          }
        />

        {/* Forbidden */}
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}