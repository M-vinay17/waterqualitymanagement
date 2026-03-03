import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "citizen",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.fullName.trim().length < 2) {
      setError("Full name is too short");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      const res = await API.post("/auth/register", payload);

      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        API.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
        setSuccess("Account created! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1800);
      } else {
        setSuccess("Account created! Please log in.");
        setTimeout(() => navigate("/login"), 2200);
      }
    } catch (err) {
      console.error("Registration error:", err);

      let errorMsg = "Registration failed. Please try again.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail
            .map((issue) => issue.msg || issue.message || JSON.stringify(issue))
            .join(" • ");
        } else if (typeof err.response.data.detail === "string") {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* LEFT SIDE – fixed on desktop, hidden on mobile */}
      <div
        className="
          hidden md:block
          md:fixed md:inset-y-0 md:left-0
          md:w-1/2
          bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-500
          relative overflow-hidden
        "
      >
        {/* Subtle animated overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,white_0%,transparent_60%)] animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,white_0%,transparent_70%)] animate-pulse-slower"></div>
        </div>

        {/* Wave */}
        <svg
          className="absolute bottom-0 w-full h-48 opacity-60 animate-wave-slow"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255,255,255,0.7)"
            d="M0,224L60,213.3C120,203,240,181,360,170.7C480,160,600,160,720,186.7C840,213,960,267,1080,266.7C1200,267,1320,213,1380,186.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>

        {/* Centered text */}
        <div className="absolute inset-0 flex items-center justify-center text-white px-10 text-center">
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-4xl font-bold drop-shadow-md">
              Clean Water Matters
            </h2>
            <p className="text-lg opacity-90 max-w-md mx-auto">
              Join citizens, NGOs and authorities to monitor and protect water quality in real time.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – scrollable registration form */}
      <div
        className="
          flex-1
          md:ml-[50%]
          flex items-center justify-center
          p-6 md:p-10
          min-h-screen
        "
      >
        <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-xl shadow-xl border border-cyan-100/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 py-6 px-8 text-center rounded-t-xl">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Water Quality Monitor
            </h1>
            <p className="text-cyan-100 text-sm mt-1">Create your account</p>
          </div>

          {/* Scrollable content area */}
          <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-cyan-50">
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I am
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white text-sm"
                >
                  <option value="citizen">Citizen</option>
                  <option value="ngo">NGO / Organization</option>
                  <option value="authority">Government Authority</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition mt-5 text-sm ${
                  loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg active:scale-98"
                }`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal-600 hover:text-teal-800 font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;