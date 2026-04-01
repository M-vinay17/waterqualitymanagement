import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleGuard({ 
  allowedRoles = [], 
  children, 
  user = null 
}) {
  
  // Get role from localStorage or from passed user prop (more flexible)
  let userRole = null;

  if (user && user.role) {
    userRole = user.role;
  } else {
    userRole = localStorage.getItem("user_role");
  }

  // If no role found or role is not allowed → redirect to 403
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  // If role is allowed, render the protected component
  return children;
}