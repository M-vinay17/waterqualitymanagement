import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleGuard({ children, roles }) {

  const userRole = "authority"; // temp

  if (!roles.includes(userRole)) {
    return <Navigate to="/403" />;
  }

  return children;
}