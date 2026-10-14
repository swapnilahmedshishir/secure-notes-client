import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Loading } from "../components/ui";

// Blocks unauthenticated access and restores the session on reload.
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading label="Restoring session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Backend role is authoritative; the guard reads it from the verified /auth/me user.
export function RequireAdmin() {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Checking permissions…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
