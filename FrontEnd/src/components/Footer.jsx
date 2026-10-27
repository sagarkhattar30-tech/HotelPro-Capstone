import { useState } from 'react';
import { Link } from 'react-router-dom';
import AatithyaLogo from './AatithyaLogo';
import { useSupport } from '../context/SupportContext';

export default function Footer() {
  const { openSupport } = useSupport();
  const [email, setEmail] = useState('');
  const [subDone, setSubDone] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubDone(true);
      setTimeout(() => {
        setSubDone(false);
        setEmail('');
      }, 4000);
    }
  };

  const links = {
    Destinations: [
      { label: 'Jaipur &bull; Pink City Palaces', href: '/rooms?search=Jaipur' },
      { label: 'Udaipur &bull; Lake Pichola Estates', href: '/rooms?search=Udaipur' },
      { label: 'Kerala &bull; Backwaters & Ayurveda', href: '/rooms?search=Kerala' },
      { label: 'Varanasi &bull; Holy Ganges Ghats', href: '/rooms?search=Varanasi' },
      { label: 'Shimla &bull; Himalayan Cedar Manor', href: '/rooms?search=Shimla' },
      { label: 'Goa &bull; Portuguese Coastal Villas', href: '/rooms?search=Goa' },
    ],
    Suites: [
      { label: 'Presidential Palace Suite', href: '/rooms?type=Presidential Villa' },
      { label: 'Maharaja Haveli Penthouse', href: '/rooms?type=Penthouse' },
      { label: 'Royal Heritage Courtyard', href: '/rooms?type=Heritage Suite' },
      { label: 'Lagoon & Ocean Villas', href: '/rooms?type=Ocean Villa' },
      { label: 'Executive Diplomatic Suite', href: '/rooms?type=Executive Suite' },
      { label: 'Deluxe Heritage Chamber', href: '/rooms?type=Deluxe' },
    ],
    GuestServices: [
      { label: 'Explore Suites & Villas', href: '/rooms' },
      { label: 'My Reservations', href: '/my-bookings' },
      { label: 'Member Concierge', href: '/dashboard' },
      { label: 'Sign In / Register', href: '/login' },
    ],
  };

  return (
    <footer
      style={{
        background: 'var(--emerald, #0F3A2F)',
        color: 'var(--warm-ivory, #FAF7F2)',
        borderTop: '2px solid var(--gold, #C5A059)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle mandala background accent */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          border: '1px solid rgba(197,160,89,0.1)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '72px 32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr 1.1fr 1fr', gap: '48px', marginBottom: '56px' }}>

          {/* Brand & Ethos */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <AatithyaLogo variant="light" size="lg" />
            </div>

            <div style={{ width: '40px', height: '2px', background: 'var(--gold, #C5A059)', margin: '14px 0 16px' }} />

            <p
              style={{
                fontSize: '0.88rem',
                lineHeight: '1.8',
                color: 'rgba(250, 247, 242, 0.75)',
                maxWidth: '320px',
                marginBottom: '24px'
              }}
            >
              A tribute to timeless Indian hospitality. Where ancient royal traditions, thoughtful service, and opulent residences redefine modern luxury stays.
            </p>

            {/* Newsletter */}
            <div>
              <div
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.68rem',
                  letterSpacing: '0.18em',
                  color: 'var(--gold, #C5A059)',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}
              >
                Royal Dispatch & Privileges
              </div>
              {subDone ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--gold, #C5A059)', fontStyle: 'italic' }}>
                  Dhanyavaad. Your royal invitations will arrive promptly.
                </p>
              ) : (
                <form onSubmit={handleNewsletter} style={{ display: 'flex', maxWidth: '340px' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email for private invitations"
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(197, 160, 89, 0.4)',
                      borderRight: 'none',
                      color: 'var(--warm-ivory, #FAF7F2)',
                      padding: '12px 14px',
                      fontSize: '0.82rem',
                      outline: 'none',
                      borderRadius: '8px 0 0 8px'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: 'var(--gold, #C5A059)',
                      border: '1px solid var(--gold, #C5A059)',
                      color: 'var(--emerald, #0F3A2F)',
                      padding: '12px 18px',
                      cursor: 'pointer',
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      borderRadius: '0 8px 8px 0',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <div
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.72rem',
                  letterSpacing: '0.18em',
                  color: 'var(--gold, #C5A059)',
                  textTransform: 'uppercase',
                  marginBottom: '18px'
                }}
              >
                {title === 'Destinations' ? 'Heritage Destinations' : title === 'Suites' ? 'Curated Stays' : 'Guest Privileges'}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      dangerouslySetInnerHTML={{ __html: item.label }}
                      style={{
                        fontSize: '0.85rem',
                        color: 'rgba(250, 247, 242, 0.72)',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        display: 'inline-block'
                      }}
                      onMouseEnter={(e) => (e.target.style.color = 'var(--gold, #C5A059)')}
                      onMouseLeave={(e) => (e.target.style.color = 'rgba(250, 247, 242, 0.72)')}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact strip */}
        <div
          style={{
            padding: '28px 0',
            borderTop: '1px solid rgba(197, 160, 89, 0.2)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '32px'
          }}
        >
          {[
            { label: 'Royal Reservations & Support', value: '+91 (11) 4567-8900 / 1800-AATITHYA', action: () => openSupport() },
            { label: 'Guest Relations & Concierge', value: 'concierge@aatithya-hotels.com', action: () => openSupport('Other') },
            { label: 'Heritage Headquarters', value: 'Udaivilas Road, Udaipur, Rajasthan 313001', href: null },
          ].map((c, i) => (
            <div key={i}>
              <div
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.62rem',
                  letterSpacing: '0.16em',
                  color: 'var(--gold, #C5A059)',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}
              >
                {c.label}
              </div>
              {c.action ? (
                <button
                  type="button"
                  onClick={c.action}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.85rem',
                    color: 'var(--warm-ivory, #FAF7F2)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'color 0.2s',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px'
                  }}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--gold, #C5A059)')}
                  onMouseLeave={(e) => (e.target.style.color = 'var(--warm-ivory, #FAF7F2)')}
                >
                  {c.value} (Click for Help)
                </button>
              ) : c.href ? (
                <a
                  href={c.href}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--warm-ivory, #FAF7F2)',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--gold, #C5A059)')}
                  onMouseLeave={(e) => (e.target.style.color = 'var(--warm-ivory, #FAF7F2)')}
                >
                  {c.value}
                </a>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'rgba(250, 247, 242, 0.85)' }}>
                  {c.value}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(250, 247, 242, 0.5)' }}>
            &copy; {new Date().getFullYear()} Aatithya Hospitality Group India Pvt Ltd. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy Policy', 'Terms of Luxury Stays', 'Ayurvedic Wellness Guidelines', 'Security & Stripe'].map((t) => (
              <span
                key={t}
                style={{
                  color: 'rgba(250, 247, 242, 0.5)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--gold, #C5A059)')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(250, 247, 242, 0.5)')}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
