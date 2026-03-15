import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserReports from "./pages/UserReports";

function App() {
  return (
    <Router>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<UserReports />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>

    </Router>
  );
}

export default App;