import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { CloseIcon, CreditCardIcon, CheckCircleIcon } from './Icons';

export default function BookingPaymentModal({ room, initialCheckIn, initialCheckOut, onClose, onBookingSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [guestName, setGuestName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.name || '';
    } catch {
      return '';
    }
  });

  const [guestEmail, setGuestEmail] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.email || '';
    } catch {
      return '';
    }
  });

  const [guestPhone, setGuestPhone] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.phone || '';
    } catch {
      return '';
    }
  });

  const [checkInDate, setCheckInDate] = useState(() => {
    if (initialCheckIn) return initialCheckIn;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [checkOutDate, setCheckOutDate] = useState(() => {
    if (initialCheckOut) return initialCheckOut;
    const future = new Date();
    future.setDate(future.getDate() + 4);
    return future.toISOString().split('T')[0];
  });

  const [guestsCount, setGuestsCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment Method: Stripe (€ EUR Cards) or Pay at Hotel Desk
  const [paymentMethod, setPaymentMethod] = useState('Stripe');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate nights and totals
  const { nights, subtotal, taxAmount, inrTotal, inrRate, eurTotal } = useMemo(() => {
    const rate = room.pricePerNight || 250;
    if (!checkInDate || !checkOutDate) {
      const sub = rate;
      const tax = Math.round(sub * 0.12);
      const tot = sub + tax;
      const inrTot = Math.round(tot * 83);
      const inrRt = Math.round(rate * 83);
      return {
        nights: 1,
        subtotal: sub,
        taxAmount: tax,
        inrTotal: inrTot,
        inrRate: inrRt,
        eurTotal: (inrTot / 110).toFixed(2),
        eurRate: (inrRt / 110).toFixed(2)
      };
    }
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = end - start;
    const n = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    const sub = n * rate;
    const tax = Math.round(sub * 0.12);
    const tot = sub + tax;
    const inrTot = Math.round(tot * 83);
    const inrRt = Math.round(rate * 83);
    const eurTot = (inrTot / 110).toFixed(2);
    const eurRt = (inrRt / 110).toFixed(2);
    return {
      nights: n,
      subtotal: sub,
      taxAmount: tax,
      inrTotal: inrTot,
      inrRate: inrRt,
      eurTotal: eurTot,
      eurRate: eurRt
    };
  }, [checkInDate, checkOutDate, room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      if (window.confirm('You must be signed in to reserve an Aatithya residence. Would you like to log in now?')) {
        navigate('/login', { state: { from: location } });
      }
      return;
    }

    setSubmitting(true);

    try {
      const res = await axiosClient.post('/api/bookings', {
        userEmail: guestEmail,
        userName: guestName,
        userPhone: guestPhone,
        roomId: room._id,
        roomName: room.name,
        roomNumber: room.roomNumber,
        roomImage: room.image,
        checkInDate,
        checkOutDate,
        guestsCount,
        pricePerNight: room.pricePerNight,
        specialRequests,
        paymentMethod
      });

      const newBooking = res.data.booking;

      // 1. If Stripe Checkout session URL is returned, redirect to Stripe Checkout
      if (res.data.checkoutUrl) {
        window.location.assign(res.data.checkoutUrl);
        return;
      }

      // 2. If Stripe configuration is pending (awaiting user API keys)
      if (res.data.stripeNotice && paymentMethod === 'Stripe') {
        onClose();
        navigate(`/booking-confirmation/${newBooking._id}?payment_notice=${encodeURIComponent(res.data.stripeNotice)}&reason=stripe_pending`);
        return;
      }

      // 3. Pay at Hotel Desk or confirmed reservation
      setConfirmedBooking(newBooking);
      if (onBookingSuccess) onBookingSuccess(newBooking);
      navigate(`/booking-confirmation/${newBooking._id}`);
    } catch (err) {
      console.error('Booking submission error:', err);
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: location } });
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to complete reservation. Please review details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '660px',
          padding: '36px',
          background: 'var(--warm-ivory, #FAF7F2)',
          borderRadius: '20px',
          border: '1px solid var(--border-color, #E8DFD1)',
          boxShadow: '0 24px 60px rgba(15, 58, 47, 0.2)',
          color: 'var(--text-primary, #1A2421)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontFamily: 'Rozha One, serif',
                  fontSize: '1rem',
                  color: 'var(--gold, #C5A059)'
                }}
              >
                आ
              </span>
              <span
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.72rem',
                  letterSpacing: '0.18em',
                  color: 'var(--terracotta, #C15336)',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                Aatithya Royal Reservation
              </span>
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: 'var(--emerald, #0F3A2F)', fontWeight: 600 }}>
              {confirmedBooking ? 'Reservation Confirmed' : `Reserve ${room.name}`}
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #5C6764)', fontSize: '0.88rem' }}>
              {room.type} &bull; Room #{room.roomNumber} &bull; ₹{inrRate.toLocaleString('en-IN')} / night
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-color, #E8DFD1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted, #5C6764)',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmation State */
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                background: 'rgba(15, 58, 47, 0.1)',
                color: 'var(--emerald, #0F3A2F)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto'
              }}
            >
              <CheckCircleIcon size={38} color="var(--emerald, #0F3A2F)" />
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--emerald, #0F3A2F)', margin: '0 0 8px 0' }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: 'var(--text-muted, #5C6764)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
              Dhanyavaad. We are honored to welcome you. An official reservation receipt has been dispatched to <strong>{confirmedBooking.userEmail}</strong>.
            </p>

            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color, #E8DFD1)',
                borderRadius: '14px',
                padding: '22px',
                textAlign: 'left',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted, #5C6764)', fontSize: '0.85rem' }}>Confirmation Code:</span>
                <strong style={{ color: 'var(--emerald, #0F3A2F)', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                  {confirmedBooking.bookingNumber}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted, #5C6764)', fontSize: '0.85rem' }}>Guest:</span>
                <strong>{confirmedBooking.userName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted, #5C6764)', fontSize: '0.85rem' }}>Dates:</span>
                <span>{new Date(confirmedBooking.checkInDate).toLocaleDateString()} &rarr; {new Date(confirmedBooking.checkOutDate).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color, #E8DFD1)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--text-muted, #5C6764)', fontSize: '0.85rem' }}>Total Tariff:</span>
                <strong style={{ color: 'var(--emerald, #0F3A2F)', fontSize: '1.2rem' }}>
                  ₹{Math.round(confirmedBooking.totalPrice * 83).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <button type="button" onClick={onClose} className="btn-emerald" style={{ padding: '14px 32px' }}>
              View in My Bookings
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  fontSize: '0.85rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Dates & Guests */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--emerald, #0F3A2F)', marginBottom: '6px' }}>
                  Check-In
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--emerald, #0F3A2F)', marginBottom: '6px' }}>
                  Check-Out
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--emerald, #0F3A2F)', marginBottom: '6px' }}>
                  Guests
                </label>
                <select
                  className="form-select"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '8px' }}
                >
                  {[...Array(room.capacity || 4)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest Contact Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--emerald, #0F3A2F)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singh"
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--emerald, #0F3A2F)', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="name@domain.com"
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--emerald, #0F3A2F)', marginBottom: '6px' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--emerald, #0F3A2F)', marginBottom: '6px' }}>
                Special Privileges & Requests (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Courtyard view, feather pillows, late check-in, dietary preferences..."
                style={{ background: '#FFFFFF', border: '1px solid var(--border-color, #E8DFD1)', borderRadius: '8px' }}
              />
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--emerald, #0F3A2F)', marginBottom: '8px' }}>
                Choose Payment Option
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { id: 'Stripe', label: 'Credit / Debit Card (Stripe €)' },
                  { id: 'Pay at Hotel Desk', label: 'Pay at Hotel Desk' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: paymentMethod === m.id ? '2px solid var(--emerald, #0F3A2F)' : '1px solid var(--border-color, #E8DFD1)',
                      background: paymentMethod === m.id ? 'rgba(15, 58, 47, 0.08)' : '#FFFFFF',
                      color: paymentMethod === m.id ? 'var(--emerald, #0F3A2F)' : 'var(--text-muted, #5C6764)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway Information Notice */}
            {paymentMethod === 'Stripe' && (
              <div
                style={{
                  background: 'rgba(15, 58, 47, 0.06)',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(15, 58, 47, 0.15)',
                  marginBottom: '18px',
                  fontSize: '0.82rem',
                  color: 'var(--emerald, #0F3A2F)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
                  <CreditCardIcon size={16} /> Stripe Online Payment (€ EUR)
                </div>
                <span>
                  Your tariff in Indian Rupees (₹{inrTotal.toLocaleString('en-IN')}) will be processed on Stripe in Euros (€{eurTotal}) at standard conversion (€1 ≈ ₹110). Supports all international cards, Visa, MasterCard, and Amex.
                </span>
              </div>
            )}
            {paymentMethod === 'Pay at Hotel Desk' && (
              <div
                style={{
                  background: '#FEFCE8',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #FEF08A',
                  marginBottom: '18px',
                  fontSize: '0.82rem',
                  color: '#854D0E'
                }}
              >
                <strong>Pay upon Arrival:</strong> Your palace suite is reserved with Unpaid status. Settle your tariff in cash or card directly at the Aatithya concierge desk during check-in.
              </div>
            )}

            {/* Pricing Summary Card */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color, #E8DFD1)',
                padding: '18px 22px',
                borderRadius: '14px',
                marginBottom: '22px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted, #5C6764)', marginBottom: '6px' }}>
                <span>₹{inrRate.toLocaleString('en-IN')} &times; {nights} night{nights > 1 ? 's' : ''}</span>
                <span>₹{Math.round(subtotal * 83).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted, #5C6764)', marginBottom: '10px' }}>
                <span>Hospitality Luxury Tax (12%)</span>
                <span>₹{Math.round(taxAmount * 83).toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderTop: '1px solid var(--border-color, #E8DFD1)',
                  paddingTop: '10px'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--emerald, #0F3A2F)' }}>Total Due:</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--emerald, #0F3A2F)' }}>
                    ₹{inrTotal.toLocaleString('en-IN')}
                  </span>
                  {paymentMethod === 'Stripe' && (
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold, #B89047)', fontWeight: 600 }}>
                      Converted for Stripe: €{eurTotal} (€1 ≈ ₹110)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-emerald"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '16px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {submitting
                ? 'Confirming Royal Stay...'
                : paymentMethod === 'Stripe'
                ? `Confirm & Pay on Stripe (€${eurTotal} / ₹${inrTotal.toLocaleString('en-IN')})`
                : 'Confirm Reservation (Pay at Hotel Desk)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
