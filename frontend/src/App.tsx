
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard, AdminLoginPage, AdminSubmissionDetail, Main } from './pages';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions/:id"
          element={
            <AdminProtectedRoute>
              <AdminSubmissionDetail />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
