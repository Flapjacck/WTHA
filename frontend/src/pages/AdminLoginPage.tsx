import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/adminAuth';
import { AdminLogin } from '../components/AdminLogin';

export const AdminLoginPage: React.FC = () => {
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="page-bg admin-layout min-h-screen">
      <AdminLogin />
    </div>
  );
};
