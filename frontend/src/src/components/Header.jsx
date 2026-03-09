import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">
        Water Quality Monitor
      </h1>

      <div className="flex items-center gap-4">
        <Link
          to="/profile"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Admin User
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;