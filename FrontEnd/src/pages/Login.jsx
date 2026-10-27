import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const res = await axiosClient.post('/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        minHeight: 'calc(100vh - 84px)',
        marginTop: '84px',
        background: 'var(--warm-ivory, #FAF7F2)'
      }}
    >
      {/* Left — Heritage Palace Image Panel */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop"
          alt="Aatithya Royal Residence"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(15,58,47,0.75) 0%, rgba(15,58,47,0.4) 60%, rgba(193,83,54,0.4) 100%)'
          }}
        />

        {/* Heritage branding overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '56px'
          }}
        >
          {/* Bottom Hero Message */}
          <div>
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem',
                letterSpacing: '0.22em',
                color: 'var(--gold, #C5A059)',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}
            >
              Royal Hospitality
            </div>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2.8rem',
                fontWeight: 600,
                color: '#FFFFFF',
                lineHeight: 1.15,
                maxWidth: '420px',
                marginBottom: '16px'
              }}
            >
              Your journey of <em style={{ color: 'var(--gold, #C5A059)' }}>timeless luxury</em> awaits.
            </h2>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.7',
                maxWidth: '400px'
              }}
            >
              Sign in to manage your confirmed palace suites, private chauffeured transfers, and curated royal dining.
            </p>
          </div>
        </div>
      </div>

      {/* Right — Form Panel with Warm Ivory & Emerald */}
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
          {/* Form Header */}
          <div style={{ marginBottom: '32px' }}>
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
              Member Sign In
            </span>
            <h1
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2.4rem',
                fontWeight: 600,
                color: 'var(--emerald, #0F3A2F)',
                lineHeight: 1.15,
                margin: '8px 0 6px'
              }}
            >
              Welcome back to <em style={{ color: 'var(--terracotta, #C15336)' }}>Aatithya</em>
            </h1>
            <p style={{ color: 'var(--text-muted, #5C6764)', fontSize: '0.9rem', margin: 0 }}>
              Enter your credentials to access your luxury dashboard.
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
                marginBottom: '24px'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--emerald, #0F3A2F)',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="name@domain.com"
                className="form-input"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color, #E8DFD1)',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--emerald, #0F3A2F)',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="form-input"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color, #E8DFD1)',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem'
                }}
              />
            </div>

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
              <span>{loading ? 'Authenticating...' : 'Sign In to Aatithya'}</span>
            </button>
          </form>

          {/* Quick Demo Access */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border-color, #E8DFD1)'
            }}
          >
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.68rem',
                letterSpacing: '0.14em',
                color: 'var(--text-muted, #5C6764)',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              Quick Demo Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { label: 'Admin', email: 'admin@hotelpro.com', pw: 'admin123' },
                { label: 'Staff', email: 'staff@hotelpro.com', pw: 'staff123' },
                { label: 'Guest', email: 'guest@hotelpro.com', pw: 'guest123' },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setForm({ email: d.email, password: d.pw })}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color, #E8DFD1)',
                    color: 'var(--emerald, #0F3A2F)',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--emerald, #0F3A2F)';
                    e.currentTarget.style.background = 'rgba(15, 58, 47, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color, #E8DFD1)';
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <p
            style={{
              marginTop: '28px',
              fontSize: '0.85rem',
              color: 'var(--text-muted, #5C6764)',
              textAlign: 'center'
            }}
          >
            New to Aatithya?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--emerald, #0F3A2F)',
                fontWeight: 700,
                textDecoration: 'none',
                borderBottom: '1px solid var(--emerald, #0F3A2F)'
              }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
