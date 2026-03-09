import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserReports from "./pages/UserReports";

function App() {
  return (
    <Router>

      <Routes>

        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<UserReports />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>

    </Router>
  );
}

export default App;