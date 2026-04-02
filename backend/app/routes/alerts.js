const express = require("express");
const router = express.Router();

let alerts = [
  { id: 1, type: "boil_notice", location: "Chennai", issued_at: "2026-01-10" },
  { id: 2, type: "boil_notice", location: "Erode", issued_at: "2026-01-15" },
  { id: 3, type: "contamination", location: "Salem", issued_at: "2026-02-12" },
  { id: 4, type: "contamination", location: "Coimbatore", issued_at: "2026-02-18" },
  { id: 5, type: "outage", location: "Madurai", issued_at: "2026-03-05" },
  { id: 6, type: "outage", location: "Trichy", issued_at: "2026-03-15" },
  { id: 7, type: "boil_notice", location: "Chennai", issued_at: "2026-04-10" },
  { id: 8, type: "contamination", location: "Erode", issued_at: "2026-04-20" },
  { id: 9, type: "outage", location: "Salem", issued_at: "2026-05-11" },
  { id: 10, type: "boil_notice", location: "Coimbatore", issued_at: "2026-06-01" }
];


router.get("/", (req, res) => {
  res.json(alerts);
});


router.get("/:id", (req, res) => {
  const alert = alerts.find(a => a.id == req.params.id);

  if (!alert) {
    return res.status(404).json({ message: "Alert not found" });
  }

  res.json(alert);
});


router.post("/", (req, res) => {
  const newAlert = {
    id: alerts.length + 1,
    type: req.body.type,
    location: req.body.location,
    message: req.body.message,
    issued_at: req.body.issued_at
  };

  alerts.push(newAlert);

  res.status(201).json(newAlert);
});


router.put("/:id", (req, res) => {
  const index = alerts.findIndex(a => a.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Alert not found" });
  }

  alerts[index] = {
    ...alerts[index],
    ...req.body
  };

  res.json(alerts[index]);
});


router.delete("/:id", (req, res) => {
  const index = alerts.findIndex(a => a.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Alert not found" });
  }

  const deleted = alerts.splice(index, 1);

  res.json({
    message: "Alert deleted successfully",
    deleted: deleted[0]
  });
});

module.exports = router;