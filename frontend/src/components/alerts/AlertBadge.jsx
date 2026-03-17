import React from "react";

function AlertBadge({ count }) {
  if (count === 0) return null;

  return (
    <span className="alert-badge">
      {count}
    </span>
  );
}

export default AlertBadge;
