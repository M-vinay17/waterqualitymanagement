import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts"

import UserReports from "./pages/UserReports";
import WaterStation from "./pages/stationmap";

// Routes లో:


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
        <Route path="/profile" element={<Profile />} />

      </Routes>

    </Router>
  );
}

export default App;