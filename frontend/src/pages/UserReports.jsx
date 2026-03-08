import React, { useState } from "react";

const UserReports = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      water_source: "River",
      description: "Water smells bad and looks muddy",
      status: "pending",
      created_at: "2026-03-01",
    },
    {
      id: 2,
      water_source: "Lake",
      description: "Color changed to brown",
      status: "verified",
      created_at: "2026-02-25",
    },
  ]);

  const [formData, setFormData] = useState({
    water_source: "",
    description: "",
    location: "",
    photo: null
  });
  const handleDetectLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
      setFormData({
        ...formData,
        location: coords
      });
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newReport = {
      id: reports.length + 1,
      ...formData,
      status: "pending",
      created_at: new Date().toISOString().split("T")[0],
    };

    setReports([newReport, ...reports]);
    setFormData({ water_source: "", description: "", location: "" });
  };

  const statusStyles = {
    pending: "bg-yellow-500 text-black",
    verified: "bg-green-600 text-white",
    rejected: "bg-red-600 text-white",
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h2 className="text-3xl font-bold mb-8">Water Quality Reporting</h2>

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
              placeholder="Enter location"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600"
              required
            />

<button
  type="button"
  onClick={handleDetectLocation}
  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
>
  Detect Current Location
</button>

</div> {/* Photo Upload */}
<div className="mb-4">
  <label className="block mb-2 font-semibold">Upload Photo</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setFormData({ ...formData, photo: e.target.files[0] })
    }
    className="w-full border p-2 rounded"
  />{formData.photo && (
  <img
    src={URL.createObjectURL(formData.photo)}
    alt="Preview"
    className="mt-3 h-40 rounded border"
  />
)}
</div>

{/* Description */}
<div className="mb-4">
  <label className="block mb-2 font-semibold">Description</label>
  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    className="w-full border p-2 rounded"
    rows="4"
    placeholder="Describe the issue..."
    required
  />
</div>
          <button
            type="submit"
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Submit Report
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div>
        <h3 className="text-xl font-semibold mb-6">My Reports</h3>

        <div className="mt-8 space-y-4">
  {reports.map((report) => (
    <div
      key={report.id}
      className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
    >
      <div>
        <p className="font-semibold text-lg">{report.water_source}</p>
        <p className="text-gray-400 text-sm">{report.description}</p>
        <p className="text-gray-500 text-xs">{report.created_at}</p>
      </div>

      <span
        className={`px-4 py-1 rounded-full text-sm font-semibold ${statusStyles[report.status]}`}
      >
        {report.status}
      </span>
    </div>
  ))}
</div>
        </div>
      </div>
  );
};

export default UserReports;