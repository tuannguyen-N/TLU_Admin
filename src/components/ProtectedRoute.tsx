import { useIsAuthenticated } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRole } from "../contexts/RoleContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();
  const roleCtx = useRole();

  useEffect(() => {
    instance.initialize().then(() => {
      setIsReady(true);
    });
  }, [instance]);

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated but does not have page access, redirect
  try {
    const allowed = roleCtx.hasPageAccess(location.pathname);
    if (!allowed) {
      return <Navigate to="/access-denied" replace />;
    }
  } catch (err) {
    // if role context not ready or error, fallback to allow
  }

  return <>{children}</>;
}