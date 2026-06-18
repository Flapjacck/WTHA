import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/adminAuth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
