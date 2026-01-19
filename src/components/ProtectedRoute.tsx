import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('super_admin' | 'admin' | 'teacher' | 'student' | 'parent')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-flora-gold animate-spin mx-auto" />
          <p className="text-white/80 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPaths: Record<string, string> = {
      super_admin: '/admin',
      admin: '/admin',
      teacher: '/teacher',
      student: '/student',
      parent: '/parent',
    };
    
    return <Navigate to={dashboardPaths[role] || '/'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
