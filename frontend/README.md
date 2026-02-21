# Water Quality Monitor — Frontend

This folder contains a React + Vite frontend for the Water Quality Monitoring dashboard.

Quick start (Windows):

1. From `wqm-b13-main/frontend` run:

```bash
npm install
npm run dev
```

2. Open the dev URL printed by Vite (usually `http://localhost:5173`).

Notes:
- This project uses Tailwind CSS. The `index.css` includes Tailwind directives.
- Leaflet CSS is imported inside `WaterMap.jsx` (`leaflet/dist/leaflet.css`). Ensure `leaflet` is installed.
- API calls are stubbed with dummy data inside `Dashboard.jsx`. Replace the dummy data with `axios.get('/api/dashboard')` when backend is ready.

If you want, I can run `npm install` and start the dev server for you.
