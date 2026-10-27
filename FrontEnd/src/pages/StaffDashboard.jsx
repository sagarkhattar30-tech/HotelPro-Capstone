import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { KeyIcon, CloseIcon } from '../components/Icons';

// Module-level key generator — kept outside component to avoid impurity lint error
const generateStaffKey = (roomNumber) => {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `AZ-${roomNumber}-${code}`;
};

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'housekeeping' | 'services'
  const [stats, setStats] = useState({
    totalRooms: 8,
    availableRooms: 7,
    occupiedRooms: 1,
    cleaningRooms: 0,
    maintenanceRooms: 0,
    checkInsToday: 2,
    checkOutsToday: 1,
    pendingServices: 2
  });

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);

  // Check-Out Modal State
  const [checkoutModalBooking, setCheckoutModalBooking] = useState(null);
  const [inspectionNotes, setInspectionNotes] = useState('Room inspected: Pristine condition. Mini-bar replenished.');
  const [extraCharges, setExtraCharges] = useState('0');

  const fetchStaffData = useCallback(async () => {
    try {
      const [statsRes, bookingsRes, roomsRes, servicesRes] = await Promise.all([
        axiosClient.get('/api/staff/stats').catch(() => ({ data: {} })),
        axiosClient.get('/api/bookings').catch(() => ({ data: [] })),
        axiosClient.get('/api/staff/rooms/status').catch(() => ({ data: [] })),
        axiosClient.get('/api/staff/services').catch(() => ({ data: [] }))
      ]);

      if (statsRes.data && Object.keys(statsRes.data).length > 0) setStats(statsRes.data);
      if (Array.isArray(bookingsRes.data)) setBookings(bookingsRes.data);
      if (Array.isArray(roomsRes.data)) setRooms(roomsRes.data);
      if (Array.isArray(servicesRes.data)) setServices(servicesRes.data);
    } catch (error) {
      console.error('Error loading staff dashboard:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [statsRes, bookingsRes, roomsRes, servicesRes] = await Promise.all([
          axiosClient.get('/api/staff/stats').catch(() => ({ data: {} })),
          axiosClient.get('/api/bookings').catch(() => ({ data: [] })),
          axiosClient.get('/api/staff/rooms/status').catch(() => ({ data: [] })),
          axiosClient.get('/api/staff/services').catch(() => ({ data: [] }))
        ]);
        if (!active) return;
        if (statsRes.data && Object.keys(statsRes.data).length > 0) setStats(statsRes.data);
        if (Array.isArray(bookingsRes.data)) setBookings(bookingsRes.data);
        if (Array.isArray(roomsRes.data)) setRooms(roomsRes.data);
        if (Array.isArray(servicesRes.data)) setServices(servicesRes.data);
      } catch (error) {
        console.error('Error loading staff dashboard:', error);
      }
    })();
    return () => { active = false; };
  }, []);

  // Check-In Action
  const handleCheckIn = async (booking) => {
    try {
      const key = generateStaffKey(booking.roomNumber);
      const res = await axiosClient.post('/api/staff/checkin', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        staffName: 'Duty Concierge Desk',
        keyCardCode: key
      });

      alert(`✅ ${res.data.message}\nKeycard Issued: ${key}`);
      fetchStaffData();
    } catch {
      alert('Check-in failed. Please retry.');
    }
  };

  // Check-Out Execution
  const handleConfirmCheckOut = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/api/staff/checkout', {
        bookingId: checkoutModalBooking._id,
        bookingNumber: checkoutModalBooking.bookingNumber,
        inspectionNotes,
        extraCharges: Number(extraCharges),
        staffName: 'Front Office Supervisor'
      });

      alert(res.data.message);
      setCheckoutModalBooking(null);
      fetchStaffData();
    } catch {
      alert('Check-out failed.');
    }
  };

  // Update Room Housekeeping Status
  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    setRooms((prev) =>
      prev.map((r) => (r._id === roomId || r.roomNumber === roomId ? { ...r, status: newStatus } : r))
    );
    try {
      const res = await axiosClient.put(`/api/staff/rooms/${roomId}/status`, { status: newStatus });
      fetchStaffData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update room status.');
      fetchStaffData();
    }
  };

  // Update Service Request Status
  const handleUpdateService = async (serviceId, newStatus) => {
    try {
      await axiosClient.put(`/api/staff/services/${serviceId}`, {
        status: newStatus,
        assignedStaff: 'Marcus Sterling (Concierge)'
      });
      fetchStaffData();
    } catch {
      alert('Failed to update service ticket.');
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c5a059' }}>
            Hospitality Operations
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', margin: '4px 0' }}>Staff &amp; Front Desk Portal</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Real-time guest check-in desk, digital keycards, housekeeping turnover, and concierge requests.
          </p>
        </div>

        <button onClick={fetchStaffData} className="btn-dark" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          &#8635; Refresh Live Feeds
        </button>
      </div>

      {/* Operational Metric KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Occupied Rooms</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e40af', margin: '4px 0' }}>{stats.occupiedRooms}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Of {stats.totalRooms} Total Suites</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Available Ready</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065f46', margin: '4px 0' }}>{stats.availableRooms}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Ready for check-in</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Housekeeping</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#b45309', margin: '4px 0' }}>{stats.cleaningRooms}</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600' }}>Turnover in progress</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Pending Service Requests</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#e11d48', margin: '4px 0' }}>{stats.pendingServices}</div>
          <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>Active guest tickets</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Today's Check-ins</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>{stats.checkInsToday}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Scheduled arrivals</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('checkin')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.9rem',
            background: activeTab === 'checkin' ? '#0f172a' : '#ffffff',
            color: activeTab === 'checkin' ? '#dfb76c' : '#475569',
            border: activeTab === 'checkin' ? '1px solid #0f172a' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'checkin' ? '0 4px 14px rgba(15,23,42,0.18)' : 'none'
          }}
        >
          🛎️ Check-In &amp; Check-Out Desk
        </button>

        <button
          onClick={() => setActiveTab('housekeeping')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.9rem',
            background: activeTab === 'housekeeping' ? '#0f172a' : '#ffffff',
            color: activeTab === 'housekeeping' ? '#dfb76c' : '#475569',
            border: activeTab === 'housekeeping' ? '1px solid #0f172a' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'housekeeping' ? '0 4px 14px rgba(15,23,42,0.18)' : 'none'
          }}
        >
          🧹 Housekeeping &amp; Room Status Board
        </button>

        <button
          onClick={() => setActiveTab('services')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.9rem',
            background: activeTab === 'services' ? '#0f172a' : '#ffffff',
            color: activeTab === 'services' ? '#dfb76c' : '#475569',
            border: activeTab === 'services' ? '1px solid #0f172a' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'services' ? '0 4px 14px rgba(15,23,42,0.18)' : 'none'
          }}
        >
          🍽️ In-Stay Concierge &amp; Service Tickets ({services.filter((s) => s.status !== 'Completed').length})
        </button>
      </div>

      {/* Tab 1: Check-In & Check-Out Desk */}
      {activeTab === 'checkin' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Active Guest Reservations &amp; Arrivals</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {bookings.length} total hotel reservations</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Ref / Room</th>
                  <th style={{ padding: '14px 20px' }}>Guest Details</th>
                  <th style={{ padding: '14px 20px' }}>Dates &amp; Nights</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Front Desk Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{b.roomName}</strong>
                      <span style={{ color: '#c5a059', fontWeight: '700', fontSize: '0.8rem' }}>Room #{b.roomNumber}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>{b.bookingNumber}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <strong style={{ color: '#0f172a' }}>{b.userName}</strong>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{b.userEmail}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{b.userPhone || '+1 (555) 019-2834'}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div>{new Date(b.checkInDate).toLocaleDateString()} &rarr; {new Date(b.checkOutDate).toLocaleDateString()}</div>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{b.nights} nights &bull; {b.guestsCount} guests</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        className={`badge ${
                          b.status === 'Confirmed'
                            ? 'badge-available'
                            : b.status === 'Checked-In'
                            ? 'badge-occupied'
                            : b.status === 'Checked-Out'
                            ? 'badge-cleaning'
                            : 'badge-maintenance'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => handleCheckIn(b)}
                          className="btn-gold"
                          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                          <KeyIcon size={14} /> Check-In Guest
                        </button>
                      )}

                      {b.status === 'Checked-In' && (
                        <button
                          onClick={() => setCheckoutModalBooking(b)}
                          className="btn-dark"
                          style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#f87171' }}
                        >
                          Process Check-Out &rarr;
                        </button>
                      )}

                      {b.status === 'Checked-Out' && (
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}>Stay Completed</span>
                      )}

                      {b.status === 'Cancelled' && (
                        <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700' }}>Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Housekeeping & Room Status Board */}
      {activeTab === 'housekeeping' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {rooms.map((room) => {
              const statusBadge =
                room.status === 'Available'
                  ? 'badge-available'
                  : room.status === 'Occupied'
                  ? 'badge-occupied'
                  : room.status === 'Cleaning'
                  ? 'badge-cleaning'
                  : 'badge-maintenance';

              return (
                <div
                  key={room._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                        Room #{room.roomNumber}
                      </span>
                      <span className={`badge ${statusBadge}`}>{room.status}</span>
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#0f172a' }}>{room.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                      {room.type} &bull; Floor {room.floor} &bull; {room.capacity} Guests Max
                    </p>
                  </div>

                  <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                      Change Housekeeping Status
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdateRoomStatus(room._id, 'Available')}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: room.status === 'Available' ? '#10b981' : '#f1f5f9',
                          color: room.status === 'Available' ? '#ffffff' : '#334155'
                        }}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => handleUpdateRoomStatus(room._id, 'Cleaning')}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: room.status === 'Cleaning' ? '#f59e0b' : '#f1f5f9',
                          color: room.status === 'Cleaning' ? '#ffffff' : '#334155'
                        }}
                      >
                        Cleaning
                      </button>
                      <button
                        onClick={() => handleUpdateRoomStatus(room._id, 'Occupied')}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: room.status === 'Occupied' ? '#3b82f6' : '#f1f5f9',
                          color: room.status === 'Occupied' ? '#ffffff' : '#334155'
                        }}
                      >
                        Occupied
                      </button>
                      <button
                        onClick={() => handleUpdateRoomStatus(room._id, 'Maintenance')}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: room.status === 'Maintenance' ? '#ef4444' : '#f1f5f9',
                          color: room.status === 'Maintenance' ? '#ffffff' : '#334155'
                        }}
                      >
                        Maintenance
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: In-Stay Concierge & Service Tickets */}
      {activeTab === 'services' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Live Service &amp; Maintenance Requests</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Room / Guest</th>
                  <th style={{ padding: '14px 20px' }}>Service Type</th>
                  <th style={{ padding: '14px 20px' }}>Request Details</th>
                  <th style={{ padding: '14px 20px' }}>Priority</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Workflow Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => {
                  const priorityColor = s.priority === 'Urgent' ? '#ef4444' : s.priority === 'Medium' ? '#f59e0b' : '#3b82f6';

                  return (
                    <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ color: '#0f172a', fontSize: '1rem' }}>Room #{s.roomNumber}</strong>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{s.guestName}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', color: '#334155' }}>
                          {s.serviceType}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#0f172a', lineHeight: '1.4' }}>{s.details}</p>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          Requested: {new Date(s.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ color: priorityColor, fontWeight: '800', fontSize: '0.8rem' }}>
                          &bull; {s.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          className={`badge ${
                            s.status === 'Completed'
                              ? 'badge-available'
                              : s.status === 'In Progress'
                              ? 'badge-occupied'
                              : 'badge-cleaning'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {s.status === 'Requested' && (
                          <button
                            onClick={() => handleUpdateService(s._id, 'In Progress')}
                            className="btn-gold"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            Accept &amp; Begin
                          </button>
                        )}

                        {s.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateService(s._id, 'Completed')}
                            className="btn-success"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            Mark Completed
                          </button>
                        )}

                        {s.status === 'Completed' && (
                          <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.8rem' }}>Resolved</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Check-Out Inspection Modal */}
      {checkoutModalBooking && (
        <div className="modal-overlay" onClick={() => setCheckoutModalBooking(null)}>
          <div className="modal-content" style={{ padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
                Check-Out Inspection &bull; Room #{checkoutModalBooking.roomNumber}
              </h3>
              <button onClick={() => setCheckoutModalBooking(null)} style={{ background: '#f1f5f9', borderRadius: '50%', width: '30px', height: '30px' }}>
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckOut}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div><strong>Guest:</strong> {checkoutModalBooking.userName} ({checkoutModalBooking.userEmail})</div>
                <div><strong>Reservation Ref:</strong> {checkoutModalBooking.bookingNumber}</div>
                <div><strong>Total Paid:</strong> €{checkoutModalBooking.totalPrice}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                  Room Inspection &amp; Turnover Notes
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                  Extra Charges / Mini-Bar / Damages (€)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={extraCharges}
                  onChange={(e) => setExtraCharges(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Complete Guest Check-Out &amp; Queue Turnover
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
