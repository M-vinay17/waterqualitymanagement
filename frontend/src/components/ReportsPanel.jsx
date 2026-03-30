import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = "http://127.0.0.1:8000";

export default function ReportsPanel({ stationId, open, onClose }) {

const [station, setStation] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const closeRef = useRef(null);

useEffect(() => {

if (!open) return;

const handler = (e) => {
if (e.key === "Escape") onClose();
};

document.addEventListener("keydown", handler);
return () => document.removeEventListener("keydown", handler);

}, [open, onClose]);

useEffect(() => {
if (open) closeRef.current?.focus();
}, [open]);

useEffect(() => {

if (!open || !stationId) return;

const fetchStation = async () => {

try {

setLoading(true);
setError(null);

const res = await fetch(`${BASE}/ngo-stations`);

if (!res.ok) throw new Error("Failed to load NGO station");

const data = await res.json();

const found = data.find(
(s) => Number(s.id) === Number(stationId)
);

setStation(found || null);

} catch (err) {

setError(err.message);

} finally {

setLoading(false);

}

};

fetchStation();

}, [open, stationId]);

return (

<AnimatePresence>

{open && (

<>

<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
style={{
position: "fixed",
inset: 0,
background: "rgba(0,0,0,0.35)",
zIndex: 900
}}
/>

<motion.div
initial={{ x: "100%" }}
animate={{ x: 0 }}
exit={{ x: "100%" }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
style={{
position: "fixed",
top: 0,
right: 0,
width: "380px",
height: "100vh",
background: "#f8fafc",
borderLeft: "1px solid #e2eaf4",
boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
zIndex: 1000,
display: "flex",
flexDirection: "column"
}}

>

<div
style={{
display: "flex",
justifyContent: "space-between",
padding: "16px",
background: "#fff",
borderBottom: "1px solid #e2eaf4"
}}
>

<div>

<div style={{ fontSize: "16px", fontWeight: 600 }}>
NGO Station Details
</div>

<div style={{ fontSize: "11px", color: "#94a3b8" }}>
Station #{stationId}
</div>

</div>

<button
ref={closeRef}
onClick={onClose}
style={{
width: "30px",
height: "30px",
borderRadius: "6px",
border: "1px solid #e2eaf4",
background: "#fff",
cursor: "pointer"
}}

>

✕ </button>

</div>

<div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

{loading && <div>Loading NGO information...</div>}

{error && (

<div style={{ color: "red", fontSize: "13px" }}>
{error}
</div>
)}

{!loading && !station && (

<div>No NGO information found</div>
)}

{station && (

<div>

<div style={{
fontSize: "20px",
fontWeight: 600,
marginBottom: "10px"
}}>
{station.name}
</div>

<div style={{ fontSize: "13px", marginBottom: "8px" }}>
👤 Managed By: {station.managed_by}
</div>

<div style={{ fontSize: "13px", marginBottom: "8px" }}>
📍 Latitude: {station.latitude}
</div>

<div style={{ fontSize: "13px", marginBottom: "8px" }}>
📍 Longitude: {station.longitude}
</div>

<div style={{ fontSize: "13px", marginBottom: "8px" }}>
📝 Description:
</div>

<div style={{
fontSize: "13px",
color: "#475569",
marginBottom: "12px"
}}>
{station.description}
</div>

<div style={{ fontSize: "13px" }}>
📞 Contact: {station.contact}
</div>

</div>

)}

</div>

</motion.div>

</>

)}

</AnimatePresence>

);

}
