import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { authClient } from "./lib/auth-client";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (sessionData.data?.session) {
          setIsAuthenticated(true);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error(`Error:`, error);
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background fixed left-0 top-0 z-10">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
