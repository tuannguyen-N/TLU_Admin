import { useIsAuthenticated } from "@azure/msal-react";
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "../contexts/RoleContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const roleCtx = useRole();


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roleCtx.initialized) {
    return null;
  }

  const allowed = roleCtx.hasPageAccess(location.pathname);

  if (!allowed) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}