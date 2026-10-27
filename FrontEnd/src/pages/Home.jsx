import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { StarIcon } from '../components/Icons';

/* ── Tiny count-up animation hook ── */
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const tick = () => {
        start = Math.min(start + step, target);
        setCount(Math.floor(start));
        if (start < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [count, ref];
}

const INDIAN_DESTINATIONS = [
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    tag: 'The Pink City',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
    description: 'Amber sandstone forts, royal polo grounds, and opulent regal courtyards.'
  },
  {
    city: 'Udaipur',
    state: 'Rajasthan',
    tag: 'City of Lakes',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop',
    description: 'Majestic marble palaces floating amidst shimmering Pichola waters.'
  },
  {
    city: 'Kerala',
    state: 'God’s Own Country',
    tag: 'Backwater Sanctuaries',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
    description: 'Tranquil palm-fringed lagoons, organic spice estates, and Ayurvedic spas.'
  },
  {
    city: 'Ranthambore',
    state: 'Rajasthan',
    tag: 'Royal Wilderness',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=800&auto=format&fit=crop',
    description: 'Imperial luxury safari pavilions overlooking historic tiger territories.'
  },
  {
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    tag: 'Sacred Heritage',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop',
    description: 'Timeless spiritual ghats on the holy Ganges with private dusk Aarti rituals.'
  },
  {
    city: 'Goa',
    state: 'Konkan Coast',
    tag: 'Heritage Mansions',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
    description: 'Portuguese colonial villas nestled along golden sun-drenched sands.'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString().split('T')[0];
  });
  const [roomType, setRoomType] = useState('All');
  const [guests, setGuests] = useState('2');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [heroLoaded, setHeroLoaded] = useState(false);

  const [c1, r1] = useCountUp(18);
  const [c2, r2] = useCountUp(54);
  const [c3, r3] = useCountUp(12500);
  const [c4, r4] = useCountUp(99);

  useEffect(() => {
    axiosClient.get('/api/hotels')
      .then(res => { if (Array.isArray(res.data)) setHotels(res.data); })
      .catch(() => {});

    axiosClient.get('/api/rooms?featured=true')
      .then(res => { if (Array.isArray(res.data)) setRooms(res.data.slice(0, 6)); })
      .catch(() => {});

    setTimeout(() => setHeroLoaded(true), 120);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let q = `/rooms?type=${encodeURIComponent(roomType)}&capacity=${guests}&checkIn=${checkIn}&checkOut=${checkOut}`;
    if (selectedDestination !== 'All') q += `&search=${encodeURIComponent(selectedDestination)}`;
    navigate(q);
  };

  const formatINR = (usdAmount) => {
    const inr = Math.round(Number(usdAmount || 0) * 83);
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-main)', minHeight: '100vh' }}>

      {/* ══════════════════════════════════════════════════════
          HERO — Royal Heritage Cinematic Showcase
          ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background Heritage Imagery */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop"
            alt="Aatithya Royal Palace"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
          />
          {/* Warm Ivory to Emerald Gradient Overlay (Luminous, not pitch black) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(105deg, rgba(250,247,242,0.96) 0%, rgba(250,247,242,0.85) 45%, rgba(15,58,47,0.38) 100%)'
          }} />
        </div>

        {/* Content Box */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px', padding: '120px 48px 80px 80px' }}>
          {/* Heritage Crest + Tagline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.8s, transform 0.8s'
          }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--terracotta)' }}>ॐ</span>
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.72rem',
              letterSpacing: '0.24em',
              color: 'var(--emerald-800)',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              आतिथ्य &bull; Atithi Devo Bhava
            </span>
          </div>

          {/* Main Royal Heading */}
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)',
            fontWeight: 400,
            lineHeight: 1.08,
            color: 'var(--emerald-900)',
            marginBottom: '24px',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.9s 0.15s, transform 0.9s 0.15s'
          }}>
            Where Royal Heritage<br />
            <em style={{ color: 'var(--terracotta)', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>Breathes Timeless</em><br />
            Hospitality
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-body)',
            lineHeight: 1.8,
            maxWidth: '560px',
            marginBottom: '36px',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'none' : 'translateY(18px)',
            transition: 'opacity 0.9s 0.25s, transform 0.9s 0.25s'
          }}>
            From historic Rajputana palaces and serene Kerala backwater sanctuaries to Himalayan havens — step into an extraordinary world where every guest is honored as divine.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.9s 0.35s, transform 0.9s 0.35s'
          }}>
            <Link to="/rooms" className="btn-gold" style={{ padding: '14px 32px', fontSize: '0.9rem' }}>
              <span>Explore Heritage Suites</span>
            </Link>
            <a href="#destinations" className="btn-outline-gold" style={{ padding: '14px 28px', fontSize: '0.9rem' }}>
              Popular Indian Destinations
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HERITAGE SEARCH BAR — Floating & Responsive
          ══════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: '1200px', margin: '-40px auto 70px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(15, 58, 47, 0.12)',
          border: '1.5px solid var(--gold-border)',
          overflow: 'hidden'
        }}>
          <form onSubmit={handleSearch} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr)) auto',
            alignItems: 'center'
          }}>
            {/* Destination */}
            <div style={{ padding: '20px 24px', borderRight: '1px solid rgba(15,58,47,0.08)' }}>
              <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.16em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Destination
              </label>
              <select
                className="form-select"
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
                style={{ border: 'none', padding: '0', background: 'transparent', fontWeight: 600, color: 'var(--emerald-900)' }}
              >
                <option value="All">All Royal Destinations</option>
                <option value="Jaipur">Jaipur, Rajasthan</option>
                <option value="Udaipur">Udaipur, Rajasthan</option>
                <option value="Kerala">Kerala Backwaters</option>
                <option value="Shimla">Shimla Hills</option>
                <option value="Ranthambore">Ranthambore</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Goa">Goa Heritage</option>
                {hotels.map(h => <option key={h._id} value={h.city}>{h.name} ({h.city})</option>)}
              </select>
            </div>

            {/* Check-In */}
            <div style={{ padding: '20px 24px', borderRight: '1px solid rgba(15,58,47,0.08)' }}>
              <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.16em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Arrival Check-In
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setCheckIn(e.target.value)}
                style={{ border: 'none', padding: '0', background: 'transparent', fontWeight: 600, color: 'var(--emerald-900)', width: '100%', outline: 'none' }}
              />
            </div>

            {/* Check-Out */}
            <div style={{ padding: '20px 24px', borderRight: '1px solid rgba(15,58,47,0.08)' }}>
              <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.16em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Departure Check-Out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={e => setCheckOut(e.target.value)}
                style={{ border: 'none', padding: '0', background: 'transparent', fontWeight: 600, color: 'var(--emerald-900)', width: '100%', outline: 'none' }}
              />
            </div>

            {/* Suite Type */}
            <div style={{ padding: '20px 24px', borderRight: '1px solid rgba(15,58,47,0.08)' }}>
              <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.16em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Residence Type
              </label>
              <select
                className="form-select"
                value={roomType}
                onChange={e => setRoomType(e.target.value)}
                style={{ border: 'none', padding: '0', background: 'transparent', fontWeight: 600, color: 'var(--emerald-900)' }}
              >
                <option value="All">All Suites & Havelis</option>
                <option value="Presidential Villa">Presidential Villa</option>
                <option value="Heritage Suite">Heritage Suite</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Ocean Villa">Ocean Villa</option>
                <option value="Executive Suite">Executive Suite</option>
              </select>
            </div>

            {/* Guests */}
            <div style={{ padding: '20px 24px' }}>
              <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.16em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Guests
              </label>
              <select
                className="form-select"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                style={{ border: 'none', padding: '0', background: 'transparent', fontWeight: 600, color: 'var(--emerald-900)' }}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="4">4 Guests</option>
                <option value="6">6+ Royal Guests</option>
              </select>
            </div>

            {/* Search CTA */}
            <div style={{ padding: '16px' }}>
              <button
                type="submit"
                className="btn-gold"
                style={{ height: '56px', padding: '0 32px', width: '100%', borderRadius: '10px', fontSize: '0.9rem' }}
              >
                <span>Check Tariffs</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          POPULAR INDIAN DESTINATIONS SHOWCASE
          ══════════════════════════════════════════════════════ */}
      <section id="destinations" style={{ maxWidth: '1200px', margin: '0 auto 90px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.22em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase' }}>
            Sacred Geography
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: 'var(--emerald-900)', margin: '8px 0 12px' }}>
            Popular Indian Destinations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
            Immerse yourself in India’s most celebrated cultural jewels, from desert dynasties to tranquil coastal waters.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {INDIAN_DESTINATIONS.map((dest) => (
            <div
              key={dest.city}
              onClick={() => navigate(`/rooms?search=${encodeURIComponent(dest.city)}`)}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(197,160,89,0.22)',
                boxShadow: 'var(--shadow-md)',
                cursor: 'pointer',
                transition: 'transform 0.3s var(--ease-expo), box-shadow 0.3s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img
                  src={dest.image}
                  alt={dest.city}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(10,38,30,0.85)',
                  backdropFilter: 'blur(4px)',
                  color: 'var(--gold-light)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em'
                }}>
                  {dest.tag}
                </span>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {dest.state}
                </span>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: 'var(--emerald-900)', margin: '4px 0 8px' }}>
                  {dest.city}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                  {dest.description}
                </p>
                <div style={{ marginTop: '14px', color: 'var(--emerald-800)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Explore Residences &rarr;
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CURATED STAYS & SIGNATURE SUITES
          ══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--bg-secondary)', padding: '90px 24px', borderTop: '1px solid rgba(197,160,89,0.2)', borderBottom: '1px solid rgba(197,160,89,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase' }}>
                Signature Collection
              </p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: 'var(--emerald-900)', margin: '6px 0 0' }}>
                Curated Royal Residences
              </h2>
            </div>
            <Link to="/rooms" className="btn-outline-gold">
              View All 50+ Suites &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
            {rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
                Loading verified palace suites...
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(197,160,89,0.22)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                      <img
                        src={room.image || room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop'}
                        alt={room.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(10,38,30,0.88)',
                        backdropFilter: 'blur(4px)',
                        color: '#FAF7F2',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        Suite #{room.roomNumber} &bull; {room.city || 'Heritage'}
                      </span>
                      {room.images && room.images.length > 1 && (
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(10,38,30,0.88)',
                          backdropFilter: 'blur(4px)',
                          color: 'var(--gold, #C5A059)',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          border: '1px solid rgba(197, 160, 89, 0.4)'
                        }}>
                          📷 {room.images.length} Photos
                        </span>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '4px'
                      }}>
                        <strong style={{ color: 'var(--emerald-800)', fontSize: '1.05rem' }}>{formatINR(room.pricePerNight)}</strong>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ night</span>
                      </div>
                    </div>

                    <div style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} size={12} color={i < Math.floor(room.rating || 5) ? '#C5A059' : '#D1D5DB'} />
                        ))}
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 600 }}>
                          {room.rating || 4.9} ({room.reviewCount || 18} reviews)
                        </span>
                      </div>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.45rem', color: 'var(--emerald-900)', margin: '0 0 6px' }}>
                        {room.name}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
                        {room.description?.substring(0, 95)}…
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '16px 24px 20px', borderTop: '1px solid rgba(15,58,47,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Accommodates up to {room.capacity} guests
                    </span>
                    <Link
                      to={`/rooms?search=${encodeURIComponent(room.name)}`}
                      className="btn-gold"
                      style={{ padding: '8px 18px', fontSize: '0.78rem' }}
                    >
                      <span>Reserve</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          THE FOUR PILLARS OF AATITHYA
          ══════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.22em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase' }}>
            Heritage Philosophy
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: 'var(--emerald-900)', margin: '8px 0 12px' }}>
            The Four Pillars of Aatithya
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto' }}>
            Centuries of royal Indian hospitality woven into modern luxury, honoring the timeless Vedic tenet: *Atithi Devo Bhava*.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
          {[
            {
              symbol: '⚜️',
              title: 'Shahi Swagat',
              sub: 'Imperial Welcome Ritual',
              desc: 'Garland greeting, traditional Aarti ceremony, and chilled sandalwood elixirs upon arrival.'
            },
            {
              symbol: '🍽️',
              title: 'Raj-Gharana Rasoi',
              sub: 'Imperial Fine Dining',
              desc: 'Heritage recipes perfected in royal kitchens of Mewar, Awadh, and Hyderabad.'
            },
            {
              symbol: '🌿',
              title: 'Ayur Wellness',
              sub: 'Holistic Sanctuaries',
              desc: 'Authentic Ayurvedic therapy, bespoke organic herbal botanicals, and yoga pavilions.'
            },
            {
              symbol: '🚗',
              title: 'Royal Chauffeur',
              sub: 'Bespoke Concierge',
              desc: 'Vintage luxury fleet, private palace tours, and starlit private lake cruises.'
            }
          ].map((pillar, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px 28px',
                border: '1px solid rgba(197,160,89,0.25)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>{pillar.symbol}</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--emerald-900)', margin: '0 0 4px' }}>
                {pillar.title}
              </h3>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
                {pillar.sub}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.65, margin: 0 }}>
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATISTICS COUNTERS
          ══════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--emerald-900)', color: '#FAF7F2', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {[
            { ref: r1, count: c1, suffix: '+', label: 'Historic Palaces & Havelis' },
            { ref: r2, count: c2, suffix: '+', label: 'Curated Heritage Suites' },
            { ref: r3, count: c3, suffix: '+', label: 'Honored Royal Guests' },
            { ref: r4, count: c4, suffix: '%', label: 'Forbes & Condé Nast Accolade' }
          ].map((stat, i) => (
            <div key={i} ref={stat.ref} style={{ padding: '12px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3.2rem', fontWeight: 600, color: 'var(--gold-light)', lineHeight: 1, marginBottom: '6px' }}>
                {stat.count.toLocaleString()}{stat.suffix}
              </div>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.68rem', letterSpacing: '0.14em', color: '#FAF7F2', textTransform: 'uppercase', margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
