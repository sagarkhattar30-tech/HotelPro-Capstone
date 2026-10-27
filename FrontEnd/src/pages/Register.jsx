import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      /* ignore */
    }
    if (token && user) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/api/auth/register', { ...form, role: 'Guest' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Maharaja / Maharani Name' },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.1fr',
        minHeight: 'calc(100vh - 84px)',
        marginTop: '84px',
        background: 'var(--warm-ivory, #FAF7F2)'
      }}
    >
      {/* Left Form Panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 56px',
          background: 'var(--warm-ivory, #FAF7F2)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '28px' }}>
            <span
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                color: 'var(--terracotta, #C15336)',
                textTransform: 'uppercase',
                fontWeight: 700
              }}
            >
              Royal Membership
            </span>
            <h1
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2.4rem',
                fontWeight: 600,
                color: 'var(--emerald, #0F3A2F)',
                lineHeight: 1.15,
                margin: '6px 0'
              }}
            >
              Begin your <em style={{ color: 'var(--terracotta, #C15336)' }}>journey</em>
            </h1>
            <p style={{ color: 'var(--text-muted, #5C6764)', fontSize: '0.9rem', margin: 0 }}>
              Join the Aatithya Privileges Circle for member rates and bespoke benefits.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: '0.85rem',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {fields.map((f) => (
              <div key={f.key}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--emerald, #0F3A2F)',
                    textTransform: 'uppercase',
                    marginBottom: '6px'
                  }}
                >
                  {f.label}
                </label>
                <input
                  type={f.type}
                  required={f.key !== 'phone'}
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="form-input"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color, #E8DFD1)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-emerald"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '16px',
                fontSize: '0.95rem',
                fontWeight: 600,
                marginTop: '10px',
                cursor: 'pointer'
              }}
            >
              <span>{loading ? 'Creating Royal Account…' : 'Create Account'}</span>
            </button>
          </form>

          <p
            style={{
              marginTop: '24px',
              fontSize: '0.85rem',
              color: 'var(--text-muted, #5C6764)',
              textAlign: 'center'
            }}
          >
            Already an Aatithya member?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--emerald, #0F3A2F)',
                fontWeight: 700,
                textDecoration: 'none',
                borderBottom: '1px solid var(--emerald, #0F3A2F)'
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Image & Privileges Panel */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop"
          alt="Aatithya Royal Heritage"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,58,47,0.92) 0%, rgba(15,58,47,0.5) 50%, rgba(15,58,47,0.3) 100%)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '48px',
            right: '48px',
            color: '#FFFFFF'
          }}
        >
          <div
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              color: 'var(--gold, #C5A059)',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}
          >
            Circle of Royal Privileges
          </div>
          <h3
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2rem',
              fontWeight: 600,
              margin: '0 0 16px',
              lineHeight: 1.2
            }}
          >
            Distinctive Hospitality across India's Premier Heritage Addresses
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { title: 'Best Rate Guarantee', desc: 'Complimentary high-speed WiFi & breakfast' },
              { title: 'Royal Welcome Swagat', desc: 'Garland, aarti & ceremonial tikka arrival' },
              { title: 'Heritage Dining Privilege', desc: 'Priority reservations at royal rasois' },
              { title: '24/7 Dedicated Concierge', desc: 'Bespoke palace tours & local excursions' },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(197, 160, 89, 0.3)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gold, #C5A059)', marginBottom: '2px' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
