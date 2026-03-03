// src/services/api.js
import axios from "axios";
import { useNavigate } from "react-router-dom"; // only if you use navigate in interceptor

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // or import.meta.env.VITE_API_URL in production
  timeout: 10000,                   // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: add token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle common errors (e.g. 401 → logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Optional: redirect to login (but only if you're in a component context)
      // If you're not using hooks here, you can dispatch an event or use window.location
      window.location.href = "/login"; // simple way
      // Or use toast/notification: "Session expired. Please login again."
    }

    // You can handle other status codes here (403, 500, etc.)
    return Promise.reject(error);
  }
);

export default api;