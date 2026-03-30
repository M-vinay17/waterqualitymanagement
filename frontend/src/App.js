import AlertDetails from "./pages/AlertDetails";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts"
import UserReports from "./pages/UserReports";
import WaterStation from "./pages/stationmap";
import HistoricalCharts from "./pages/HistoricalCharts";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<UserReports />} />
        <Route path="/alerts" element={<Alerts/>}/>
        <Route path="/water-stations" element={<WaterStation />} />
        <Route path="/alerts/:id" element={<AlertDetails />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/reports" element={<UserReports />} />

        <Route path="/alerts/history" element={<HistoricalCharts />} />

      </Routes>
    </Router>
  );
}

export default App;