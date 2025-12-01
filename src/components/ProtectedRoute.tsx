import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "staff" | "admin")[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to auth page
        navigate("/auth");
      } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Authenticated but doesn't have the required role
        navigate("/");
      }
    }
  }, [user, userRole, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || (allowedRoles && userRole && !allowedRoles.includes(userRole))) {
    return null;
  }

  return <>{children}</>;
};
