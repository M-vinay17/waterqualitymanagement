import AlertDetails from "./pages/AlertDetails";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import UserReports from "./pages/UserReports";
import WaterStation from "./pages/stationmap";
import HistoricalCharts from "./pages/HistoricalCharts";

// ✅ Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><UserReports /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/alerts/:id" element={<ProtectedRoute><AlertDetails /></ProtectedRoute>} />
        <Route path="/alerts/history" element={<ProtectedRoute><HistoricalCharts /></ProtectedRoute>} />
        <Route path="/water-stations" element={<ProtectedRoute><WaterStation /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      </Routes>
    </Router>
  );
}

export default App;