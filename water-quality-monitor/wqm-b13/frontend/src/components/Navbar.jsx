import { Link } from "react-router-dom";
import React from 'react'

// Top navigation bar for the dashboard (static demo user)
export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-sky-600">Water Quality Monitor</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex sm:items-center sm:space-x-3">
              <Link
                to="/profile"
                className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
              >
              Admin User
              </Link>
              <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-sky-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.6 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
