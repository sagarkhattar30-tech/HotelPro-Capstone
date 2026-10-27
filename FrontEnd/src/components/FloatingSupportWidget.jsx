import { useState } from 'react';

export default function FloatingSupportWidget({ onOpenSupport }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <button
        type="button"
        onClick={onOpenSupport}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open 24/7 Palace Concierge and Support Desk"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #0F3A2F 0%, #08241D 100%)',
          color: '#FAF7F2',
          border: '1.5px solid rgba(197, 160, 89, 0.7)',
          borderRadius: '999px',
          padding: '12px 20px',
          boxShadow: hovered
            ? '0 12px 30px rgba(15, 58, 47, 0.45), 0 0 15px rgba(197, 160, 89, 0.4)'
            : '0 8px 24px rgba(15, 58, 47, 0.35)',
          cursor: 'pointer',
          transform: hovered ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Pulse Indicator */}
        <span style={{ position: 'relative', display: 'flex', width: '10px', height: '10px' }}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#34d399',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
            }}
          />
          <span
            style={{
              position: 'relative',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
              background: '#10b981'
            }}
          />
        </span>

        {/* Insignia / Headset Icon */}
        <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>🛎️</span>

        {/* Text */}
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: '800',
              letterSpacing: '0.03em',
              color: '#FAF7F2',
              lineHeight: 1.1
            }}
          >
            24/7 Support
          </div>
          <div
            style={{
              fontSize: '0.68rem',
              color: '#C5A059',
              fontWeight: '600',
              lineHeight: 1
            }}
          >
            Palace Concierge
          </div>
        </div>
      </button>

      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
