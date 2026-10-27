import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { CrownIcon, StarIcon, PrinterIcon, SparklesIcon, CloseIcon } from '../components/Icons';
import InvoiceModal from '../components/InvoiceModal';

export default function GuestDashboard() {
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return { name: '', email: '', role: '', phone: '', membershipTier: 'Gold Elite' }; }
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Actions
  const [activeInvoiceBookingId, setActiveInvoiceBookingId] = useState(null);
  const [activeServiceBooking, setActiveServiceBooking] = useState(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);

  // Service Request Form State
  const [serviceType, setServiceType] = useState('Room Service Food');
  const [serviceDetails, setServiceDetails] = useState('');
  const [servicePriority, setServicePriority] = useState('Medium');
  const [serviceSuccess, setServiceSuccess] = useState('');

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const loadBookings = useCallback((email) => {
    axiosClient
      .get(`/api/bookings/user/${encodeURIComponent(email)}`)
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(() => {
        console.error('Error fetching bookings');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user.email) {
      loadBookings(user.email);
    }
  }, [loadBookings, user.email]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation and request a full refund?')) return;
    try {
      await axiosClient.post(`/api/bookings/${bookingId}/cancel`, {
        reason: 'Guest self-service cancellation'
      });
      alert('Reservation cancelled and refund processed successfully.');
      loadBookings(user.email);
    } catch {
      alert('Failed to cancel reservation.');
    }
  };

  const handleCreateServiceRequest = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/staff/services', {
        guestName: user.name,
        guestEmail: user.email,
        roomNumber: activeServiceBooking.roomNumber || '101',
        serviceType,
        details: serviceDetails,
        priority: servicePriority
      });
      setServiceSuccess('Service ticket submitted to concierge desk!');
      setTimeout(() => {
        setServiceSuccess('');
        setActiveServiceBooking(null);
        setServiceDetails('');
      }, 1500);
    } catch {
      alert('Failed to submit request.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/api/reviews', {
        roomId: activeReviewBooking.roomId,
        roomName: activeReviewBooking.roomName,
        userEmail: user.email,
        userName: user.name,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess('Thank you! Your verified review has been published.');
      setTimeout(() => {
        setReviewSuccess('');
        setActiveReviewBooking(null);
        setReviewComment('');
      }, 1500);
    } catch {
      alert('Failed to submit review.');
    }
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c5a059' }}>
            Guest Portal
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', margin: '4px 0' }}>
            Welcome back, {user.name || 'Valued Guest'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Manage your bespoke reservations, digital invoices, and in-residence concierge requests.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(197, 160, 89, 0.12)', border: '1px solid rgba(197, 160, 89, 0.3)', padding: '10px 18px', borderRadius: '12px' }}>
          <CrownIcon size={22} color="#c5a059" />
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Membership Tier</div>
            <div style={{ fontWeight: '800', color: '#9e7930', fontSize: '0.95rem' }}>{user.membershipTier || 'Gold Elite'} Member</div>
          </div>
        </div>
      </div>

      {/* Guest Profile Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px 30px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Primary Email</span>
          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '4px' }}>{user.email}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Contact Phone</span>
          <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '4px' }}>{user.phone || '+1 (555) 900-5566'}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>Total Stays</span>
          <div style={{ fontWeight: '800', color: '#c5a059', fontSize: '1.2rem', marginTop: '2px' }}>{bookings.length} Completed / Active</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800' }}>VIP Privileges</span>
          <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700', marginTop: '4px' }}>Complimentary Spa &amp; Valet</div>
        </div>
      </div>

      {/* Reservations List */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '18px' }}>My Reservations</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading your reservations...</div>
        ) : bookings.length === 0 ? (
          <div style={{ background: '#ffffff', padding: '50px 30px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '8px' }}>No reservations yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px' }}>You haven't booked any luxury suites or villas yet.</p>
            <a href="/rooms" className="btn-gold">Browse Available Residences</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bookings.map((booking) => {
              const statusBadge =
                booking.status === 'Confirmed'
                  ? 'badge-available'
                  : booking.status === 'Checked-In'
                  ? 'badge-occupied'
                  : booking.status === 'Checked-Out'
                  ? 'badge-cleaning'
                  : 'badge-maintenance';

              return (
                <div
                  key={booking._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'var(--shadow-card)',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr auto',
                    gap: '24px',
                    alignItems: 'center',
                    padding: '20px'
                  }}
                >
                  {/* Room Thumbnail */}
                  <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden' }}>
                    <img
                      src={booking.roomImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop'}
                      alt={booking.roomName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Booking Details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className={`badge ${statusBadge}`}>{booking.status}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c5a059', letterSpacing: '0.04em' }}>
                        Ref: {booking.bookingNumber}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', color: '#0f172a', margin: '4px 0 8px 0' }}>
                      {booking.roomName}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                      <strong>Dates:</strong> {new Date(booking.checkInDate).toLocaleDateString()} &rarr; {new Date(booking.checkOutDate).toLocaleDateString()} ({booking.nights} Nights)
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                      Room #{booking.roomNumber} &bull; {booking.guestsCount} Guests &bull; Paid via {booking.paymentMethod}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>${booking.totalPrice}</div>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>Payment {booking.paymentStatus}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* View Invoice */}
                      <button
                        onClick={() => setActiveInvoiceBookingId(booking._id)}
                        className="btn-outline-gold"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <PrinterIcon size={14} /> Tax Invoice
                      </button>

                      {/* Request In-Stay Service */}
                      {booking.status === 'Checked-In' && (
                        <button
                          onClick={() => setActiveServiceBooking(booking)}
                          className="btn-gold"
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          <SparklesIcon size={14} /> Request Service
                        </button>
                      )}

                      {/* Write Review */}
                      {booking.status === 'Checked-Out' && (
                        <button
                          onClick={() => setActiveReviewBooking(booking)}
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}
                        >
                          <StarIcon size={14} color="#d97706" /> Write Review
                        </button>
                      )}

                      {/* Cancel Booking */}
                      {booking.status === 'Confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          style={{ background: 'transparent', color: '#ef4444', border: 'none', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'underline' }}
                        >
                          Cancel &amp; Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {activeInvoiceBookingId && (
        <InvoiceModal
          bookingId={activeInvoiceBookingId}
          onClose={() => setActiveInvoiceBookingId(null)}
        />
      )}

      {/* Service Request Modal */}
      {activeServiceBooking && (
        <div className="modal-overlay" onClick={() => setActiveServiceBooking(null)}>
          <div className="modal-content" style={{ padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
                Request Concierge Service &bull; Room #{activeServiceBooking.roomNumber}
              </h3>
              <button onClick={() => setActiveServiceBooking(null)} style={{ background: '#f1f5f9', borderRadius: '50%', width: '30px', height: '30px' }}>
                <CloseIcon size={16} />
              </button>
            </div>

            {serviceSuccess ? (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: '700' }}>
                {serviceSuccess}
              </div>
            ) : (
              <form onSubmit={handleCreateServiceRequest}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                    Service Category
                  </label>
                  <select className="form-select" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                    <option value="Room Service Food">Room Service &bull; Food &amp; Beverages</option>
                    <option value="Housekeeping">Housekeeping &bull; Extra Towels / Linen</option>
                    <option value="Maintenance">Maintenance &bull; Climate / Electronics</option>
                    <option value="Luggage Assistance">Luggage &amp; Bellhop Assistance</option>
                    <option value="Concierge & Transport">Concierge &amp; Private Transport</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                    Priority Level
                  </label>
                  <select className="form-select" value={servicePriority} onChange={(e) => setServicePriority(e.target.value)}>
                    <option value="Low">Standard (Within 45 mins)</option>
                    <option value="Medium">Medium (Within 20 mins)</option>
                    <option value="Urgent">Urgent Priority (Immediate)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                    Specific Instructions
                  </label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={serviceDetails}
                    onChange={(e) => setServiceDetails(e.target.value)}
                    placeholder="e.g. Please deliver 2 extra bathrobes, iced champagne bucket, and fruit platter..."
                    required
                  />
                </div>

                <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  Dispatch Request to Concierge
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeReviewBooking && (
        <div className="modal-overlay" onClick={() => setActiveReviewBooking(null)}>
          <div className="modal-content" style={{ padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
                Review Your Stay &bull; {activeReviewBooking.roomName}
              </h3>
              <button onClick={() => setActiveReviewBooking(null)} style={{ background: '#f1f5f9', borderRadius: '50%', width: '30px', height: '30px' }}>
                <CloseIcon size={16} />
              </button>
            </div>

            {reviewSuccess ? (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: '700' }}>
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                    Overall Rating
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: reviewRating >= star ? '#fef3c7' : '#f1f5f9',
                          border: reviewRating >= star ? '1px solid #f59e0b' : '1px solid #cbd5e1',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: '700'
                        }}
                      >
                        <StarIcon size={18} color="#d97706" filled={reviewRating >= star} />
                        <span>{star} Stars</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                    Your Experience &amp; Feedback
                  </label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe the service, suite ambiance, dining, and highlights of your stay..."
                    required
                  />
                </div>

                <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  Publish Verified Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}