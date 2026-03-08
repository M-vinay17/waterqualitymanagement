import React from "react";
import ReactDOM from "react-dom/client";
import AppOld from "./App_old";
import "./App.css";
import "leaflet/dist/leaflet.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AppOld />
  </React.StrictMode>
);