import React from "react";
import ReactDOM from "react-dom/client";
<<<<<<< HEAD
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
=======
import AppOld from "./App_old";
import "./App.css";
import "leaflet/dist/leaflet.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

>>>>>>> d01502cfc27070ece4adcbe898316f9b1c947b52
root.render(
  <React.StrictMode>
    <AppOld />
  </React.StrictMode>
);