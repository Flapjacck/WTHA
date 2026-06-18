import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/adminAuth';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <header className="form-card admin-header mb-4 sm:mb-6 overflow-hidden">
      <div className="form-card-header admin-header__inner">
        <div className="admin-header__text">
          <h1 className="admin-header__title">{title}</h1>
          {subtitle && <p className="admin-header__subtitle">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline admin-header__logout"
        >
          Log out
        </button>
      </div>
    </header>
  );
};
