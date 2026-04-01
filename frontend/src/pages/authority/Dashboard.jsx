import { useEffect, useState } from "react";
import ReportQueue from "./ReportQueue";
import WaterQualityOverview from "./WaterQualityOverview";
import AlertManagement from "./AlertManagement";
import UserManagement from "./UserManagement";
import KpiCard from "../../components/KpiCard";

export default function AuthorityDashboard() {

  // ✅ KPI State
  const [kpis, setKpis] = useState({
    pendingReports: 0,
    activeAlerts: 0,
    stationsAboveThreshold: 0,
    verifiedThisMonth: 0,
  });

  const [loading, setLoading] = useState(true);

  // ✅ TEMP ROLE (for testing)
  const userRole = "admin";

  // ✅ Dummy data (we will replace with API later)
  useEffect(() => {
    setTimeout(() => {
      setKpis({
        pendingReports: 12,
        activeAlerts: 5,
        stationsAboveThreshold: 3,
        verifiedThisMonth: 20,
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4 text-white">
        Authority Dashboard
      </h1>

      {/* ✅ F2-6 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Pending Reports"
          value={kpis.pendingReports}
          loading={loading}
        />
        <KpiCard
          title="Active Alerts"
          value={kpis.activeAlerts}
          loading={loading}
        />
        <KpiCard
          title="Stations Above Threshold"
          value={kpis.stationsAboveThreshold}
          loading={loading}
        />
        <KpiCard
          title="Verified This Month"
          value={kpis.verifiedThisMonth}
          loading={loading}
        />
      </div>

      {/* F2-2 */}
      <ReportQueue />

      {/* F2-3 */}
      <WaterQualityOverview />

      {/* F2-4 */}
      <AlertManagement />

      {/* F2-5 (ADMIN ONLY) */}
      {userRole === "admin" && <UserManagement />}

    </div>
  );
}