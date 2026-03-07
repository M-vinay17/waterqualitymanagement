import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Save token & user (as in your working code)
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Optional: set global axios header
      API.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* LEFT SIDE - Water ripple background + text */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-500 relative overflow-hidden">
        {/* Gentle ripple effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            <div className="absolute inset-0 rounded-full bg-white/10 animate-ripple-slow"></div>
            <div className="absolute inset-4 rounded-full bg-white/8 animate-ripple-medium"></div>
            <div className="absolute inset-8 rounded-full bg-white/6 animate-ripple-fast"></div>
            <div className="absolute inset-12 rounded-full bg-white/4 animate-ripple-slower"></div>
          </div>
        </div>

        {/* Subtle wave at bottom */}
        <svg
          className="absolute bottom-0 w-full h-32 opacity-40"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255,255,255,0.5)"
            d="M0,224L80,213.3C160,203,320,181,480,170.7C640,160,800,160,960,186.7C1120,213,1280,267,1360,266.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
        </svg>

        {/* Centered motivational text */}
        <div className="absolute inset-0 flex items-center justify-center text-white px-10 text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold drop-shadow-md">
              Safe Water for All
            </h2>
            <p className="text-lg opacity-90 max-w-md mx-auto">
              Log in to view real-time water quality, report issues, and help protect our rivers and lakes.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-xl shadow-xl border border-cyan-100/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 py-6 px-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Water Quality Monitor
            </h1>
            <p className="text-cyan-100 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition mt-3 text-sm"
              >
                Sign In
              </button>
            </form>

            <div className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-teal-600 hover:text-teal-800 font-medium">
                Create one
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500 mt-3">
              <a href="#" className="hover:text-gray-700">Forgot password?</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;