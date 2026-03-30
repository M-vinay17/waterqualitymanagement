import AlertDetails from "./pages/AlertDetails";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";

import UserReports from "./pages/UserReports";
import WaterStation from "./pages/stationmap";

import HistoricalCharts from "./pages/HistoricalCharts";

// Milestone 4
import NgoDashboard from "./pages/NgoDashboard";
import RoleGuard from "./components/RoleGuard";
import Forbidden from "./pages/Forbidden";

function App() {
  const currentUser = {
    role: localStorage.getItem("user_role"),
    email: localStorage.getItem("user_email")
  };

  

  return (
    <Router>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Existing Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<UserReports />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/water-stations" element={<WaterStation />} />
        <Route path="/alerts/:id" element={<AlertDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/alerts/history" element={<HistoricalCharts />} />

        {/* NGO Dashboard */}
         <Route
          path="/NgoDashboard"
          element={
            <RoleGuard allowedRoles={["ngo", "admin"]} user={currentUser}>
              <NgoDashboard user={currentUser} />
            </RoleGuard>
          }
        />

        <Route path="/403" element={<Forbidden />} />

      </Routes>
    </Router>
  );
}

export default App;