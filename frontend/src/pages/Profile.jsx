import React from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {

  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Logged out");
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f9",
        padding: "40px"
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px"
        }}
      >
        <h1 style={{ color: "#2563eb" }}>Water Quality Monitor</h1>

        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            border: "none",
            padding: "10px 20px",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>

      {/* Profile Title */}
      <h2 style={{ marginBottom: "20px" }}>User Profile</h2>

      {/* Profile Card */}
      <div
        style={{
          width: "500px",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
      >
        <p><b>Full Name</b><br />Admin User</p>

        <p><b>Email</b><br />admin@example.com</p>

        <p><b>Role</b><br />Administrator</p>

        <p><b>Phone</b><br />9876543210</p>

        <p><b>Organization</b><br />City Water Department</p>

        <p><b>Member Since</b><br />January 2024</p>

        <button
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            background: "#22c55e",
            border: "none",
            borderRadius: "6px",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}