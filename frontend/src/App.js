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

function App() {
  return (
    <Router>
      <Routes>
        {/* DEFAULT PAGE */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* MAIN PAGES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/:id" element={<AlertDetails />} />
        <Route path="/reports" element={<UserReports />} />
        <Route path="/water-stations" element={<WaterStation />} />
        <Route path="/profile" element={<Profile />} />

        {/* OPTIONAL */}
        <Route path="/charts" element={<HistoricalCharts />} />
      </Routes>
    </Router>
  );
}

export default App;