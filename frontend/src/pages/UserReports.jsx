import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

// Axios instance with JWT injected automatically
const api = axios.create({ baseURL: API });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const UserReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    water_source: "",
    description: "",
    location: "",
    photo: null,
  });

  // Fetch user's reports on mount
  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/me");
      setReports(res.data);
    } catch (err) {
      setError("Failed to load reports. Please log in again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setFormData((prev) => ({
        ...prev,
        location: `${position.coords.latitude}, ${position.coords.longitude}`,
      }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Build multipart/form-data payload
      const payload = new FormData();
      payload.append("water_source", formData.water_source);
      payload.append("location", formData.location);
      payload.append("description", formData.description);
      if (formData.photo) payload.append("photo", formData.photo);

      await api.post("/reports/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh list from server instead of optimistic update
      await fetchMyReports();
      setFormData({ water_source: "", description: "", location: "", photo: null });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyles = {
    pending: "bg-yellow-500 text-black",
    verified: "bg-green-600 text-white",
    rejected: "bg-red-600 text-white",
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h2 className="text-3xl font-bold mb-8">Water Quality Reporting</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Submit Report Card */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
        <h3 className="text-xl font-semibold mb-6">Submit New Report</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2">Water Source</label>
            <select
              name="water_source"
              value={formData.water_source}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600"
              required
            >
              <option value="">Select Source</option>
              <option value="River">River</option>
              <option value="Lake">Lake</option>
              <option value="Groundwater">Groundwater</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location or detect"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600"
              required
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
            >
              Detect Current Location
            </button>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, photo: e.target.files[0] })
              }
              className="w-full border border-gray-600 p-2 rounded bg-gray-700"
            />
            {formData.photo && (
              <img
                src={URL.createObjectURL(formData.photo)}
                alt="Preview"
                className="mt-3 h-40 rounded border border-gray-600"
              />
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 p-3 rounded"
              rows="4"
              placeholder="Describe the issue..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div>
        <h3 className="text-xl font-semibold mb-6">My Reports</h3>

        {loading ? (
          <p className="text-gray-400">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-500">No reports submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">{report.water_source}</p>
                  <p className="text-gray-400 text-sm">{report.description}</p>
                  <p className="text-gray-500 text-xs">{report.location}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                  {report.photo_url && (
                    <img
                      src={`${API}${report.photo_url}`}
                      alt="Report"
                      className="mt-2 h-20 rounded"
                    />
                  )}
                </div>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${statusStyles[report.status] || "bg-gray-600 text-white"}`}
                >
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReports;