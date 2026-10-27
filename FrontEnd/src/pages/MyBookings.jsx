import { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import InvoiceModal from '../components/InvoiceModal';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoiceBookingId, setSelectedInvoiceBookingId] = useState(null);
  const [retryingBookingId, setRetryingBookingId] = useState(null);
  const [verifyingBookingId, setVerifyingBookingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const location = useLocation();

  // Check URL search params for payment outcome
  const searchParams = new URLSearchParams(location.search);
  const paymentSuccess = searchParams.get('payment') === 'success';
  const stripeSuccess = searchParams.get('stripe') === 'success';
  const successBookingId = searchParams.get('bookingId');
  const stripeSessionId = searchParams.get('session_id');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axiosClient.get('/api/bookings/my-bookings');
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Unable to load your reservations. Please refresh or sign in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadReservations = async () => {
      try {
        if (stripeSuccess && successBookingId) {
          try {
            await axiosClient.post('/api/payments/stripe/verify', {
              bookingId: successBookingId,
              sessionId: stripeSessionId
            });
            if (isMounted) {
              setNotice({
                type: 'success',
                title: 'Payment Confirmed',
                message: 'Your payment via Stripe in Euros (€) has been successfully verified and your royal reservation is confirmed.'
              });
              // Clean URL query parameters once verified
              window.history.replaceState({}, '', window.location.pathname);
            }
          } catch (verifyErr) {
            console.warn('Stripe verification check:', verifyErr?.response?.data || verifyErr.message);
          }
        }

        const res = await axiosClient.get('/api/bookings/my-bookings');
        if (isMounted) {
          setBookings(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching bookings:', err);
          setError('Unable to load your reservations. Please refresh or sign in again.');
          setLoading(false);
        }
      }
    };

    loadReservations();

    return () => { isMounted = false; };
  }, [stripeSuccess, successBookingId, stripeSessionId]);

  const handleVerifyBooking = async (bookingId, sessionId) => {
    try {
      setVerifyingBookingId(bookingId);
      setNotice(null);
      const res = await axiosClient.post('/api/payments/stripe/verify', {
        bookingId,
        sessionId
      });
      setNotice({
        type: 'success',
        title: 'Payment Confirmed',
        message: res.data?.message || 'Your payment has been successfully verified and confirmed.'
      });
      await fetchBookings();
    } catch (err) {
      setNotice({
        type: 'warning',
        title: 'Verification Notice',
        message: err.response?.data?.message || 'Payment verification could not be confirmed. If you just paid on Stripe, please wait a moment and try again.'
      });
      await fetchBookings();
    } finally {
      setVerifyingBookingId(null);
    }
  };

  const handlePayNow = async (booking) => {
    try {
      setRetryingBookingId(booking._id);
      setNotice(null);
      const res = await axiosClient.post('/api/payments/checkout', {
        bookingId: booking._id
      });

      if (res.data?.checkoutUrl) {
        window.location.assign(res.data.checkoutUrl);
        return;
      }

      setNotice({
        type: 'warning',
        title: 'Stripe Gateway Notice',
        message: res.data?.message || 'Stripe Checkout could not be started.'
      });
    } catch (err) {
      setNotice({
        type: 'warning',
        title: 'Stripe Gateway Setup Notice',
        message: err.response?.data?.message || 'Stripe payment gateway is ready and awaiting API keys. Please configure STRIPE_SECRET_KEY in Backend/.env, or settle via Pay at Hotel Desk.'
      });
    } finally {
      setRetryingBookingId(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you wish to cancel this royal reservation?')) return;
    try {
      await axiosClient.post(`/api/bookings/${bookingId}/cancel`, {
        reason: 'Guest self-service cancellation'
      });
      fetchBookings();
    } catch (err) {
      setNotice({
        type: 'error',
        title: 'Cancellation Error',
        message: err.response?.data?.message || 'Could not cancel booking.'
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '120px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '36px', borderBottom: '1px solid var(--border-color, #E8DFD1)', paddingBottom: '24px' }}>
        <p style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--terracotta, #C15336)', textTransform: 'uppercase', fontWeight: 700 }}>
          Guest Portfolio &bull; अतिथि देवो भव
        </p>
        <h1 style={{ margin: '8px 0 0', fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', color: 'var(--emerald, #0F3A2F)', fontWeight: 600 }}>
          My Royal Reservations
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-muted, #5C6764)', fontSize: '0.95rem' }}>
          Review and manage your confirmed palace stays, pending online payments, and tax invoices.
        </p>
      </div>

      {/* Success Notification Banner */}
      {paymentSuccess && (
        <div
          style={{
            background: 'rgba(15, 58, 47, 0.08)',
            border: '1px solid var(--emerald, #0F3A2F)',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald, #0F3A2F)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
              <span>✓</span> Payment Successful &bull; Shahi Swagat Confirmed!
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary, #384541)', fontSize: '0.9rem' }}>
              Your reservation has been verified and confirmed. A confirmation receipt has been dispatched to your email.
            </p>
          </div>
          {successBookingId && (
            <Link
              to={`/booking-confirmation/${successBookingId}`}
              className="btn-emerald"
              style={{ padding: '10px 20px', fontSize: '0.82rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              View Confirmation
            </Link>
          )}
        </div>
      )}

      {/* Professional Notice / Blocker Banner */}
      {notice && (
        <div
          style={{
            marginBottom: '28px',
            padding: '18px 24px',
            borderRadius: '14px',
            background: notice.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(217, 119, 6, 0.08)',
            border: `1px solid ${notice.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`,
            color: notice.type === 'error' ? '#991B1B' : '#92400E',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}
        >
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
              {notice.title}
            </div>
            <div style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-line' }}>
              {notice.message}
            </div>
          </div>
          <button
            onClick={() => setNotice(null)}
            aria-label="Dismiss notice"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.4rem',
              lineHeight: 1,
              cursor: 'pointer',
              color: 'inherit',
              padding: '0 4px',
              opacity: 0.6
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Loading & Error States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--emerald, #0F3A2F)' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem' }}>Loading your royal reservations...</p>
        </div>
      ) : error ? (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '20px', color: '#991B1B', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px' }}>{error}</p>
          <button onClick={fetchBookings} className="btn-emerald" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#FFFFFF',
            border: '1px solid var(--border-color, #E8DFD1)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--emerald, #0F3A2F)', margin: '0 0 10px' }}>
            No Active Reservations
          </h3>
          <p style={{ color: 'var(--text-muted, #5C6764)', margin: '0 0 24px', fontSize: '0.95rem' }}>
            You haven't reserved any royal residences or suites yet.
          </p>
          <Link to="/rooms" className="btn-emerald" style={{ padding: '14px 32px', textDecoration: 'none' }}>
            Explore Palace Suites
          </Link>
        </div>
      ) : (
        /* Booking Listings Grid */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {bookings.map((booking) => {
            const isPaid = booking.paymentStatus === 'Paid';
            const isCancelled = booking.status === 'Cancelled';
            const isPayAtDesk = booking.paymentMethod === 'Pay at Hotel Desk';
            const hotelName = booking.hotelName || 'The Grand Heritage Palace & Spa';
            const displayImage = booking.hotelImage || booking.roomImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop';
            const inrPrice = Math.round((booking.totalPrice || 0) * 83).toLocaleString('en-IN');

            return (
              <div
                key={booking._id}
                style={{
                  background: '#FFFFFF',
                  border: isPaid
                    ? '1.5px solid var(--emerald, #0F3A2F)'
                    : '1px solid var(--border-color, #E8DFD1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '280px 1fr',
                  boxShadow: '0 8px 30px rgba(15, 58, 47, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Image Column */}
                <div style={{ position: 'relative', minHeight: '200px' }}>
                  <img
                    src={displayImage}
                    alt={booking.roomName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(15, 58, 47, 0.9)',
                      backdropFilter: 'blur(6px)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      color: 'var(--gold, #C5A059)',
                      fontWeight: 600,
                      fontFamily: 'monospace'
                    }}
                  >
                    #{booking.bookingNumber}
                  </div>
                </div>

                {/* Details Column */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Top Row: Hotel Name & Payment Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--terracotta, #C15336)', textTransform: 'uppercase', fontFamily: 'Cinzel, serif', fontWeight: 700 }}>
                          {hotelName}
                        </p>
                        <h3 style={{ margin: '4px 0 0', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: 'var(--emerald, #0F3A2F)', fontWeight: 600 }}>
                          {booking.roomName}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #5C6764)' }}>
                          Suite #{booking.roomNumber} &bull; {booking.guestsCount} Guest{booking.guestsCount > 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        {isPaid ? (
                          <span
                            style={{
                              background: 'rgba(15, 58, 47, 0.1)',
                              border: '1px solid var(--emerald, #0F3A2F)',
                              color: 'var(--emerald, #0F3A2F)',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            ✓ Payment Successful
                          </span>
                        ) : isCancelled ? (
                          <span
                            style={{
                              background: '#FEE2E2',
                              border: '1px solid #FCA5A5',
                              color: '#DC2626',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            Cancelled
                          </span>
                        ) : isPayAtDesk ? (
                          <span
                            style={{
                              background: '#FEFCE8',
                              border: '1px solid #FEF08A',
                              color: '#854D0E',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            Pay at Hotel Desk (Unpaid)
                          </span>
                        ) : (
                          <span
                            style={{
                              background: 'rgba(193, 83, 54, 0.1)',
                              border: '1px solid var(--terracotta, #C15336)',
                              color: 'var(--terracotta, #C15336)',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            Payment Pending
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #5C6764)' }}>
                          Method: {booking.paymentMethod || 'Online'}
                        </span>
                      </div>
                    </div>

                    {/* Stay Duration & Dates */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        background: 'var(--warm-ivory, #FAF7F2)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        margin: '14px 0',
                        border: '1px solid var(--border-color, #E8DFD1)'
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted, #5C6764)' }}>Check-In</span>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--emerald, #0F3A2F)' }}>{formatDate(booking.checkInDate)}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted, #5C6764)' }}>Check-Out</span>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--emerald, #0F3A2F)' }}>{formatDate(booking.checkOutDate)}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted, #5C6764)' }}>Total Tariff</span>
                        <strong style={{ fontSize: '1rem', color: 'var(--emerald, #0F3A2F)' }}>₹{inrPrice}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link
                        to={`/booking-confirmation/${booking._id}`}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid var(--border-color, #E8DFD1)',
                          color: 'var(--emerald, #0F3A2F)',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Confirmation Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceBookingId(booking._id)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid var(--border-color, #E8DFD1)',
                          color: 'var(--text-muted, #5C6764)',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Tax Invoice
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {!isPaid && !isCancelled && !isPayAtDesk && (
                        <>
                          {booking.stripeSessionId && (
                            <button
                              type="button"
                              onClick={() => handleVerifyBooking(booking._id, booking.stripeSessionId)}
                              disabled={verifyingBookingId === booking._id}
                              style={{
                                background: '#FEF3C7',
                                border: '1px solid #F59E0B',
                                color: '#92400E',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {verifyingBookingId === booking._id ? 'Verifying...' : 'Verify Payment'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePayNow(booking)}
                            disabled={retryingBookingId === booking._id}
                            className="btn-emerald"
                            style={{ padding: '8px 18px', fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            {retryingBookingId === booking._id ? 'Opening Stripe...' : 'Pay with Stripe (€ EUR)'}
                          </button>
                        </>
                      )}

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking._id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#DC2626',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            padding: '6px 10px'
                          }}
                        >
                          Cancel Stay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceBookingId && (
        <InvoiceModal
          bookingId={selectedInvoiceBookingId}
          onClose={() => setSelectedInvoiceBookingId(null)}
        />
      )}
    </div>
  );
}
