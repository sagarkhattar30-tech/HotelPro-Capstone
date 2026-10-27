import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import UnifiedDashboard from './pages/UnifiedDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import BookingConfirmation from './pages/BookingConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import { SupportProvider, useSupport } from './context/SupportContext';
import SupportModal from './components/SupportModal';

function RootRoute() {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    /* ignore */
  }

  // Not logged in -> Show Login/Register first
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users according to their roles
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user.role === 'Staff') return <Navigate to="/staff" replace />;
  return <Home />;
}

function AuthGateRoute({ children }) {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    /* ignore */
  }

  if (token && user) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const { isSupportOpen, closeSupport, initialCategory } = useSupport();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary, #FAF7F2)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
          <Route path="/login" element={<AuthGateRoute><Login /></AuthGateRoute>} />
          <Route path="/register" element={<AuthGateRoute><Register /></AuthGateRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/booking-confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['Staff', 'Admin']}><UnifiedDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><UnifiedDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}

      <SupportModal
        isOpen={isSupportOpen}
        onClose={closeSupport}
        initialCategory={initialCategory}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <SupportProvider>
        <ScrollToTop />
        <AppLayout />
      </SupportProvider>
    </Router>
  );
}
export default App;
