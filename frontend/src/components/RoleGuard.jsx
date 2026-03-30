import { Navigate } from "react-router-dom";

export default function RoleGuard({ allowedRoles = [], children }) {

  const role = localStorage.getItem("user_role");

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}