import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import InvoiceModal from '../components/InvoiceModal';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();

  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [retryingPayment, setRetryingPayment] = useState(false);
  const [notice, setNotice] = useState(() => {
    const pNotice = searchParams.get('payment_notice');
    if (pNotice) {
      const reason = searchParams.get('reason');
      return {
        type: reason === 'stripe_pending' || reason === 'config_blocker' ? 'warning' : 'error',
        title: reason === 'stripe_pending' ? 'Stripe Gateway Configuration Notice' : 'Payment Notice',
        message: pNotice,
        isConfigBlocker: reason === 'stripe_pending' || reason === 'config_blocker'
      };
    }
    return null;
  });

  useEffect(() => {
    let isMounted = true;
    if (!bookingId) return;

    axiosClient.get(`/api/bookings/confirmation/${bookingId}`)
      .then((res) => {
        if (isMounted) {
          setConfirmation(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to retrieve reservation details');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [bookingId]);

  const handlePayNow = async () => {
    if (!confirmation?.booking) return;
    const booking = confirmation.booking;

    try {
      setRetryingPayment(true);
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
        message: res.data?.message || 'Stripe Checkout could not be initiated.'
      });
    } catch (err) {
      setNotice({
        type: 'warning',
        title: 'Stripe Gateway Setup Notice',
        message: err.response?.data?.message || 'Stripe payment gateway is ready and awaiting API keys. Please configure STRIPE_SECRET_KEY in Backend/.env, or settle via Pay at Hotel Desk.',
        isConfigBlocker: true
      });
    } finally {
      setRetryingPayment(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald, #0F3A2F)' }}>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem' }}>Verifying reservation details...</p>
      </div>
    );
  }

  if (error || !confirmation?.booking) {
    return (
      <div style={{ minHeight: '70vh', padding: '140px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #FCA5A5', borderRadius: '16px', padding: '40px 24px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#DC2626', margin: '0 0 12px' }}>Reservation Not Located</h2>
          <p style={{ color: 'var(--text-muted, #5C6764)', margin: '0 0 24px' }}>{error || 'The requested booking could not be located.'}</p>
          <Link to="/my-bookings" className="btn-emerald" style={{ textDecoration: 'none', padding: '12px 28px' }}>
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const { booking, payment, confirmationState } = confirmation;
  const isPaid = confirmationState?.isPaid || booking.paymentStatus === 'Paid';
  const isPending = confirmationState?.isPending || booking.paymentStatus === 'Pending';
  const isCancelled = confirmationState?.isCancelled || booking.status === 'Cancelled';
  const isPayAtDesk = booking.paymentMethod === 'Pay at Hotel Desk';
  const hotelName = booking.hotelName || 'The Grand Heritage Palace & Spa';
  const displayImage = booking.hotelImage || booking.roomImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop';
  const inrTotal = Math.round((booking.totalPrice || 0) * 83).toLocaleString('en-IN');

  return (
    <div style={{ minHeight: '80vh', padding: '120px 24px 80px', maxWidth: '920px', margin: '0 auto' }}>
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/my-bookings"
          style={{
            color: 'var(--emerald, #0F3A2F)',
            fontWeight: 600,
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          &larr; Back to My Reservations
        </Link>
      </div>

      {/* Professional Notice / Blocker Banner */}
      {notice && (
        <div
          style={{
            marginBottom: '20px',
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
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: notice.type === 'error' ? '#991B1B' : '#B45309' }}>
              {notice.title}
            </div>
            <div style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-line', marginBottom: notice.isConfigBlocker ? '12px' : '0' }}>
              {notice.message}
            </div>

            {notice.isConfigBlocker && (
              <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(217, 119, 6, 0.25)', fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.6 }}>
                <strong style={{ color: '#92400E', display: 'block', marginBottom: '6px' }}>
                  🔑 How to connect Stripe Payment Gateway:
                </strong>
                <ol style={{ margin: '0 0 8px 18px', padding: 0 }}>
                  <li>Get your Stripe Secret Key (<code>sk_test_...</code>) from your Stripe Dashboard &rarr; Developers &rarr; API Keys.</li>
                  <li>Add <code>STRIPE_SECRET_KEY=sk_test_...</code> to <code>Backend/.env</code>.</li>
                </ol>
                <div style={{ color: '#0F3A2F', fontWeight: 600 }}>
                  ✓ In the meantime, this booking #{booking?.bookingNumber} is held safely as <em>Payment Pending</em>. You can settle payment at check-in via <em>Pay at Hotel Desk</em>.
                </div>
              </div>
            )}
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

      {/* Main Confirmation Card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-color, #E8DFD1)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 16px 50px rgba(15, 58, 47, 0.08)'
        }}
      >
        {/* Banner based on status */}
        {isPaid ? (
          <div style={{ background: 'linear-gradient(135deg, #0F3A2F, #1E5C4B)', padding: '24px 32px', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>✓</span> Reservation Confirmed & Payment Verified
            </div>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Transaction ID: {booking.transactionId || payment?.transactionId || 'Verified'} &bull; Paid via {booking.paymentMethod}
            </p>
          </div>
        ) : isCancelled ? (
          <div style={{ background: 'linear-gradient(135deg, #991B1B, #B91C1C)', padding: '24px 32px', color: '#FFFFFF' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reservation Cancelled</div>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Reason: {booking.cancellationReason || 'Guest cancellation'}
            </p>
          </div>
        ) : isPayAtDesk ? (
          <div style={{ background: 'linear-gradient(135deg, #854D0E, #A16207)', padding: '24px 32px', color: '#FFFFFF' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reservation Held &bull; Pay at Hotel Desk</div>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Payment status is Unpaid. Full amount will be settled at front desk during arrival check-in.
            </p>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(135deg, #C15336, #D97706)', padding: '24px 32px', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Payment Pending Verification</div>
                <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                  Complete payment via Stripe (€ EUR Checkout) to confirm your palace residence.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePayNow}
                disabled={retryingPayment}
                className="btn-gold"
                style={{ padding: '10px 22px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                {retryingPayment ? 'Connecting Stripe...' : 'Pay with Stripe (€ EUR)'}
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '36px' }}>
          {/* Hotel & Room Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px', marginBottom: '32px', alignItems: 'center' }}>
            <img
              src={displayImage}
              alt={booking.roomName}
              style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-color, #E8DFD1)' }}
            />
            <div>
              <p style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--terracotta, #C15336)', textTransform: 'uppercase', fontWeight: 700 }}>
                {hotelName}
              </p>
              <h2 style={{ margin: '4px 0 6px', fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--emerald, #0F3A2F)', fontWeight: 600 }}>
                {booking.roomName}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted, #5C6764)', fontSize: '0.88rem' }}>
                Suite #{booking.roomNumber} &bull; Confirmation #{booking.bookingNumber}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {/* Stay Itinerary */}
            <div style={{ background: 'var(--warm-ivory, #FAF7F2)', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '12px', padding: '22px' }}>
              <h4 style={{ margin: '0 0 14px', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--emerald, #0F3A2F)', textTransform: 'uppercase' }}>
                Stay Schedule
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted, #5C6764)' }}>Check-In:</span>
                  <strong style={{ color: 'var(--emerald, #0F3A2F)' }}>{formatDate(booking.checkInDate)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted, #5C6764)' }}>Check-Out:</span>
                  <strong style={{ color: 'var(--emerald, #0F3A2F)' }}>{formatDate(booking.checkOutDate)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted, #5C6764)' }}>Duration:</span>
                  <strong style={{ color: 'var(--emerald, #0F3A2F)' }}>{booking.nights} night{booking.nights > 1 ? 's' : ''}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted, #5C6764)' }}>Guests:</span>
                  <strong style={{ color: 'var(--emerald, #0F3A2F)' }}>{booking.guestsCount} Guest{booking.guestsCount > 1 ? 's' : ''}</strong>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div style={{ background: 'var(--warm-ivory, #FAF7F2)', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '12px', padding: '22px' }}>
              <h4 style={{ margin: '0 0 14px', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--emerald, #0F3A2F)', textTransform: 'uppercase' }}>
                Guest Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted, #5C6764)' }}>Primary Guest:</span>
                  <strong style={{ color: 'var(--emerald, #0F3A2F)' }}>{booking.userName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted, #5C6764)' }}>Email:</span>
                  <strong style={{ color: 'var(--emerald, #0F3A2F)' }}>{booking.userEmail}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted, #5C6764)' }}>Phone:</span>
                  <strong style={{ color: 'var(--emerald, #0F3A2F)' }}>{booking.userPhone || 'Not provided'}</strong>
                </div>
                {booking.specialRequests && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted, #5C6764)' }}>Requests:</span>
                    <strong style={{ color: 'var(--emerald, #0F3A2F)' }}>{booking.specialRequests}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Ledger */}
          <div style={{ background: 'rgba(15, 58, 47, 0.04)', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '14px', padding: '22px', marginBottom: '32px' }}>
            <h4 style={{ margin: '0 0 14px', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--emerald, #0F3A2F)', textTransform: 'uppercase' }}>
              Tariff & Payment Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #384541)' }}>
                <span>Rate per night ({booking.nights} night{booking.nights > 1 ? 's' : ''}):</span>
                <span>₹{Math.round(booking.pricePerNight * booking.nights * 83).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #384541)' }}>
                <span>Hospitality Luxury Tax (12%):</span>
                <span>₹{Math.round(booking.pricePerNight * booking.nights * 0.12 * 83).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, borderTop: '1px solid var(--border-color, #E8DFD1)', paddingTop: '10px', marginTop: '6px' }}>
                <span style={{ color: 'var(--emerald, #0F3A2F)' }}>Total Amount:</span>
                <span style={{ color: 'var(--emerald, #0F3A2F)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  ₹{inrTotal}
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold, #B89047)', fontWeight: 600 }}>
                    Stripe Gateway Equivalent: €{(Math.round(booking.totalPrice * 83) / 110).toFixed(2)} (€1 ≈ ₹110)
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted, #5C6764)', marginTop: '4px' }}>
                <span>Payment Status:</span>
                <span style={{ fontWeight: 700, color: isPaid ? '#15803D' : isPending ? '#C15336' : '#DC2626' }}>
                  {isPaid ? 'Paid in Full' : isPending ? (isPayAtDesk ? 'Unpaid (Pay at Desk)' : 'Pending Verification') : 'Cancelled'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/my-bookings" className="btn-emerald" style={{ padding: '12px 24px', textDecoration: 'none', fontSize: '0.85rem' }}>
                View All My Bookings
              </Link>
              <button
                type="button"
                onClick={() => setShowInvoice(true)}
                className="btn-outline"
                style={{
                  padding: '12px 20px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Tax Invoice Statement
              </button>
            </div>
            <Link to="/rooms" style={{ color: 'var(--emerald, #0F3A2F)', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
              Explore Additional Suites &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <InvoiceModal
          bookingId={booking._id}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}
