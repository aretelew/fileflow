import React from 'react';
  import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {useAuth} from "@/contexts/AuthContext";

  const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
      return <div>Loading authentication...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Outlet />;
  };

  export default ProtectedRoute;