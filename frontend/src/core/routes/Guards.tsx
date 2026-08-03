import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoadingScreen } from '../../shared/components/Loading';
import type { Role } from '../types';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function RoleGuard({ roles }: { roles: Role[] }) {
  const { role } = useAuth();
  if (!role || !roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}