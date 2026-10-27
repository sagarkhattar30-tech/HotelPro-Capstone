import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { StarIcon, CloseIcon, PrinterIcon } from '../components/Icons';
import InvoiceModal from '../components/InvoiceModal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'hotels' | 'rooms' | 'bookings' | 'payments' | 'users' | 'logs'
  const [analytics, setAnalytics] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  // Modals & Forms
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [activeInvoiceBookingId, setActiveInvoiceBookingId] = useState(null);

  // New Room Form State
  const [newRoom, setNewRoom] = useState({
    roomNumber: '601',
    name: 'Crown Royal Penthouse',
    type: 'Penthouse',
    pricePerNight: 650,
    capacity: 4,
    bedType: 'Super King Bed',
    sizeSqFt: 1400,
    floor: 6,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    description: 'An expansive modern luxury penthouse featuring high ceilings, skyline views, and a private cocktail terrace.',
    amenities: 'Skyline Terrace, High-Speed WiFi, Jacuzzi, Butler Service, Mini Bar'
  });

  const fetchAdminData = useCallback(async () => {
    try {
      const [analyticsRes, hotelsRes, roomsRes, bookingsRes, paymentsRes, usersRes, logsRes] = await Promise.all([
        axiosClient.get('/api/admin/analytics').catch(() => ({ data: null })),
        axiosClient.get('/api/hotels').catch(() => ({ data: [] })),
        axiosClient.get('/api/rooms').catch(() => ({ data: [] })),
        axiosClient.get('/api/bookings').catch(() => ({ data: [] })),
        axiosClient.get('/api/payments/history').catch(() => ({ data: [] })),
        axiosClient.get('/api/admin/users').catch(() => ({ data: [] })),
        axiosClient.get('/api/admin/logs').catch(() => ({ data: [] }))
      ]);

      setAnalytics(analyticsRes.data);
      setHotels(hotelsRes.data || []);
      setRooms(roomsRes.data || []);
      setBookings(bookingsRes.data || []);
      setPayments(paymentsRes.data || []);
      setUsers(usersRes.data || []);
      setLogs(logsRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  }, []);

  // Load on mount — run inline to satisfy react-hooks/set-state-in-effect
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [analyticsRes, hotelsRes, roomsRes, bookingsRes, paymentsRes, usersRes, logsRes] = await Promise.all([
          axiosClient.get('/api/admin/analytics').catch(() => ({ data: null })),
          axiosClient.get('/api/hotels').catch(() => ({ data: [] })),
          axiosClient.get('/api/rooms').catch(() => ({ data: [] })),
          axiosClient.get('/api/bookings').catch(() => ({ data: [] })),
          axiosClient.get('/api/payments/history').catch(() => ({ data: [] })),
          axiosClient.get('/api/admin/users').catch(() => ({ data: [] })),
          axiosClient.get('/api/admin/logs').catch(() => ({ data: [] }))
        ]);
        if (!active) return;
        setAnalytics(analyticsRes.data);
        setHotels(hotelsRes.data || []);
        setRooms(roomsRes.data || []);
        setBookings(bookingsRes.data || []);
        setPayments(paymentsRes.data || []);
        setUsers(usersRes.data || []);
        setLogs(logsRes.data || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArr = newRoom.amenities.split(',').map((a) => a.trim());
      await axiosClient.post('/api/rooms', {
        ...newRoom,
        amenities: amenitiesArr
      });

      alert('Room created successfully!');
      setShowAddRoomModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to remove this residence listing?')) return;
    try {
      await axiosClient.delete(`/api/rooms/${roomId}`);
      alert('Room deleted.');
      fetchAdminData();
    } catch {
      alert('Failed to delete room.');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axiosClient.put(`/api/admin/users/${userId}/role`, { role: newRole });
      alert(`User role updated to ${newRole}`);
      fetchAdminData();
    } catch {
      alert('Failed to update role.');
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* Admin Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c5a059' }}>
            Executive Operations
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', margin: '4px 0' }}>
            HotelPro Management &amp; Analytics
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Master control of inventory, revenue audits, staff assignments, reservations, and security audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowAddRoomModal(true)} className="btn-gold" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            + Add New Luxury Room
          </button>
          <button onClick={fetchAdminData} className="btn-dark" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            &#8635; Refresh Audit
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Gross Portfolio Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '6px 0' }}>
              ${analytics.metrics.totalRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>+18.4% vs previous quarter</div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Occupancy Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#c5a059', margin: '6px 0' }}>
              {analytics.metrics.occupancyRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{analytics.metrics.occupiedRooms} of {analytics.metrics.totalRooms} rooms occupied</div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Active Reservations</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e40af', margin: '6px 0' }}>
              {analytics.metrics.activeBookings}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>{analytics.metrics.totalBookings} total all-time</div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Registered Guests</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '6px 0' }}>
              {analytics.metrics.totalGuests}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{analytics.metrics.totalStaff} staff accounts active</div>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px' }}>
        {[
          { id: 'overview', label: '📊 Financial & Occupancy Analytics' },
          { id: 'hotels', label: '🏰 Hotels & Properties Portfolio' },
          { id: 'rooms', label: '🏨 Room Inventory Management' },
          { id: 'bookings', label: '📑 Global Reservations Monitor' },
          { id: 'payments', label: '💳 Payment Audits & Invoices' },
          { id: 'users', label: '👥 Staff & User Permissions' },
          { id: 'logs', label: '🛡️ Security & Activity Audit' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              background: activeTab === t.id ? '#0f172a' : '#ffffff',
              color: activeTab === t.id ? '#dfb76c' : '#475569',
              border: activeTab === t.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
              boxShadow: activeTab === t.id ? '0 4px 14px rgba(15,23,42,0.18)' : 'none'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview & Analytics */}
      {activeTab === 'overview' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
          {/* Monthly Revenue Chart */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '4px' }}>Monthly Revenue Performance</h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '24px' }}>Gross earnings over the previous 6 reporting periods ($ USD)</p>

            {/* Interactive SVG Area Chart */}
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c5a059" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#c5a059" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="4" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="4" />

                {/* Filled Area */}
                <path
                  d="M 20 120 Q 100 80, 180 40 T 340 30 T 480 80 L 480 180 L 20 180 Z"
                  fill="url(#goldGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 20 120 Q 100 80, 180 40 T 340 30 T 480 80"
                  fill="none"
                  stroke="#c5a059"
                  strokeWidth="3.5"
                />

                {/* Data Points */}
                {analytics.monthlyRevenue.map((item, idx) => {
                  const x = 30 + idx * 88;
                  const y = 170 - (item.revenue / 35000) * 130;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#0f172a" stroke="#dfb76c" strokeWidth="2.5" />
                      <text x={x} y="195" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">{item.month}</text>
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="700">${(item.revenue / 1000).toFixed(1)}k</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Room Category Distribution */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '4px' }}>Portfolio by Category</h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '20px' }}>Residences count and average night rate</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {analytics.roomCategories.map((cat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <strong>{cat.type}</strong>
                    <span style={{ color: '#c5a059', fontWeight: '700' }}>{cat.count} Units &bull; ${cat.avgPrice}/nt</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(cat.count / 8) * 100}%`,
                        background: 'linear-gradient(90deg, #c5a059, #dfb76c)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Hotels & Properties Portfolio */}
      {activeTab === 'hotels' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-card)', marginBottom: '40px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Global Hotel Properties Portfolio</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{hotels.length} International Properties</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Property Name</th>
                  <th style={{ padding: '14px 20px' }}>City &amp; Location</th>
                  <th style={{ padding: '14px 20px' }}>Star Rating</th>
                  <th style={{ padding: '14px 20px' }}>Starting Price</th>
                  <th style={{ padding: '14px 20px' }}>Active Suites</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{h.name}</strong>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{h.address}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: 'rgba(197, 160, 89, 0.1)', color: '#9e7930', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                        📍 {h.location}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <StarIcon size={16} color="#d97706" />
                        <strong>{h.rating || 4.9}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({h.reviewCount || 100}+ reviews)</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>${h.startingPrice}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}> / night</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="badge badge-available">
                        {h.totalRooms || 4} Total Suites
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <a
                        href={`/rooms?hotel=${encodeURIComponent(h.name)}`}
                        className="btn-outline-gold"
                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                      >
                        Inspect Suites &rarr;
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Room Inventory Manager */}
      {activeTab === 'rooms' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Hotel Suite &amp; Residence Inventory</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{rooms.length} Total Units in Catalog</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Room #</th>
                  <th style={{ padding: '14px 20px' }}>Title &amp; Type</th>
                  <th style={{ padding: '14px 20px' }}>Nightly Price</th>
                  <th style={{ padding: '14px 20px' }}>Capacity / SqFt</th>
                  <th style={{ padding: '14px 20px' }}>Current Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>#{r.roomNumber}</strong>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{r.name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#c5a059', fontWeight: '700' }}>{r.type}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>${r.pricePerNight}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}> / night</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div>{r.capacity} Guests</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.sizeSqFt || 550} sq.ft &bull; Floor {r.floor}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        className={`badge ${
                          r.status === 'Available'
                            ? 'badge-available'
                            : r.status === 'Occupied'
                            ? 'badge-occupied'
                            : r.status === 'Cleaning'
                            ? 'badge-cleaning'
                            : 'badge-maintenance'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteRoom(r._id)}
                        className="btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Global Reservations Monitor */}
      {activeTab === 'bookings' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Master Reservations Monitor</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Ref / Room</th>
                  <th style={{ padding: '14px 20px' }}>Guest Details</th>
                  <th style={{ padding: '14px 20px' }}>Stay Window</th>
                  <th style={{ padding: '14px 20px' }}>Total Amount</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: '#0f172a' }}>{b.bookingNumber}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#c5a059' }}>{b.roomName} (#{b.roomNumber})</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600' }}>{b.userName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.userEmail}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div>{new Date(b.checkInDate).toLocaleDateString()} &rarr; {new Date(b.checkOutDate).toLocaleDateString()}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.nights} nights</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: '#0f172a' }}>${b.totalPrice}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{b.paymentStatus}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="badge badge-gold">{b.status}</span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => setActiveInvoiceBookingId(b._id)}
                        className="btn-outline-gold"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        <PrinterIcon size={12} /> View Tax Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payments & Ledger */}
      {activeTab === 'payments' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Financial Transaction Audits</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Invoice #</th>
                  <th style={{ padding: '14px 20px' }}>Booking Ref</th>
                  <th style={{ padding: '14px 20px' }}>Guest</th>
                  <th style={{ padding: '14px 20px' }}>Amount</th>
                  <th style={{ padding: '14px 20px' }}>Method &bull; Last 4</th>
                  <th style={{ padding: '14px 20px' }}>Transaction ID</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No payment records retrieved</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#c5a059' }}>{p.invoiceNumber}</td>
                      <td style={{ padding: '16px 20px' }}>{p.bookingNumber}</td>
                      <td style={{ padding: '16px 20px' }}>{p.userName}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '800' }}>${p.amount}</td>
                      <td style={{ padding: '16px 20px' }}>{p.paymentMethod} (**** {p.cardLast4 || '4242'})</td>
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.transactionId}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className="badge badge-available">{p.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users & Roles */}
      {activeTab === 'users' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>User &amp; Staff Access Control</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Name</th>
                  <th style={{ padding: '14px 20px' }}>Email</th>
                  <th style={{ padding: '14px 20px' }}>Current Role</th>
                  <th style={{ padding: '14px 20px' }}>Tier</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '700' }}>{u.name}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{u.email}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="badge badge-gold">{u.role}</span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#9e7930', fontWeight: '700' }}>
                      {u.membershipTier || 'Gold Elite'}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <select
                        className="form-select"
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        style={{ width: '130px', padding: '6px 10px', fontSize: '0.8rem' }}
                      >
                        <option value="Guest">Guest</option>
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Security & Audit Logs */}
      {activeTab === 'logs' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>System Security &amp; Activity Audit Log</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Timestamp</th>
                  <th style={{ padding: '14px 20px' }}>Action</th>
                  <th style={{ padding: '14px 20px' }}>Actor</th>
                  <th style={{ padding: '14px 20px' }}>Target / Entity</th>
                  <th style={{ padding: '14px 20px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', color: '#94a3b8' }}>
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0f172a' }}>{l.action}</td>
                    <td style={{ padding: '14px 20px', color: '#c5a059', fontWeight: '600' }}>{l.performedBy}</td>
                    <td style={{ padding: '14px 20px' }}>{l.targetEntity}</td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Room Modal */}
      {showAddRoomModal && (
        <div className="modal-overlay" onClick={() => setShowAddRoomModal(false)}>
          <div className="modal-content" style={{ padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>Add New Luxury Residence Listing</h3>
              <button onClick={() => setShowAddRoomModal(false)} style={{ background: '#f1f5f9', borderRadius: '50%', width: '30px', height: '30px' }}>
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Room #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Residence Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Category</label>
                  <select
                    className="form-select"
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  >
                    <option value="Presidential Villa">Presidential Villa</option>
                    <option value="Ocean Villa">Ocean Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Standard Double">Standard Double</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Price / Night ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newRoom.pricePerNight}
                    onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Max Capacity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Bedding Type</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newRoom.bedType}
                    onChange={(e) => setNewRoom({ ...newRoom, bedType: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Size (sq ft)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newRoom.sizeSqFt}
                    onChange={(e) => setNewRoom({ ...newRoom, sizeSqFt: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Floor</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Cover Image URL (High-Res)</label>
                <input
                  type="url"
                  className="form-input"
                  value={newRoom.image}
                  onChange={(e) => setNewRoom({ ...newRoom, image: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Amenities (Comma Separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newRoom.amenities}
                  onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Publish Room Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Inspection Modal */}
      {activeInvoiceBookingId && (
        <InvoiceModal
          bookingId={activeInvoiceBookingId}
          onClose={() => setActiveInvoiceBookingId(null)}
        />
      )}
    </div>
  );
}