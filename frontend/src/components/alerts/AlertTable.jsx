import React from "react";
import "./alertStyles.css";

const AlertTable = ({ alerts }) => {
  return (
    <div className="alerts-wrapper">

      <table className="alerts-table">
        <thead>
          <tr>
            <th>Station</th>
            <th>Parameter</th>
            <th>Value</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td>{alert.station}</td>
              <td>{alert.parameter}</td>
              <td>{alert.value}</td>

              <td>
                <span className={`severity ${alert.severity}`}>
                  {alert.severity}
                </span>
              </td>

              <td>{alert.status}</td>
              <td>{alert.time}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default AlertTable;
