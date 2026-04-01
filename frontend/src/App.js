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

// Authority & NGO Pages
import AuthorityDashboard from "./pages/authority/Dashboard";
import NgoDashboard from "./pages/NgoDashboard";

// Components
import RoleGuard from "./components/RoleGuard";
import Forbidden from "./pages/Forbidden";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  // Get current user safely from localStorage
  const currentUser = {
    role: localStorage.getItem("user_role") || "user",
    email: localStorage.getItem("user_email") || ""
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Default / Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <UserReports />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/alerts/history"
          element={
            <ProtectedRoute>
              <HistoricalCharts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/water-stations"
          element={
            <ProtectedRoute>
              <WaterStation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Authority Dashboard */}
        <Route
          path="/authority/dashboard"
          element={
            <RoleGuard allowedRoles={["authority", "admin"]}>
              <AuthorityDashboard />
            </RoleGuard>
          }
        />

        {/* NGO Dashboard */}
        <Route
          path="/NgoDashboard"
          element={
            <RoleGuard allowedRoles={["ngo", "admin"]} user={currentUser}>
              <NgoDashboard user={currentUser} />
            </RoleGuard>
          }
        />

        {/* Forbidden / Error Pages */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/403" element={<Forbidden />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}