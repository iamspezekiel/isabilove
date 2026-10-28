import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-200 animate-pulse">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-neutral-900 font-display">IsabiLove</h2>
            <p className="text-xs text-neutral-500 font-medium">
              Verifying your secure session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the intended destination in router state so the user lands back here after sign in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
