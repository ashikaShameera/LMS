import React from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import AuthService from "../../services/AuthService";

/**
 * Guard routes by login + optional roles.
 * If roles are provided, user.role must be in the list.
 * Optionally enforce that the URL id matches the user's own id.
 */
export default function RequireAuth({ allowedRoles, enforceSelf = false }) {
  const info = AuthService.getAuthInfo();
  const token = AuthService.getAuthToken();
  const location = useLocation();
  const params = useParams();

  if (!token || !info) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.map(String).includes(String(info.role))) {
    return <Navigate to={AuthService.resolveHomePath(info)} replace />;
  }

  // Optional: block visiting others' dashboards by URL tampering
  if (enforceSelf) {
    const role = String(info.role || "");
    if (role === "STUDENT" && params.studentId && String(params.studentId) !== String(info.studentId)) {
      return <Navigate to={AuthService.resolveHomePath(info)} replace />;
    }
    if (role === "INSTRUCTOR" && params.instructorId && String(params.instructorId) !== String(info.instructorId)) {
      return <Navigate to={AuthService.resolveHomePath(info)} replace />;
    }
  }

  return <Outlet />;
}
