import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/adminAuth';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const success = login(username.trim(), password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-card admin-login">
      <div className="form-card-header">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-sm opacity-90 mt-1">Sign in to view hose submissions</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
        {error && <div className="alert alert-error">{error}</div>}

        <div>
          <label htmlFor="admin-username" className="form-label">
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="form-label">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};
