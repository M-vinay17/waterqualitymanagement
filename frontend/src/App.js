import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";  // We'll create this next

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Login />} />  // Default to login
      </Routes>
    </Router>
  );
}

export default App;