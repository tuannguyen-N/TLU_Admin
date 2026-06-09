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
    instance.handleRedirectPromise()
        .then(() => setIsReady(true))
        .catch(() => setIsReady(true));
  }, [instance]);

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for role context initialization to avoid false negatives
  if (!roleCtx.initialized) return null;

  // If user is authenticated but does not have page access, redirect
  const allowed = roleCtx.hasPageAccess(location.pathname);
  if (!allowed) {
    // Diagnostic log to help debug unexpected access-denied cases
    try {
      // eslint-disable-next-line no-console
      console.warn('[ProtectedRoute] access denied', { role: roleCtx.role, path: location.pathname });
    } catch (e) {}
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}