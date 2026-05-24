import type { UserRole } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "@tanstack/react-router";

interface ProtectedRouteProps {
  requiredRole: Exclude<UserRole, null>;
  children: React.ReactNode;
}

export function ProtectedRoute({
  requiredRole,
  children,
}: ProtectedRouteProps) {
  const { role: currentRole, token } = useAuth();

  if (!token || !currentRole) {
    return <Navigate to="/login" />;
  }

  if (currentRole !== requiredRole) {
    const redirect =
      currentRole === "admin" ? "/admin/dashboard" : "/student/dashboard";
    return <Navigate to={redirect} />;
  }

  return <>{children}</>;
}
