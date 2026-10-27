/**
 * AATITHYA (आतिथ्य) — Royal Indian Heritage Brand Logo
 * Features a bespoke gold & emerald royal jharokha arch crest with lotus bloom & sacred kalash geometry.
 */
export default function AatithyaLogo({
  variant = 'default', // 'default' (dark emerald text for ivory/light bg) or 'light' (gold/ivory text for dark bg)
  size = 'md',        // 'sm', 'md', 'lg'
  showTagline = true,
  className = ''
}) {
  const isLight = variant === 'light';

  // Dimension presets
  const dims = {
    sm: { iconSize: 34, titleSize: '1.05rem', subSize: '0.55rem', gap: '10px' },
    md: { iconSize: 42, titleSize: '1.28rem', subSize: '0.62rem', gap: '12px' },
    lg: { iconSize: 56, titleSize: '1.75rem', subSize: '0.72rem', gap: '16px' }
  }[size] || { iconSize: 42, titleSize: '1.28rem', subSize: '0.62rem', gap: '12px' };

  const textColor = isLight ? '#FAF7F2' : '#0F3A2F';
  const subColor = isLight ? '#C5A059' : '#C15336';

  return (
    <div
      className={`aatithya-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dims.gap,
        userSelect: 'none',
        lineHeight: 1
      }}
    >
      {/* ── Bespoke Royal Jharokha Crest SVG Insignia ── */}
      <svg
        width={dims.iconSize}
        height={dims.iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(197, 160, 89, 0.35))' }}
        aria-hidden="true"
      >
        <defs>
          {/* 24K Royal Gold Gradient */}
          <linearGradient id="aatithyaGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6E7C1" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#8F6B23" />
          </linearGradient>

          {/* Deep Royal Emerald Background Gradient */}
          <linearGradient id="aatithyaEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#175040" />
            <stop offset="50%" stopColor="#0F3A2F" />
            <stop offset="100%" stopColor="#08221B" />
          </linearGradient>

          {/* Inner Glow Radial */}
          <radialGradient id="aatithyaGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.35)" />
            <stop offset="100%" stopColor="rgba(15, 58, 47, 0)" />
          </radialGradient>
        </defs>

        {/* Shield / Medallion Base */}
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="14"
          fill="url(#aatithyaEmerald)"
          stroke="url(#aatithyaGold)"
          strokeWidth="1.5"
        />

        {/* Inner Filigree Border */}
        <rect
          x="6.5"
          y="6.5"
          width="51"
          height="51"
          rx="11"
          fill="url(#aatithyaGlow)"
          stroke="url(#aatithyaGold)"
          strokeWidth="0.75"
          strokeDasharray="2 1.5"
          opacity="0.75"
        />

        {/* Top Pinnacle Sunburst / Jewel */}
        <circle cx="32" cy="11.5" r="2.2" fill="url(#aatithyaGold)" />
        <path
          d="M32 8 L32 10.5 M32 12.5 L32 15 M29 11.5 L31 11.5 M33 11.5 L35 11.5"
          stroke="url(#aatithyaGold)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Imperial Palace Jharokha Arch */}
        <path
          d="M17 48 V33 C17 23 23 18 32 16 C41 18 47 23 47 33 V48"
          fill="none"
          stroke="url(#aatithyaGold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Royal Multi-Cusp Scalloped Arch */}
        <path
          d="M21 48 V35 C21 31 23 28 26 26 C28 24 30 23 32 21 C34 23 36 24 38 26 C41 28 43 31 43 35 V48"
          fill="none"
          stroke="url(#aatithyaGold)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Sacred Blooming Lotus (Central Motif) */}
        {/* Center Petal */}
        <path
          d="M32 29 C30.5 34 31 38 32 43 C33 38 33.5 34 32 29 Z"
          fill="url(#aatithyaGold)"
        />
        {/* Left Petal */}
        <path
          d="M32 43 C28 40 24.5 35 26.5 31 C28.5 34 30.5 38 32 43 Z"
          fill="url(#aatithyaGold)"
          opacity="0.9"
        />
        {/* Right Petal */}
        <path
          d="M32 43 C36 40 39.5 35 37.5 31 C35.5 34 33.5 38 32 43 Z"
          fill="url(#aatithyaGold)"
          opacity="0.9"
        />
        {/* Outer Left Leaf */}
        <path
          d="M32 44 C25 43 21 38 22 34 C24 37 28 41 32 44 Z"
          fill="url(#aatithyaGold)"
          opacity="0.75"
        />
        {/* Outer Right Leaf */}
        <path
          d="M32 44 C39 43 43 38 42 34 C40 37 36 41 32 44 Z"
          fill="url(#aatithyaGold)"
          opacity="0.75"
        />

        {/* Ornate Plinth / Kalash Base */}
        <path
          d="M20 48 H44 M23 51 H41 M27 54 H37"
          stroke="url(#aatithyaGold)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Four Corner Diamond Accents */}
        <circle cx="11" cy="11" r="1.2" fill="url(#aatithyaGold)" />
        <circle cx="53" cy="11" r="1.2" fill="url(#aatithyaGold)" />
        <circle cx="11" cy="53" r="1.2" fill="url(#aatithyaGold)" />
        <circle cx="53" cy="53" r="1.2" fill="url(#aatithyaGold)" />
      </svg>

      {/* ── Brand Wordmark & Heritage Subtitle ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
              fontSize: dims.titleSize,
              fontWeight: 700,
              letterSpacing: '0.28em',
              color: textColor,
              textTransform: 'uppercase',
              display: 'inline-block',
              transition: 'color 0.2s ease'
            }}
          >
            AATITHYA
          </span>
        </div>

        {showTagline && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: dims.subSize,
              letterSpacing: '0.16em',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: subColor,
              whiteSpace: 'nowrap'
            }}
          >
            <span>Atithi Devo Bhava</span>
            <span style={{ fontSize: '0.5rem', opacity: 0.6 }}>&bull;</span>
            <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>अतिथि देवो भव</span>
          </div>
        )}
      </div>
    </div>
  );
}
