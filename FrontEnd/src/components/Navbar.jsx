import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AatithyaLogo from './AatithyaLogo';
import {
  BellIcon,
  CloseIcon,
  ChevronDownIcon,
  MenuIcon,
  CrownIcon,
  SparklesIcon
} from './Icons';
import { useSupport } from '../context/SupportContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSupport } = useSupport();

  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevRouteKey, setPrevRouteKey] = useState(location.pathname + location.search);

  // Close menus on route change without cascading effect renders
  if (location.pathname + location.search !== prevRouteKey) {
    setPrevRouteKey(location.pathname + location.search);
    setMobileOpen(false);
    setShowNotifs(false);
    setShowUserMenu(false);
  }

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const isLoggedIn = useMemo(() => {
    if (location.pathname) return !!localStorage.getItem('token');
    return false;
  }, [location.pathname]);

  const user = useMemo(() => {
    if (!location.pathname) return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click outside to dismiss popovers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch notifications for logged-in guest
  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosClient.get('/api/notifications');
        if (!cancelled && Array.isArray(res.data)) {
          setNotifications(res.data.slice(0, 8));
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const markRead = async (id) => {
    try {
      await axiosClient.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      /* silent */
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setNotifications([]);
    setShowUserMenu(false);
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const dashboardPath = user?.role === 'Admin' ? '/admin' : user?.role === 'Staff' ? '/staff' : '/dashboard';
  const dashboardLabel = user?.role === 'Admin' ? 'Imperial Admin Desk' : user?.role === 'Staff' ? 'Palace Staff Panel' : 'Member Concierge';
  const userInitials = (user?.name || 'Guest')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <nav
        className={`aatithya-navbar ${scrolled ? 'is-scrolled' : ''}`}
        aria-label="Main Navigation"
      >
        <div className="aatithya-nav-container">
          {/* ── Brand Logo & Insignia ── */}
          <Link to="/" className="aatithya-nav-brand" aria-label="Aatithya Royal Hospitality Home">
            <AatithyaLogo variant="default" size="md" />
          </Link>

          {/* ── Desktop Navigation Links (Hidden on Auth Pages) ── */}
          {!isAuthPage && (
            <ul className="aatithya-nav-menu">
              <li>
                <Link
                  to="/"
                  className={`aatithya-nav-item ${location.pathname === '/' ? 'active' : ''}`}
                >
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/rooms"
                  className={`aatithya-nav-item ${location.pathname.startsWith('/rooms') ? 'active' : ''}`}
                >
                  <span>Heritage Suites</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/rooms?search=Jaipur"
                  className={`aatithya-nav-item ${location.search.includes('Jaipur') ? 'active' : ''}`}
                >
                  <span>Royal Haveli</span>
                </Link>
              </li>
              {isLoggedIn && (
                <li>
                  <Link
                    to="/my-bookings"
                    className={`aatithya-nav-item ${location.pathname.startsWith('/my-bookings') ? 'active' : ''}`}
                  >
                    <span>My Bookings</span>
                  </Link>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => openSupport()}
                  className="aatithya-nav-item"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🛎️ Support &amp; Help</span>
                </button>
              </li>
            </ul>
          )}

          {/* ── Right-Side Controls ── */}
          <div className="aatithya-nav-actions">
            {/* Concierge Notifications */}
            {isLoggedIn && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowNotifs((s) => !s)}
                  className={`aatithya-icon-btn ${unreadCount > 0 ? 'has-badge' : ''}`}
                  aria-label={`Concierge alerts (${unreadCount} unread)`}
                >
                  <BellIcon size={18} color="var(--emerald-900, #0F3A2F)" />
                  {unreadCount > 0 && (
                    <span className="aatithya-badge-count">{unreadCount}</span>
                  )}
                </button>

                {/* Concierge Alerts Popover */}
                {showNotifs && (
                  <div className="aatithya-popover aatithya-notif-popover">
                    <div className="aatithya-popover-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SparklesIcon size={14} color="var(--gold, #C5A059)" />
                        <span className="aatithya-popover-title">Royal Concierge Alerts</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="aatithya-popover-badge">{unreadCount} New</span>
                      )}
                    </div>

                    <div className="aatithya-popover-body">
                      {notifications.length === 0 ? (
                        <div className="aatithya-notif-empty">
                          <CrownIcon size={24} color="var(--gold, #C5A059)" />
                          <p>All royal notices have been received.</p>
                          <span>Your concierge will inform you of upcoming suite arrangements.</span>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markRead(n._id)}
                            className={`aatithya-notif-row ${n.isRead ? 'is-read' : 'is-unread'}`}
                          >
                            <span className="aatithya-notif-dot" />
                            <div className="aatithya-notif-content">
                              <p>{n.message}</p>
                              <span className="aatithya-notif-time">
                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Experience or Guest CTA */}
            {isLoggedIn ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((m) => !m)}
                  className="aatithya-user-pill"
                  aria-expanded={showUserMenu}
                  aria-label="User Account Menu"
                >
                  <div className="aatithya-avatar-ring">
                    <span>{userInitials}</span>
                  </div>
                  <div className="aatithya-user-label">
                    <span className="aatithya-user-greeting">Namaste</span>
                    <span className="aatithya-user-name">{user?.name?.split(' ')[0] || 'Guest'}</span>
                  </div>
                  <ChevronDownIcon size={14} color="var(--gold, #C5A059)" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="aatithya-popover aatithya-user-popover">
                    <div className="aatithya-user-menu-header">
                      <div className="aatithya-avatar-large">{userInitials}</div>
                      <div>
                        <div className="aatithya-user-fullname">{user?.name}</div>
                        <div className="aatithya-user-email">{user?.email}</div>
                        <span className="aatithya-role-tag">
                          {user?.role === 'Admin' ? '👑 Imperial Administrator' : user?.role === 'Staff' ? '⚜️ Palace Staff' : '✨ Royal Heritage Guest'}
                        </span>
                      </div>
                    </div>

                    <div className="aatithya-menu-divider" />

                    <ul className="aatithya-user-menu-list">
                      <li>
                        <Link to="/my-bookings" className="aatithya-menu-link">
                          <span>📋 My Reservations & Stays</span>
                        </Link>
                      </li>
                      <li>
                        <Link to={dashboardPath} className="aatithya-menu-link">
                          <span>🛎️ {dashboardLabel}</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/rooms" className="aatithya-menu-link">
                          <span>🏰 Explore Heritage Suites</span>
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            openSupport();
                          }}
                          className="aatithya-menu-link"
                          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <span>🛎️ 24/7 Royal Support Desk</span>
                        </button>
                      </li>
                    </ul>

                    <div className="aatithya-menu-divider" />

                    <div style={{ padding: '8px 14px 14px' }}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="aatithya-btn-logout"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isAuthPage ? (
              <div className="aatithya-guest-actions">
                {location.pathname === '/login' ? (
                  <Link to="/register" className="aatithya-link-signin" style={{ padding: '8px 18px', border: '1px solid rgba(15, 58, 47, 0.18)', borderRadius: '24px' }}>
                    New Guest? Register
                  </Link>
                ) : (
                  <Link to="/login" className="aatithya-link-signin" style={{ padding: '8px 18px', border: '1px solid rgba(15, 58, 47, 0.18)', borderRadius: '24px' }}>
                    Sign In
                  </Link>
                )}
              </div>
            ) : (
              <div className="aatithya-guest-actions">
                <Link to="/login" className="aatithya-link-signin">
                  Sign In
                </Link>
                <Link to="/rooms" className="aatithya-btn-reserve">
                  <span>Reserve Stay</span>
                  <SparklesIcon size={14} color="#C5A059" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            {!isAuthPage && (
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                className="aatithya-hamburger-btn"
                aria-label={mobileOpen ? 'Close Navigation' : 'Open Navigation'}
              >
                {mobileOpen ? <CloseIcon size={22} color="var(--emerald-900)" /> : <MenuIcon size={24} color="var(--emerald-900)" />}
              </button>
            )}
          </div>
        </div>

        {/* ── Responsive Mobile Slide-Down Drawer ── */}
        {!isAuthPage && mobileOpen && (
          <div className="aatithya-mobile-drawer">
            <div className="aatithya-mobile-drawer-inner">
              <ul className="aatithya-mobile-nav-list">
                <li>
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className={location.pathname === '/' ? 'active' : ''}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rooms"
                    onClick={() => setMobileOpen(false)}
                    className={location.pathname.startsWith('/rooms') ? 'active' : ''}
                  >
                    Heritage Suites & Residences
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rooms?search=Jaipur"
                    onClick={() => setMobileOpen(false)}
                  >
                    Pink City &bull; Jaipur Palaces
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rooms?search=Udaipur"
                    onClick={() => setMobileOpen(false)}
                  >
                    Lake Pichola &bull; Udaipur Estates
                  </Link>
                </li>
                {isLoggedIn && (
                  <>
                    <li>
                      <Link
                        to="/my-bookings"
                        onClick={() => setMobileOpen(false)}
                        className={location.pathname.startsWith('/my-bookings') ? 'active' : ''}
                      >
                        My Reservations
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={dashboardPath}
                        onClick={() => setMobileOpen(false)}
                      >
                        {dashboardLabel}
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openSupport();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: '10px 0',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--emerald-900, #0F3A2F)',
                      cursor: 'pointer'
                    }}
                  >
                    🛎️ 24/7 Palace Concierge &amp; Support
                  </button>
                </li>
              </ul>

              <div className="aatithya-mobile-footer">
                {isLoggedIn ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--emerald-900)', fontWeight: 600 }}>
                      Logged in as {user?.name}
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="aatithya-btn-logout"
                      style={{ textAlign: 'center' }}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn-outline"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/rooms"
                      onClick={() => setMobileOpen(false)}
                      className="btn-gold"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Reserve Stay
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
