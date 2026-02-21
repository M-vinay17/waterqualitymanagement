import Header from "../components/Header";
import React from "react";
import { Link } from "react-router-dom";

function Profile() {
  const user = {
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator",
    phone: "9876543210",
    organization: "City Water Department",
    memberSince: "January 2024",
  };

  const stats = {
    reportsSubmitted: 15,
    reportsVerified: 12,
    alertsRaised: 3,
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          Water Quality Monitor
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-gray-700">Admin User</span>
          <button className="bg-red-500 text-white px-4 py-1 rounded">
            Logout
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-8">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Profile</h2>

          <Link
            to="/"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">

          <div className="mb-4">
            <p className="text-gray-500">Full Name</p>
            <p className="font-semibold text-lg">{user.name}</p>
          </div>

          <div className="mb-4">
            <p className="text-gray-500">Email</p>
            <p className="font-semibold text-lg">{user.email}</p>
          </div>

          <div className="mb-4">
            <p className="text-gray-500">Role</p>
            <p className="font-semibold text-lg">{user.role}</p>
          </div>

          <div className="mb-4">
            <p className="text-gray-500">Phone</p>
            <p className="font-semibold text-lg">{user.phone}</p>
          </div>

          <div className="mb-4">
            <p className="text-gray-500">Organization</p>
            <p className="font-semibold text-lg">{user.organization}</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-500">Member Since</p>
            <p className="font-semibold text-lg">{user.memberSince}</p>
          </div>

          <button className="bg-green-500 text-white px-4 py-2 rounded w-full">
            Edit Profile
          </button>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
          <div className="bg-blue-500 text-white p-4 rounded text-center">
            <p className="text-sm">Reports Submitted</p>
            <p className="text-xl font-bold">{stats.reportsSubmitted}</p>
          </div>

          <div className="bg-green-500 text-white p-4 rounded text-center">
            <p className="text-sm">Reports Verified</p>
            <p className="text-xl font-bold">{stats.reportsVerified}</p>
          </div>

          <div className="bg-yellow-500 text-white p-4 rounded text-center">
            <p className="text-sm">Alerts Raised</p>
            <p className="text-xl font-bold">{stats.alertsRaised}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;