# Water Quality Monitor – Frontend Guide
Beginner-Friendly Setup & Development Guide

This guide is written for interns who:
- Are new to React
- Have never worked with maps
- Have never connected frontend to backend
- Have zero environmental domain knowledge

Follow step by step. Do not skip sections.

------------------------------------------------------------
1. What Is The Frontend?
------------------------------------------------------------

The frontend is what users see in the browser.

It is responsible for:
- Showing dashboards
- Displaying water quality data
- Showing maps
- Accepting pollution reports
- Displaying alerts
- Handling login and authentication

The frontend DOES NOT:
- Store data permanently
- Make business decisions
- Directly access the database

It only talks to the backend using APIs.

------------------------------------------------------------
2. Technologies Used
------------------------------------------------------------

- React.js (UI framework)
- Tailwind CSS (Styling)
- Axios (API requests)
- React Router (Page navigation)
- Leaflet or Google Maps (Map integration)

------------------------------------------------------------
3. Install Required Software
------------------------------------------------------------

Before starting, install:

1. Node.js
Download: https://nodejs.org

Check installation:
node -v
npm -v

If versions show, you're ready.

------------------------------------------------------------
4. Setup The Project
------------------------------------------------------------

Go inside frontend folder:

cd frontend

Install dependencies:

npm install

If project is not created yet:

npx create-react-app .
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

------------------------------------------------------------
5. Start Development Server
------------------------------------------------------------

Run:

npm start

Open in browser:

http://localhost:3000

If React page loads, frontend is working.

------------------------------------------------------------
6. Recommended Folder Structure
------------------------------------------------------------

Inside src/ organize like this:

src/
    components/
    pages/
    services/
    hooks/
    layouts/
    utils/
    App.js
    index.js

Explanation:

components/  -> Reusable UI pieces (Navbar, Card, AlertBox)
pages/       -> Full pages (Login, Dashboard, Reports)
services/    -> API calls
hooks/       -> Custom reusable logic
layouts/     -> Page structure wrapper
utils/       -> Helper functions

------------------------------------------------------------
7. Configure Tailwind CSS
------------------------------------------------------------

Open tailwind.config.js

Make sure content includes:

content: [
  "./src/**/*.{js,jsx,ts,tsx}",
],

Open src/index.css and replace everything with:

@tailwind base;
@tailwind components;
@tailwind utilities;

Restart server:

npm start

Test:

<div className="bg-blue-500 text-white p-4">
  Tailwind is working
</div>

------------------------------------------------------------
8. Connecting To Backend
------------------------------------------------------------

Create file:

src/services/api.js

Add:

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

export default api;

Now you can call:

api.get("/users");
api.post("/login", data);

------------------------------------------------------------
9. Setting Up Routing
------------------------------------------------------------

Open App.js:

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import MapView from "./pages/MapView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

------------------------------------------------------------
10. Pages You Will Build
------------------------------------------------------------

Login Page
Register Page
Dashboard Page
Submit Report Page
Map View Page
Alerts Page
NGO Dashboard Page

Build one page at a time.

------------------------------------------------------------
11. Creating A Basic Page
------------------------------------------------------------

Example: Login Page

Create src/pages/Login.js

import React from "react";

function Login() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-6 bg-white shadow rounded w-80">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
        />
        <button className="bg-blue-600 text-white w-full py-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;

------------------------------------------------------------
12. Handling Forms Properly
------------------------------------------------------------

Use useState:

import React, { useState } from "react";

const [email, setEmail] = useState("");

<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

------------------------------------------------------------
13. Making API Calls
------------------------------------------------------------

Example login:

import api from "../services/api";

const handleLogin = async () => {
  try {
    const response = await api.post("/login", {
      email,
      password
    });

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

------------------------------------------------------------
14. Storing JWT Token
------------------------------------------------------------

After login:

localStorage.setItem("token", response.data.access_token);

Set token for future requests:

api.defaults.headers.common["Authorization"] =
  "Bearer " + localStorage.getItem("token");

------------------------------------------------------------
15. Protected Routes
------------------------------------------------------------

If token not present:
Redirect user to login.

Only logged-in users can:
- Submit reports
- View dashboard
- Access NGO tools

------------------------------------------------------------
16. Map Integration (Important Feature)
------------------------------------------------------------

Install Leaflet:

npm install leaflet react-leaflet

Basic Map Example:

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

<MapContainer center={[20, 77]} zoom={5} style={{ height: "500px" }}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <Marker position={[20, 77]} />
</MapContainer>

Use latitude and longitude from backend to display stations.

------------------------------------------------------------
17. Color Coding Water Safety
------------------------------------------------------------

Example:

If pH < 6 or pH > 8:
Show red marker

If normal:
Show green marker

This helps users quickly identify unsafe water areas.

------------------------------------------------------------
18. Common Frontend Errors
------------------------------------------------------------

Problem: Module not found
Solution:
npm install

Problem: Tailwind not working
Solution:
Restart server

Problem: CORS error
Solution:
Enable CORS in backend

Problem: Map not showing
Solution:
Check CSS import for Leaflet

------------------------------------------------------------
19. Development Strategy
------------------------------------------------------------

Step 1:
Build static UI first.

Step 2:
Connect to backend.

Step 3:
Display dynamic data.

Step 4:
Add loading states.

Step 5:
Improve UI styling.

Do not mix everything at once.

------------------------------------------------------------
20. Domain Concepts (Simple Explanation)
------------------------------------------------------------

Water Station:
Physical location where water is tested.

Station Reading:
Measured value (pH, turbidity, etc.)

Alert:
Official warning (boil notice, contamination).

Report:
User-submitted pollution complaint.

Role:
Citizen, NGO, Authority, Admin.

------------------------------------------------------------
21. Best Practices
------------------------------------------------------------

Keep components small.
Reuse UI components.
Keep API calls in services folder.
Avoid writing logic inside JSX.
Handle errors properly.
Always test in browser.

------------------------------------------------------------
22. Final Advice
------------------------------------------------------------

Frontend may feel confusing at first.

Focus on understanding:
- State
- Props
- API calls
- Routing
- Conditional rendering

Build small features.
Test frequently.
Read console errors carefully.

Do not rush.

Step-by-step progress is the correct way.

------------------------------------------------------------
End of Frontend README
------------------------------------------------------------
