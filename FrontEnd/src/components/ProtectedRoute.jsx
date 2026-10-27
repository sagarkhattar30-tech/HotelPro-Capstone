import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { /* ignore */ }

  // Not logged in → go to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction check — redirect unauthorised users to their own dashboard
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Guest trying to reach /admin or /staff → send them to /dashboard
      if (user.role === 'Admin') return <Navigate to="/admin" replace />;
      if (user.role === 'Staff') return <Navigate to="/staff" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
