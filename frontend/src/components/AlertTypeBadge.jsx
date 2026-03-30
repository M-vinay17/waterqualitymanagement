export default function AlertTypeBadge({ type }) {
  const colors = {
    boil_notice: "#f59e0b",
    contamination: "#ef4444",
    outage: "#6b7280",
    predictive: "#14b8a6",
  };

  return (
    <span
      style={{
        background: colors[type],
        color: "white",
        padding: "4px 8px",
        borderRadius: "5px",
      }}
    >
      {type}
    </span>
  );
}