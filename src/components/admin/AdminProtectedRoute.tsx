import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if admin session exists
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        // Basic validation - check for token and isAdmin flag
        if (session && session.token && session.isAdmin) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Invalid admin session format');
        localStorage.removeItem('adminSession');
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login with return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
